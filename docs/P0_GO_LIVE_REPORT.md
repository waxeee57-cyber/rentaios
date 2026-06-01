# P0 Security — Closing-Phase Report (live proof)

**Branch:** `fix/p0-security-rls` · **Date:** 2026-05-31 · **Author:** autonomous run (loki)
**Prod project:** `bnjnoofcyjldvygupvgp` (read-only throughout) · **Dev branch used for all writes:** `rjbhzbxagwqjteclgjvz` (Supabase branch `p0-proof`, deleted after proof)

> This supersedes the "pending CI" status in `P0_SECURITY_REPORT.md` and the
> go-live section of `BASE_SCHEMA_RUNBOOK.md §5`. The red→green proof was
> executed live on a disposable Supabase dev branch. **Nothing was written to prod.**

---

## 0. Headline — two facts that changed the plan

1. **Prod was never built from the migration chain.** `list_migrations(bnjnoofcyjldvygupvgp)` → **`[]`** (empty history). Prod schema was assembled ad-hoc (schema.sql + manual SQL / dashboard). → a plain `supabase db push` against prod would try to replay **01→17 on a live DB** and conflict. The old runbook's `migration repair --status applied 01 01b` is **insufficient**.
2. **Migration 16 is already effectively LIVE on prod.** The anon chat SELECT policies are already dropped, and `business_config`/`subscriptions`/`referrals` already have RLS enabled deny-by-default. **The P0 chat PII leak is already closed.** Remaining prod gap is **migration 17 only** (admin_users `user_id`+`email`) plus the owner's `admin_users` row.

Prod currently holds **18 real conversations / 52 real messages** — so the chat leak was a genuine live-PII exposure while it was open; it is now closed.

---

## Task A — login root cause, CONFIRMED (read-only prod)

### A.1 admin_users schema drift — confirmed
`information_schema.columns` for `public.admin_users` on prod:

| column | type |
|---|---|
| id | uuid |
| role | text |
| full_name | text |
| created_at | timestamptz |

**No `user_id`, no `email`.** `lib/auth.ts` `requireAdmin` runs `admin_users.select('id, email').eq('user_id', uid)` and the admin layout `.eq('user_id', uid)` → PostgREST **`42703`** → admin **fails closed after a successful auth login** (a post-login 403 / redirect-to-login, *not* the 400). Reproduced live on the branch (see C.3). Migration 17 not yet applied to prod.

### A.2 Single admin row — confirmed correctly linked
`select id, role, full_name from admin_users` → exactly one row:
`6a2eb005-aa24-45fe-a24f-939fec7a3cbc · admin · Dominik`.
That `id` **equals** `dominik.ihm@gmail.com`'s `auth.users.id` → correctly linked.

### A.3 auth.users — all three confirmed
| email | id | confirmed | last_sign_in |
|---|---|---|---|
| waxeee57@gmail.com | 3d6fdb44-… | yes | 2026-05-13 |
| dominik.ihm@gmail.com | 6a2eb005-… | yes | 2026-05-12 |
| waxee@icloud.com | fac5e812-… | yes | 2026-05-31 16:50 |

### A.4 Auth logs (`get_logs service=auth`) — the whole story
- **`422 email_provider_disabled`** burst 16:47–16:48 → a GoTrue config reload at **16:49** re-enabled email login.
- After re-enable: **`200` password logins** for `waxee@icloud.com` (16:49:34 / 16:50:11 / 16:50:38).
- **`400 invalid_credentials`** at 16:45 and 16:50:09 → genuine wrong-password attempts (the two similar emails — `waxeee57@gmail.com` vs `waxee@icloud.com` — being mixed up).
- `service_role` created `waxee@icloud.com` via `/admin/users` at 16:47:50; `waxeee57@gmail.com` only token-refreshes (existing session).

**Conclusion:** the GoTrue auth layer now works (the 422 window is gone; correct credentials get 200). The *admin-panel* failure is the separate two-part app problem: (1) `admin_users` drift (fixed by 17), and (2) `waxee@icloud.com` has **no `admin_users` row at all** yet. **No agent password was set.**

### A.5 `get_advisors(security)` — open prod warnings (with remediation links, by priority)

**Priority 1 — fix promptly**
- **`SECURITY DEFINER` function executable by `anon`:** `public.rls_auto_enable()` is callable unauthenticated via `/rest/v1/rpc/rls_auto_enable`. Revoke `EXECUTE` from `anon`/`authenticated` or switch to `SECURITY INVOKER`. → https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable (and `…lint=0029` for the `authenticated` variant).

