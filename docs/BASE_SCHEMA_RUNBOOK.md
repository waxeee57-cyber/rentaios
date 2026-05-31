# Base-schema chain + admin-login — runbook

**Branch:** `fix/p0-security-rls` · **Date:** 2026-05-31
**⚠️ Every production step below is run by a HUMAN.** The agent does not touch prod and does not set passwords.

---

## 1. Admin login "Invalid login credentials (400)" — root cause

`signInWithPassword` authenticates against **Supabase Auth (GoTrue / `auth.users`)**. The 400 is thrown there, *before* `admin_users` is ever read — so this is an **auth-layer** problem, not the `admin_users` schema drift (that drift is real and fixed in `17`, but it surfaces only *after* a successful login, as a 403).

**Decisive evidence — `supabase/admin-seed.sql`:**
```sql
INSERT INTO admin_users (id, user_id, email, full_name)
SELECT id, id, email, 'Owner'
FROM auth.users
WHERE email = 'waxeee57@gmail.com'
ON CONFLICT (id) DO UPDATE ...
```
It only **copies an already-existing `auth.users` row** into the app table. It never creates the GoTrue identity and never sets a password. So on a fresh project / new deploy there is **no auth user** → `signInWithPassword` → `400 Invalid login credentials`, with correct-looking input.

### Two candidate root causes (confirm with read-only diagnosis once MCP is connected)
1. **Missing auth user** (most likely on a fresh build): the email isn't in `auth.users` at all, or has `email_confirmed_at = NULL`, or has no identity.
2. **Env / project mismatch**: the deployed Vercel `NEXT_PUBLIC_SUPABASE_URL` + anon key point at a *different* Supabase project than the one where the admin user exists (classic "right password, wrong project" after a new deploy).

