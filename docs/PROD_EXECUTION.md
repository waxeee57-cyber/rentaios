# RentalOS — PROD EXECUTION runbook (P0 close-out)

**Prod project:** `bnjnoofcyjldvygupvgp` · **Date prepared:** 2026-05-31 · Branch: `fix/p0-security-rls`

> **EVERY step here is run by a HUMAN.** The agent never writes to prod and never sets a password.
> Each SQL block is **branch-proven** (dev branch `p0-proof2`, evidence in `docs/P0_GO_LIVE_REPORT.md`).
> **Prod migration history is empty and migration 16 is already live — do NOT `supabase db push`.**
> Apply the SQL blocks below **directly in the dashboard SQL editor** after a backup.

Current verified prod state (read-only, 2026-05-31):
- `admin_users` = `{id, role, full_name, created_at}`, **1 row (Dominik `6a2eb005…`)** — migration 17 NOT applied.
- Chat anon policies dropped; `business_config`/`subscriptions`/`referrals` RLS-on deny-by-default — **migration 16 already live**.
- `auth.users`: `waxee@icloud.com` (`fac5e812…`, confirmed, logs in 200), `dominik.ihm@gmail.com` (`6a2eb005…`), `waxeee57@gmail.com` (`3d6fdb44…`).
- `rls_auto_enable()` still anon-EXECUTE-able — advisor fix pending (Step 3).

Canonical admin account = **`waxee@icloud.com`** (`fac5e812…`). Do NOT use `waxeee57@gmail.com`.

---

## Step 0 — Backup (mandatory)
Dashboard ▸ Database ▸ Backups ▸ snapshot, or `pg_dump`. Do not proceed without it.

## Step 1 — Verify 16 is already live (READ-ONLY, no change)
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
Expect: chat tables only `auth_all_*[authenticated]` (no `anon_*`); other three `rls_enabled=true,(none)`.
If any `anon_select_*` policy still exists, only then run 16's two `DROP POLICY IF EXISTS "anon_select_conversations"/"anon_select_messages"` lines. **Otherwise skip — do not re-apply 16.**

## Step 2 — Migration 17 (admin_users reconcile) + owner admin row
**Branch-proven to produce a byte-identical schema to the tested migration 17, plus the two intended rows.**
Additive, idempotent. Run as one block:
```sql
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
UPDATE public.admin_users SET user_id = id WHERE user_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_user_id_key ON public.admin_users(user_id);
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS email text;
UPDATE public.admin_users a SET email = u.email
  FROM auth.users u WHERE a.email IS NULL AND u.id = a.id;

-- canonical owner admin row (waxee@icloud.com). Copies an EXISTING auth user only.
INSERT INTO public.admin_users (id, user_id, email, full_name, role)
SELECT id, id, email, 'Owner', 'admin'
FROM auth.users WHERE email = 'waxee@icloud.com'
ON CONFLICT (id) DO UPDATE
  SET user_id = EXCLUDED.user_id, email = EXCLUDED.email;
```
Verify:
```sql
select full_name, role, (user_id = id) as linked, email from public.admin_users order by full_name;
-- expect: Dominik (linked, dominik.ihm@gmail.com) + Owner (linked, waxee@icloud.com)
```

## Step 3 — Advisor hardening (migration 18)
**Branch-proven red→green** (anon EXECUTE true → `42501 permission denied`; 4 functions keep working). Run as one block:
```sql
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, PUBLIC;

ALTER FUNCTION public.set_updated_at()                    SET search_path = '';
ALTER FUNCTION public.update_business_config_updated_at() SET search_path = '';
ALTER FUNCTION public.set_client_leads_updated_at()       SET search_path = '';

CREATE OR REPLACE FUNCTION public.upsert_customer(
  p_email text, p_phone text, p_full_name text, p_country text
) RETURNS uuid LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE v_id uuid;
BEGIN
  INSERT INTO public.customers (email, phone, full_name, country)
  VALUES (p_email, p_phone, p_full_name, p_country)
  ON CONFLICT (email) DO UPDATE
    SET phone = excluded.phone, full_name = excluded.full_name,
        country = excluded.country, updated_at = now()
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
```
Verify:
```sql
select has_function_privilege('anon','public.rls_auto_enable()','EXECUTE') as anon_exec;  -- expect false
```

## Step 4 — Dashboard settings (no SQL)
- **Authentication ▸ Providers ▸ Email:** keep enabled (the earlier 422 window is closed).
- **Authentication ▸ Policies / Password:** enable **Leaked password protection** (HaveIBeenPwned).
  → https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- **Password:** `waxee@icloud.com` already authenticates (200) — the **owner** manages its password via the dashboard / recovery link. The agent never sets it.

## Step 5 — Verify (READ-ONLY)
```sql
-- admin login lookup resolves (no 42703), one row per admin
select id, email from public.admin_users where user_id = 'fac5e812-aa5d-43d4-a399-8cb945017734';
```
- Browser: log in as `waxee@icloud.com` → reaches `/admin` (no redirect loop).
- Anon chat leak probe (read-only): `npm run probe` with prod anon key → all GREEN (0 anon-readable rows).

## Step 6 — ChatWidget deploy state (couple with 16)
The committed `components/chat/ChatWidget.tsx` has **no anon Realtime subscription** (verified — no `createClient`/`channel`/`subscribe`). Since 16 is already live, an **older deployed build would have a silently-degraded live chat** (anon realtime push gone). **Confirm the live Zöldfészek deployment is on commit `9fb2526` or later**; redeploy Vercel if not. Visitors still load/send via service-role `/api/chat/*`; only websocket push is affected.

## Optional hardening (separate maintenance window)
- **`btree_gist` in `public`** (advisor 0014): moving an in-use extension can disrupt the `no_overlap` exclusion constraint on `bookings`. Plan a dedicated migration (`ALTER EXTENSION btree_gist SET SCHEMA extensions;`) with testing — **not** part of this P0 close-out.

---

### Provenance
| Block | Proven on | Evidence |
|---|---|---|
| Step 2 (17 + owner row) | dev branch `p0-proof2` | byte-identical schema vs migration 17; rows Dominik+Owner — `P0_GO_LIVE_REPORT.md` Phase 2 |
| Step 3 (18 hardening) | dev branch `p0-proof2` | anon EXECUTE true→42501; 4 functions still fire — `P0_GO_LIVE_REPORT.md` Phase 2 |
| Step 1 (16 already live) | prod read-only | policy/RLS snapshot matches 16 target |