**Priority 2 — hardening**
- **Leaked-password protection disabled** (HaveIBeenPwned check off). → https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- **Mutable `search_path`** on 4 functions: `update_business_config_updated_at`, `set_client_leads_updated_at`, `set_updated_at`, `upsert_customer`. Set `search_path = ''` (or pinned). → https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
- **Extension in `public`:** `btree_gist` — move to a dedicated schema. → https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public

**Priority 3 — review / accept**
- **`rls_policy_always_true`** on `auth_all_conversations` / `auth_all_messages` (`ALL` to `authenticated`, `USING true`) — intentional admin full-access; acceptable. `page_events.insert_only` (`anon` INSERT) — intentional first-party analytics. → https://supabase.com/docs/guides/database/database-linter?lint=0024_permissive_rls_policy
- **`rls_enabled_no_policy`** (INFO) on `bookings`, `customers`, `business_config`, `subscriptions`, `referrals`, `client_leads`, `leads`, `waitlist`, `agency_clients`, `cold_email_leads`, `template_sales`, `subscription_addons`, `*_documents` — this is the **intended deny-by-default** for service-role-only tables and is exactly what the P0 lockdown produces. **Not** a vulnerability. → https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

> Notably, **no advisor flags anon SELECT on chat** — independent confirmation that the chat PII leak is closed on prod.

---

## Task B — full chain 01→17 builds from an empty DB (dev branch)

The Supabase branch started **empty** (`public_tables = 0` — confirming prod's empty history replays nothing). Applied **01_base_schema → 01b_base_policies → 02 … → 17** in order via `apply_migration`; **every step returned `success`**. Final branch state:

- `list_migrations(branch)` → **18 rows, 01→17 in order** (01, 01b, 02…17).
- **20 base tables** built from zero.
- `admin_users` after 17 contains **both `user_id` and `email`** (asserted: `a_admin_cols_present = 2`).
- Admin auth-flow **resolves with no 42703** (C.3).

This is exactly what the `01_base_schema` + `01b_base_policies` bootstrap was added to guarantee.

---

## Task C — P0 red→green proof (dev branch, real seeded PII)

Seeded one real-looking row set (so "empty" can't be mistaken for "blocked"):
`chat_conversations(visitor_email='victim@example.com')`, one `chat_messages` body with a phone + card fragment, one `referrals`, plus the default `subscriptions` row.

### C.1 RED — pre-16, read as the `anon` role (`SET LOCAL ROLE anon`)
```
phase = PRE-16 (anon role)
anon_conversations = 1   leaked_emails  = victim@example.com
anon_messages      = 1   leaked_bodies  = My phone is +34 600 123 456 and card ends 4242
anon_subscriptions = 1
anon_referrals     = 1
```
→ The public anon role reads visitor PII, message bodies, billing and referral rows. **Leak reproduced live.**

### C.2 GREEN — after applying 16, same anon probe
```
phase = POST-16 (anon role)
anon_conversations = 0   anon_messages = 0   anon_subscriptions = 0   anon_referrals = 0
```
Service role still sees the rows (`svc_conversations = 1`, `svc_referrals = 1`) → GREEN is **"blocked", not "empty"**.

### C.3 admin drift RED→GREEN
- **RED (pre-17):** `SELECT id, email FROM admin_users WHERE user_id = …` →
  `ERROR: 42703: column "email" does not exist`.
- **GREEN (post-17):** after seeding a synthetic `auth.users` row mirroring the prod plan (`waxee@icloud.com` / `fac5e812-…`) and the `admin-seed.sql` link, the exact `requireAdmin` query resolves:
  `a_requireadmin_email = waxee@icloud.com`, `a_access_locked_present = 1`, visitor own-thread readback `b_messages = 1`. **No 42703.**

### C.4 Smoke acceptance (a–e equivalent) — ALL GREEN
| assert | result |
|---|---|
| a) admin_users.user_id+email & subscriptions.access_locked resolve | ✅ cols=2, access_locked present, requireAdmin returns the row |
| b) visitor stores + reads back own conversation/message (service path) | ✅ convo present, 1 message |
| c) anon CANNOT read chat | ✅ 0 / 0 |
| d) anon CANNOT read subscriptions / referrals | ✅ 0 / 0 |
| e) migrations 16 + 17 exist on disk | ✅ both present in `supabase/migrations` |

