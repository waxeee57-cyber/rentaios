#!/usr/bin/env node
// ============================================================
// TENANT BACKUP  —  run:  node scripts/backup.mjs   (or: pnpm backup)
//
// Takes a per-tenant logical backup of the Supabase Postgres database using
// pg_dump (custom/compressed format), writes it to a backup directory with a
// timestamped, tenant-scoped name, and prunes dumps older than the retention
// window.
//
// This is single-tenant-per-deployment, so one run = one tenant. To back up
// several tenants from one cron host, run this once per tenant with that
// tenant's SUPABASE_DB_URL (see runbook).
//
// REQUIRED ENV
//   SUPABASE_DB_URL   Postgres connection string for the project. Use the
//                     Supabase dashboard → Project Settings → Database →
//                     "Connection string" (the direct 5432 string, NOT the
//                     transaction pooler, so pg_dump can run). Contains the DB
//                     password — keep it in the secret store, never commit it.
// OPTIONAL ENV
//   TENANT_SLUG               default: derived from NEXT_PUBLIC_BUSINESS_NAME
//   BACKUP_DIR                default: ./backups   (point at a mounted external
//                             volume / synced folder in production)
//   BACKUP_RETENTION_DAYS     default: 14
//
// EXTERNAL STORAGE
//   For production, BACKUP_DIR should be an external/off-box location (mounted
//   S3/R2 via rclone, a synced volume, etc). A direct S3 upload hook is marked
//   below — intentionally NOT wired to any paid SDK here.
//
// MODES
//   --check   Verify prerequisites (pg_dump present, env set) and exit. Does
//             not connect or dump. Useful in CI / the runbook.
// ============================================================
import { spawnSync } from 'node:child_process'
import { mkdirSync, readdirSync, statSync, unlinkSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const args = new Set(process.argv.slice(2))
const CHECK_ONLY = args.has('--check')

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const TENANT =
  process.env.TENANT_SLUG ||
  (process.env.NEXT_PUBLIC_BUSINESS_NAME && !process.env.NEXT_PUBLIC_BUSINESS_NAME.startsWith('http')
    ? slugify(process.env.NEXT_PUBLIC_BUSINESS_NAME)
    : 'tenant')
const BACKUP_DIR = resolve(process.env.BACKUP_DIR || './backups')
const RETENTION_DAYS = Number(process.env.BACKUP_RETENTION_DAYS || '14')
const DB_URL = process.env.SUPABASE_DB_URL

function pgDumpAvailable() {
  const r = spawnSync('pg_dump', ['--version'], { encoding: 'utf8' })
  return { ok: r.status === 0, version: (r.stdout || '').trim() }
}

function check() {
  const problems = []
  const pd = pgDumpAvailable()
  if (!pd.ok) problems.push('pg_dump not found on PATH (install postgresql-client).')
  if (!DB_URL) problems.push('SUPABASE_DB_URL is not set.')
  if (problems.length) {
    console.error('backup --check: NOT READY')
    for (const p of problems) console.error('  - ' + p)
    return false
  }
  console.log('backup --check: READY')
  console.log(`  pg_dump: ${pd.version}`)
  console.log(`  tenant:  ${TENANT}`)
  console.log(`  dir:     ${BACKUP_DIR}`)
  console.log(`  keep:    ${RETENTION_DAYS} days`)
  return true
}

function prune() {
  if (!existsSync(BACKUP_DIR)) return
  const cutoff = Date.now() - RETENTION_DAYS * 86_400_000
  let removed = 0
  for (const f of readdirSync(BACKUP_DIR)) {
    if (!f.startsWith(`${TENANT}_`) || !f.endsWith('.dump')) continue
    const full = join(BACKUP_DIR, f)
    if (statSync(full).mtimeMs < cutoff) {
      unlinkSync(full)
      removed++
    }
  }
  if (removed) console.log(`pruned ${removed} dump(s) older than ${RETENTION_DAYS}d`)
}

function backup() {
  mkdirSync(BACKUP_DIR, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const outFile = join(BACKUP_DIR, `${TENANT}_${stamp}.dump`)

  console.log(`backing up tenant "${TENANT}" -> ${outFile}`)
  const r = spawnSync(
    'pg_dump',
    ['--format=custom', '--no-owner', '--no-privileges', '--file', outFile, '--dbname', DB_URL],
    { stdio: ['ignore', 'inherit', 'inherit'] }
  )
  if (r.status !== 0) {
    console.error('pg_dump failed (exit ' + r.status + ')')
    process.exit(1)
  }

  const size = statSync(outFile).size
  if (size < 1024) {
    console.error(`backup file suspiciously small (${size} bytes) — treating as failure`)
    process.exit(1)
  }
  console.log(`backup OK — ${(size / 1024 / 1024).toFixed(2)} MB`)

  // ── EXTERNAL UPLOAD HOOK ────────────────────────────────────────────────
  // Production: copy `outFile` to off-box storage here (S3/R2/B2). Left as a
  // documented hook so no paid SDK is pulled in without an explicit decision.
  // Example (rclone, no SDK):  rclone copy outFile remote:rentalos-backups/TENANT/
  if (process.env.BACKUP_S3_BUCKET) {
    console.warn('[backup] BACKUP_S3_BUCKET set but upload hook is not wired — see runbook.')
  }

  prune()
}

if (CHECK_ONLY) {
  process.exit(check() ? 0 : 1)
}
if (!DB_URL) {
  console.error('SUPABASE_DB_URL is required. Run with --check for diagnostics.')
  process.exit(1)
}
if (!pgDumpAvailable().ok) {
  console.error('pg_dump not found on PATH. Install postgresql-client. Run --check for diagnostics.')
  process.exit(1)
}
backup()
