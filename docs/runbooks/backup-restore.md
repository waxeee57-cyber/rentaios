# Backup & Restore Runbook — RentalOS (Blok 1)

Per-tenant logical backups of the Supabase Postgres DB, with a **tested**
restore-into-a-throwaway-DB → smoke procedure.

> Single-tenant-per-deployment: one deploy = one business = one DB. To cover
> several tenants from one cron host, run the backup once per tenant with that
> tenant's `SUPABASE_DB_URL`.

---

## 0. Prerequisites

- `postgresql-client` installed (provides `pg_dump`, `pg_restore`, `psql`).
  - macOS: `brew install libpq && brew link --force libpq`
  - Debian/Ubuntu/CI: `apt-get install -y postgresql-client`
- `SUPABASE_DB_URL` — the **direct** connection string (port 5432) from
  Supabase → Project Settings → Database → *Connection string*.
  **Not** the transaction pooler (pg_dump needs a session connection).
  Contains the DB password → store in the secret manager, never commit.

Verify the host is ready:

```bash
pnpm backup:check
```

---

## 1. Backup

```bash
SUPABASE_DB_URL="postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres" \
BACKUP_DIR=/mnt/backups \
BACKUP_RETENTION_DAYS=14 \
pnpm backup
```

Produces `BACKUP_DIR/<tenant>_<ISO-stamp>.dump` (pg_dump custom/compressed
format), then prunes dumps older than `BACKUP_RETENTION_DAYS`.

- `TENANT_SLUG` overrides the tenant name (default: slug of
  `NEXT_PUBLIC_BUSINESS_NAME`).
- The script fails if the dump is < 1 KB (catches silent auth/empty failures).

### Scheduling (daily)

Run on any cron host (GitHub Actions scheduled workflow, a small VM, or a
Supabase scheduled task). Example GitHub Actions step:

```yaml
- run: pnpm backup
  env:
    SUPABASE_DB_URL: ${{ secrets.SUPABASE_DB_URL }}
    BACKUP_DIR: ./backups
```

### External storage (production REQUIREMENT)

`BACKUP_DIR` must point at **off-box** storage so a project/region loss does not
take the backups with it. Recommended, no extra SDK:

```bash
rclone copy "$BACKUP_DIR" remote:rentalos-backups/<tenant>/ --include "*.dump"
```

The backup script exposes an upload hook (`BACKUP_S3_BUCKET`) that is
intentionally **not** wired to any paid SDK — wire it to your storage of choice.

---

## 2. Restore into a disposable DB + smoke

Never restore over production by reflex. Restore into a Supabase **dev branch**
or a throwaway project, then smoke-test:

```bash
node scripts/restore.mjs \
  --file backups/<tenant>_<stamp>.dump \
  --target "postgresql://postgres:...@db.<throwaway-ref>.supabase.co:5432/postgres"
```

Safety rails:
- `--file` and `--target` are both required (no implicit prod connection).
- If `PROD_DB_HOST` is set and the target matches it, the restore **refuses**
  unless you pass `--force-prod`.
- `pg_restore --clean --if-exists` makes the restore repeatable.

The smoke step (via `psql`) asserts the core tables are queryable and that the
migration-19 objects (`bookings_inquiry_dedup_idx`, `stripe_events`) are present.
Exit 0 = restored DB is structurally healthy.

---

## 3. Disaster-recovery flow (restore over production)

Only when production is actually lost/corrupted:

1. Put the app in maintenance mode (`MAINTENANCE_MODE=true`).
2. Restore the latest good dump into a **fresh** Supabase project (or a branch),
   smoke it (Section 2).
3. Repoint the deployment env (`SUPABASE_DB_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
   keys) at the recovered project.
4. Run `pnpm smoke` against the recovered project (P0 RLS + schema checks).
5. Lift maintenance mode.

To restore directly over an existing prod DB (rare), pass `--force-prod`
deliberately.

---

## 4. Retention & tiers — free vs paid Supabase

| Capability | Free tier | Paid (Pro+) |
|---|---|---|
| Automated daily backups (managed) | ❌ none | ✅ daily, **7-day** retention (Pro) |
| Point-in-time recovery (PITR) | ❌ | ✅ add-on (down to the minute) |
| This script's logical backups | ✅ works | ✅ works (complementary) |

**Implication for a live customer:** the Supabase free tier provides **no**
managed backups — this script is the *only* safety net there, and a missed cron
run = no recovery point. **A real paying client must be on at least the Supabase
Pro tier** for managed daily backups (and PITR for tight RPO). Keep these
logical dumps running regardless: they are portable (restore into any Postgres),
off-box, and independent of the provider's retention window.

---

## 5. Proof

The restore → smoke loop was exercised on a disposable Supabase **dev branch**
(not production). See the Blok 1 report (`docs/reports/blok1-prod-ready.md`,
"Backup/restore proof") for the captured evidence.