### C.5 Branch post-16 policy snapshot == prod's current state
| table | rls_enabled | policies |
|---|---|---|
| business_config | true | (none) |
| chat_conversations | true | auth_all_conversations [authenticated] |
| chat_messages | true | auth_all_messages [authenticated] |
| referrals | true | (none) |
| subscriptions | true | (none) |

This is **byte-for-byte the same** snapshot returned by the same query against prod → proof that prod already sits at the migration-16 target state.

---

## ÉLES GO-LIVE RUNBOOK (rewritten for the real prod state)

**Every step below is run by a HUMAN. The agent does not write to prod and never sets a password.**
Prod migration history is **empty** and **16 is already live** — so this is *not* a normal `db push`.

### Step 1 — Backup
Dashboard snapshot or `pg_dump` of `bnjnoofcyjldvygupvgp` before any change.

### Step 2 — DO NOT `supabase db push` to prod
With empty history, `db push` would attempt to replay **01→17** on the live DB → conflicts (objects already exist, data inserts re-run). Skip it.

### Step 3 — Verify 16 is already live (read-only, no change)
Run this and confirm it matches C.5 (it already did on 2026-05-31):
```sql
select c.relname as table, c.relrowsecurity as rls_enabled,
  coalesce(string_agg(p.polname||' ['||
    array_to_string(array(select rolname from pg_roles r where r.oid = any(p.polroles)),',')||']','; '),'(none)') as policies
from pg_class c join pg_namespace n on n.oid=c.relnamespace
left join pg_policy p on p.polrelid=c.oid
where n.nspname='public'
  and c.relname in ('chat_conversations','chat_messages','business_config','subscriptions','referrals')
group by c.relname, c.relrowsecurity order by c.relname;
```
Expected: chat tables have only `auth_all_*[authenticated]` (no `anon_*`); the other three are `rls_enabled=true, (none)`. **Do not re-apply 16.** If any `anon_select_*` policy is still present, only then apply 16's two `DROP POLICY` lines.

### Step 4 — Apply migration 17 by the lowest-risk path
**Option (a) — RECOMMENDED for this ad-hoc-built prod.** Apply the additive, idempotent `17_admin_users_reconcile.sql` **directly** in the dashboard SQL editor (after Step 1 backup). It only `ADD COLUMN IF NOT EXISTS user_id/email`, backfills, and adds a unique index — no data loss, no chain replay. This avoids touching the (empty) migration-history table entirely.

**Option (b) — full history baseline, only if you want CLI-managed migrations going forward.** Baseline the *entire* already-present chain as applied, then push just 17:
```bash
supabase migration repair --status applied 01 01b 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16
supabase db push   # applies only 17
```
More moving parts; riskier on a DB that was never CLI-managed. Prefer (a) unless you are adopting the CLI workflow now.

> ⚠️ The old runbook's `migration repair --status applied 01 01b` (only two versions) is **wrong here** — it would leave 02–16 "unapplied" and a later `db push` would try to replay them.

### Step 5 — Add the owner's `admin_users` row
The intended owner admin is **`waxee@icloud.com`** (`fac5e812-…`), which already exists in `auth.users` and **already logs in (200)** but has **no `admin_users` row**:
```sql
INSERT INTO admin_users (id, user_id, email, full_name)
SELECT id, id, email, 'Owner' FROM auth.users
WHERE email = 'waxee@icloud.com'
ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, email = EXCLUDED.email;
```
> ⚠️ **`supabase/admin-seed.sql` currently hardcodes `waxeee57@gmail.com`** — change the email to the intended owner (`waxee@icloud.com`) before running it, or run the statement above. Decide which Google/iCloud identity is the real owner account.

### Step 6 — Password
`waxee@icloud.com` can already authenticate (200 in the logs), so no password action is needed for that account. For any *new* admin, the **owner** sets the password via the dashboard / a recovery link — never the agent.

### Step 7 — Verify the ChatWidget frontend deploy (coupled to 16)
The committed `components/chat/ChatWidget.tsx` has **no anon Realtime subscription** (verified — no `createClient`/`channel`/`subscribe`), so it is coherent with 16 being live. **Confirm the live Zöldfészek deployment is on this commit (`9fb2526` or later).** If an older build is still deployed, its anon Realtime subscription is **already silently degraded** (16 dropped the anon chat policy) — redeploy Vercel to the committed version. Visitors still load/send via the service-role `/api/chat/*` routes; only live websocket push is affected.

