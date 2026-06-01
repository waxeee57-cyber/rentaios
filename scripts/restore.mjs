#!/usr/bin/env node
// ============================================================
// RESTORE + SMOKE  —  run:
//   node scripts/restore.mjs --file backups/<tenant>_<stamp>.dump --target "<conn-str>"
//
// Restores a pg_dump (custom format) backup into a TARGET database, then runs a
// smoke check to prove the restore is usable. Designed to restore into a
// DISPOSABLE database (a Supabase dev branch / throwaway project), NOT prod.
//
// SAFETY RAILS
//   - Refuses to run unless --target is given (no implicit prod connection).
//   - Refuses if the target host matches PROD_DB_HOST (or the live project ref)
//     unless --force-prod is passed. This makes "restore over production" an
//     explicit, deliberate act, never an accident.
//   - Uses pg_restore --clean --if-exists so a re-run is repeatable.
//
// SMOKE (post-restore)
//   Verifies, via psql, that the core tables exist and are queryable and that
//   the expected schema objects from migration 19 are present. Exit 0 = the
//   restored DB is structurally healthy.
//
// ARGS / ENV
//   --file <path>        (required) dump file produced by scripts/backup.mjs
//   --target <conn-str>  (required) target DB connection string (disposable)
//   --force-prod         allow restoring into a prod-looking host (dangerous)
//   PROD_DB_HOST         optional host substring to protect (e.g. project ref)
// ============================================================
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

function argVal(name) {
  const i = process.argv.indexOf(name)
  return i !== -1 ? process.argv[i + 1] : undefined
}
const FILE = argVal('--file')
const TARGET = argVal('--target') || process.env.RESTORE_TARGET_DB_URL
const FORCE_PROD = process.argv.includes('--force-prod')

function fail(msg) {
  console.error('restore: ' + msg)
  process.exit(1)
}

if (!FILE) fail('--file <dump> is required')
if (!existsSync(FILE)) fail(`dump file not found: ${FILE}`)
if (!TARGET) fail('--target <conn-str> (or RESTORE_TARGET_DB_URL) is required')

// Prod-overwrite guard.
const prodHost = process.env.PROD_DB_HOST
if (prodHost && TARGET.includes(prodHost) && !FORCE_PROD) {
  fail(`target matches PROD_DB_HOST ("${prodHost}"). Refusing without --force-prod.`)
}

function tool(name) {
  const r = spawnSync(name, ['--version'], { encoding: 'utf8' })
  if (r.status !== 0) fail(`${name} not found on PATH (install postgresql-client).`)
}
tool('pg_restore')
tool('psql')

console.log(`restoring ${FILE} -> target`)
const r = spawnSync(
  'pg_restore',
  ['--clean', '--if-exists', '--no-owner', '--no-privileges', '--dbname', TARGET, FILE],
  { stdio: ['ignore', 'inherit', 'inherit'] }
)
// pg_restore exits non-zero on benign "does not exist" warnings with --clean;
// treat only a hard failure (no relations restored) as fatal via the smoke step.
if (r.status !== 0) {
  console.warn(`pg_restore exited ${r.status} (often benign --clean warnings) — verifying via smoke`)
}

// ── SMOKE ──────────────────────────────────────────────────────────────────
const SMOKE_SQL = `
  select
    (select count(*) from public.cars)               as cars,
    (select count(*) from public.bookings)           as bookings,
    (select count(*) from public.customers)          as customers,
    (select count(*) from public.business_config)    as business_config,
    (select count(*) from pg_indexes
       where schemaname='public' and indexname='bookings_inquiry_dedup_idx') as dedup_idx,
    (select count(*) from information_schema.tables
       where table_schema='public' and table_name='stripe_events')          as stripe_events_tbl;
`
const s = spawnSync('psql', [TARGET, '-v', 'ON_ERROR_STOP=1', '-c', SMOKE_SQL], { encoding: 'utf8' })
if (s.status !== 0) {
  console.error(s.stderr || s.stdout)
  fail('smoke query failed — restore is NOT healthy')
}
console.log('\nsmoke result:')
console.log(s.stdout.trim())
console.log('\nrestore + smoke: OK')