### Read-only diagnosis (prod — SELECT / logs only, no writes)
```sql
-- Does the admin auth user exist & is it usable? (no password hash read)
select id, email, email_confirmed_at, created_at
from auth.users where email = 'waxeee57@gmail.com';

select i.provider, i.created_at
from auth.identities i
join auth.users u on u.id = i.user_id
where u.email = 'waxeee57@gmail.com';
```
```
get_logs(service="auth")   # at the failed-login timestamp → GoTrue reason:
                           # "user not found" | "invalid password" | "email not confirmed"
```
Project match: compare the deployed `NEXT_PUBLIC_SUPABASE_URL` host against the project the admin user lives in. (Repo's local `.env.local` URL host = `bnjnoofcyjldvygupvgp`.)

### Fix per root cause (human runs; agent never sets a password)
- **Env/project mismatch** → repoint Vercel (and local `.env.local`) `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the correct project. Safe, no account op. Redeploy.
- **Missing / unconfirmed auth user** → create it, then let the **owner** set the password via a link (no agent-chosen password):
  ```bash
  # Owner runs. Creates a confirmed auth user; owner sets password via the emailed link.
  # Option A — dashboard: Authentication ▸ Users ▸ Add user ▸ (enable "auto-confirm")
  # Option B — generate a recovery/magic link for an existing or just-created user:
  #   Dashboard ▸ Authentication ▸ Users ▸ (user) ▸ "Send password recovery"
  #   or Supabase Admin API: POST /auth/v1/admin/generate_link {type:"recovery", email}
  ```
  Then run `supabase/admin-seed.sql` (idempotent) to link the `admin_users` row.

### Proof on the dev branch (once MCP connected)
1. Create auth user with confirmed email (+ owner-set password via link).
2. Run `admin-seed.sql`.
3. `signInWithPassword` with the real credential → **200**, and `requireAdmin` resolves (needs migration `17`). Capture the before (400) / after (200) in the report.

---

## 2. Base-schema bootstrap — new migrations `01_base_schema.sql` + `01b_base_policies.sql`

**Problem:** base tables (`cars`, `customers`, `bookings`, `admin_users`) + shared funcs/triggers lived only in `supabase/schema.sql` (not a numbered migration). The chain started at `02_transfer.sql`, which `ALTER`s `bookings` → `supabase db reset` (migrations only) died at 02 on a fresh DB.

**Fix:** added `01_base_schema.sql` (tables/extension/functions/triggers/`no_overlap` constraint) and `01b_base_policies.sql` (RLS + base policies), faithful to `schema.sql`/`policies.sql`, **idempotent** (`CREATE … IF NOT EXISTS`, `CREATE OR REPLACE`, guarded constraint, `DROP POLICY IF EXISTS`+`CREATE`). Lexicographic order is correct: `01_base_schema` → `01b_base_policies` → `02_transfer` → … → `17`.

### Fresh DB (dev branch / local) — must go green
```bash
supabase db reset      # applies 01 → 01b → 02 … 17 with zero errors
# (CLI needs supabase/config.toml — run `supabase init` first if absent; see §4)
psql "$DATABASE_URL" -f supabase/seed.sql          # demo cars
# admin auth user (human) + admin-seed.sql as in §1
```

### Existing PROD DB — DO NOT replay 01 blindly (human runs)
The objects already exist on prod; inserting a migration *earlier* than the applied history can corrupt `supabase_migrations.schema_migrations`. Mark 01/01b as already-applied instead of executing them:
```bash
# Human, against prod, AFTER a backup:
supabase migration repair --status applied 01
supabase migration repair --status applied 01b
```
The idempotency in the files is a safety net (a re-run would be a no-op-equivalent), **not** the intended prod path — repair is.

---

## 3. Red→green proof (dev branch — pending MCP/DB; see §4 for why not yet run)
```bash
# 1. fresh dev DB, base + migrations 02..15 only (WITHOUT 16/17)
# 2. seed one chat row with a visitor_email
npm run probe     # EXPECT: RED — anon key reads the seeded chat row (PII leak live)
# 3. apply 16 + 17
npm run probe     # EXPECT: GREEN — anon blocked / 0 rows
npm run smoke     # EXPECT: ALL GREEN (a–e)
```

---

## 4. Why the proof isn't captured yet (honest status)
The DB-touching steps (Task A live diagnosis, dev-branch `db reset`, red→green, green smoke) could **not** be executed in this environment:
- **Supabase MCP not connected** — no `execute_sql` / `create_branch` / `apply_migration` / `get_logs` tools are available.
- **No local DB fallback:** local service-role key in `.env.production.local` is a 2-char placeholder; **Docker daemon is not running** (Docker Desktop stopped), so `supabase start`/`db reset` can't spin up a local Postgres; no `psql` on PATH; no `supabase/config.toml`.

**To unblock (either path):**
- **A —** Connect the Supabase MCP (project `bnjnoofcyjldvygupvgp`). Then the agent runs §1 diagnosis (read-only prod), creates a dev branch, and captures §3 red→green + green smoke. Prod stays read-only.
- **B —** Start Docker Desktop and run `supabase init` (creates `config.toml`). Then the agent runs everything against a purely local, ephemeral DB — no prod contact at all, the safest option for the proof.

---

## 5. Production deployment order (HUMAN runs every step)
1. **Backup** prod DB (dashboard snapshot / `pg_dump`).
2. **Staging/dev-branch dry run:** `supabase db reset` on a branch → full chain green → seed → app boots → admin login OK → `npm run probe`/`npm run smoke` green.
3. **Prod migration history:** `supabase migration repair --status applied 01 01b` (so the new base migrations are not re-executed on prod).
4. **Apply forward migrations:** `supabase db push` (applies 16 + 17; both additive/idempotent).
5. **Admin auth:** ensure the auth user exists + confirmed; owner sets password via link; run `admin-seed.sql`.
6. **Verify on prod (read-only):** admin login 200; `npm run probe` → no anon-readable PII.
7. **App:** redeploy Vercel with env pointing at the correct project.