### Step 8 — Verify on prod (read-only)
- `SELECT id,email FROM admin_users WHERE user_id = '<owner uid>'` → returns the row, **no 42703** (post-17).
- Anon probe (`SET LOCAL ROLE anon; SELECT count(*) FROM chat_conversations …`) → **0 rows**.
- Admin login → reaches `/admin` (no redirect loop).

### Step 9 — Post-go-live hardening (from A.5, schedule separately)
Revoke `anon`/`authenticated EXECUTE` on `public.rls_auto_enable()` (or make it `SECURITY INVOKER`); enable leaked-password protection; pin `search_path` on the 4 functions; relocate `btree_gist` out of `public`.

---

## Definition of Done — status
- ✅ **Dev branch:** full chain **01→17 builds from an empty DB** (18 migrations, 20 tables, zero errors).
- ✅ **Admin auth resolves** post-17 (no 42703); `requireAdmin` query returns the linked row.
- ✅ **P0 probe RED→GREEN proven live** with seeded PII (anon 1→0 across chat/subscriptions/referrals).
- ✅ **Smoke a–e all green.**
- ✅ **Prod untouched** (read-only only); branch deleted after proof.
- ✅ **get_advisors prod list** captured with remediation links (A.5).
- ✅ **Go-live runbook** rewritten for the real prod state (empty history + 16-already-live), ready for human execution.

---

# Phase 2 — review, advisor fixes, prod-SQL drift proof (2026-05-31)

Second autonomous pass. Dev branch `p0-proof2` (`lkxwrqxgdvdmrqtgclly`, deleted after proof). Prod read-only only.

## P2.1 — Code review + admin-seed fix (Task 1)
- Full branch diff reviewed; the P0 artifacts (01, 01b, 16, 17, smoke, probe) are correct, idempotent, and chain-ordered 01→17. No already-applied migration was edited.
- **`admin_users` consumers = exactly two**, both filter by `user_id`: `lib/auth.ts` `requireAdmin` (`select id,email`) and the admin layout (`select id`). Migration 17 supplies both columns → **no further admin_users drift.**
- **Fixed `supabase/admin-seed.sql`:** now seeds `waxee@icloud.com` (canonical owner) instead of the lookalike `waxeee57@gmail.com`. Behaviour unchanged (copies an existing auth user only; no password).

## P2.2 — Advisor fixes written + proven (Task 2) → migration `18_advisor_hardening.sql`
- **`rls_auto_enable()` SECURITY DEFINER, anon-executable — RED→GREEN:**
  - RED: `has_function_privilege('anon','public.rls_auto_enable()','EXECUTE') = true`.
  - Fix: `REVOKE EXECUTE … FROM anon, authenticated, PUBLIC`.
  - GREEN: privilege `false`; as `anon`, `SELECT public.rls_auto_enable()` → **`42501: permission denied for function rls_auto_enable`**.
- **4 mutable-search_path functions pinned** (`set_updated_at`, `update_business_config_updated_at`, `set_client_leads_updated_at`, `upsert_customer`): all now `search_path=""`; proven still working (3 triggers fire via sentinel-overwrite test; `upsert_customer` inserts and returns a uuid — `customers` schema-qualified).
- **`get_advisors(security)` on the post-18 branch:** the `anon`/`authenticated` SECURITY-DEFINER-executable warnings and all 4 `function_search_path_mutable` warnings are **gone**. Remaining are intentional/accepted: deny-by-default `rls_enabled_no_policy` INFOs, `auth_all_*` + `page_events` permissive policies, `btree_gist` in public, leaked-password (auth toggle).
- **Full P0 re-run with hardening in place stayed green:** anon probe post-16+18 = 0/0/0/0; `requireAdmin` resolves for **both** Dominik and waxee; `subscriptions.access_locked` resolves.
- **Documented (not auto-applied):** `btree_gist` relocation (risky on the in-use `no_overlap` constraint) and leaked-password protection (dashboard) → owner steps in `docs/PROD_EXECUTION.md`.

## P2.3 — Prod-bound additive SQL is drift-free (Task 3)
Simulated prod's *current* `admin_users` on the branch (reverted to `{id,role,full_name,created_at}` + the single Dominik row, with Dominik + waxee seeded in `auth.users`), then ran the **exact additive prod SQL** from `PROD_EXECUTION.md` Step 2. Result vs. the tested migration-17 schema:

| | migration 17 (tested) | additive prod SQL |
|---|---|---|
| columns | id, role, full_name, created_at, user_id, email | **identical** |
| indexes | pkey(id), user_id_key(user_id) | **identical** |
| FKs | id→auth.users CASCADE, user_id→auth.users CASCADE | **identical** |

→ **Zero schema drift** between what was tested and what the human runs. Resulting rows: Dominik (linked, `dominik.ihm@gmail.com`) + Owner/`waxee@icloud.com` (linked).

## P2.4 — Prod read-only re-verify (Task 3)
`admin_users` still `{id,role,full_name,created_at}`, **0** `user_id`/`email` cols, **1** row (Dominik); `anon_chat_policies = 0` (16 live); `auth.users = 3`; `rls_auto_enable` anon-EXECUTE **still true on prod** (confirms migration 18 is a pending prod step). No unexpected diffs vs. the branch target.

## P2.5 — Deliverables
- `supabase/migrations/18_advisor_hardening.sql` (new, branch-proven).
- `supabase/admin-seed.sql` (fixed to `waxee@icloud.com`).
- `docs/PROD_EXECUTION.md` — single ordered human-run runbook (every SQL block marked branch-proven + human-run).
- `docs/GDPR_CHAT_INCIDENT.md` — incident-note draft template (fill-in fields marked; no invented dates).
- Dev branch deleted; **prod untouched.**

---

# Phase 3 — PROD apply of 17 + 18 (2026-05-31 20:16:57 UTC)

Scoped prod-write run (raw `execute_sql`, no `db push`/`apply_migration` — prod history left empty). Backup confirmed by owner before any write.

## P3.1 — Pre-flight (read-only) — matched expected, no drift
admin_users `{id,role,full_name,created_at}`, 1 row (Dominik `6a2eb005…`); anon chat policies 0; `rls_auto_enable` anon+auth EXECUTE true; auth.users 3; `waxee@icloud.com`=`fac5e812…` confirmed.

## P3.2 — Step 2 applied: migration 17 + owner row (one transaction)
Verified immediately after COMMIT:
- `admin_users` now has `user_id` + `email` (drift cols = 2).
- **2 rows, both linked** (`user_id = id`): Dominik (`dominik.ihm@gmail.com`) + Owner (`waxee@icloud.com`).
- `requireAdmin` lookup resolves for both uids (`fac5e812…` → waxee, `6a2eb005…` → Dominik).

## P3.3 — Step 3 applied: advisor hardening / migration 18 (one transaction)
Verified immediately after COMMIT (read-only, no function call):
- `has_function_privilege` for `rls_auto_enable()` EXECUTE: **anon = false, authenticated = false**.
- All 4 functions (`set_updated_at`, `update_business_config_updated_at`, `set_client_leads_updated_at`, `upsert_customer`) have `proconfig = {search_path=""}`.
- `get_advisors(security)` on prod: the `rls_auto_enable` anon/authenticated-executable WARNs and all 4 `function_search_path_mutable` WARNs are **gone**. Remaining (accepted/owner): deny-by-default `rls_enabled_no_policy` INFOs, `auth_all_*` + `page_events` permissive policies, `btree_gist` in public, leaked-password.

## P3.4 — Final consolidated verify (read-only) — all green
`applied_at = 2026-05-31 20:16:57 UTC` · admin_drift_cols=2 · admin_rows=2 · linked=2 · both_admins_resolve=true · anon_chat_policies=0 · anon/auth rls_auto_enable EXECUTE=false · functions_pinned=4 · auth_users=3 (no new auth users). `upsert_customer` not called on prod (no test rows written).

## P3.5 — Remaining OWNER steps (not done by agent)
1. **Set the password** for `waxee@icloud.com` in the dashboard (Authentication ▸ Users) — it already authenticates 200, so only needed if the owner wants to (re)set it. Agent never sets passwords.
2. **Enable Leaked-password protection** (Authentication ▸ Password) — https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
3. **Login test:** sign in as `waxee@icloud.com` → reaches `/admin` (no redirect loop), confirming the 42703 fail-closed is gone.
4. **ChatWidget deploy state:** confirm the live deployment is on commit `9fb2526`+ (committed widget has no anon Realtime subscription); redeploy Vercel if an older build is live, since 16 is already live and the old anon realtime push is degraded.

> No other prod changes were made. `btree_gist` relocation remains a deferred, separately-scheduled hardening item (risky on the in-use `no_overlap` constraint).
