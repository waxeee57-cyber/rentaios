# BLOK 1 — Production-Ready Foundation — Report

**Branch:** `feat/phase1-prod-ready` (built on `fix/p0-security-rls`, which the
P0/Blok-0 work lives on — it is **not** yet merged to `main`).
**Date:** 2026-06-01
**Production:** READ-ONLY throughout (SELECT / get_project / get_advisors only).
No prod writes, no deploy. The only billable action — a temporary Supabase dev
branch for the restore→smoke proof — was explicitly approved, then deleted.

---

## TL;DR

| # | Deliverable | Status |
|---|---|---|
| 1 | Secret-guard build-time CI + leak test | ✅ Done, RED-on-leak / GREEN-on-repo proven |
| 2 | Guest-flow error handling + server idempotency | ✅ Done (chat silent-failures fixed, inquiry + Stripe idempotency) |
| 3 | `/api/health` + Domrol Ops route + alert-stub | ✅ Done |
| 4 | Sentry integration (placeholder DSN) | ✅ Done, inert until DSN set |
| 5 | Backup + restore scripts + runbook | ✅ Done, restore→smoke proven on a dev branch |

`pnpm build` → **0 errors** (secret-guard runs first and gates the build).
`npx tsc --noEmit` → **0 errors**. `node scripts/secret-guard.test.mjs` → **7/7 pass**.

---

## 1. Secret-guard (build-time)

**What I audited.** Every import of the service-role client, Stripe client, and
admin/anon Supabase clients across `app/`, `components/`, `lib/`. Mapped the
runtime import graph (value imports only — `import type` is erased and ignored).

**What I changed.**
- `lib/stripe.ts` — added `import 'server-only'` (it reads `STRIPE_SECRET_KEY`
  but had no guard). `getStripe` is otherwise unused; routes build Stripe inline.
- `lib/n8n.ts` — added `import 'server-only'` (reads `N8N_WEBHOOK_SECRET`) **and**
  fixed a **PII-in-logs leak**: the dev-mode `console.log` dumped the whole
  inquiry payload (incl. `customer_email`). Now logs `booking_code` only, per the
  CLAUDE.md "booking codes only" rule.
- `scripts/secret-guard.mjs` — the guard. Three rules:
  - **RULE 1** shared `lib/`/`components/` module touching a high-value secret
    (`SERVICE_ROLE`, `STRIPE_SECRET`, `*_SECRET`, `*_TOKEN`, `PASSWORD`) must have
    `import 'server-only'`.
  - **RULE 2** nothing in the client-reachable closure (from every `'use client'`
    file **and** `instrumentation-client.*`) may import `server-only` or read a
    non-`NEXT_PUBLIC_` env var (`NODE_ENV`/`NEXT_RUNTIME`/`NEXT_PHASE` allow-listed).
  - **RULE 3** no module imports both the anon client and the admin client.
- `scripts/secret-guard.test.mjs` — proves it: 6 planted-leak fixtures go **RED**,
  the type-only + `NEXT_PUBLIC_` fixtures stay **GREEN**, and the real repo is **GREEN**.
- `package.json` — `build` is now `node scripts/secret-guard.mjs && next build`,
  plus `secret-guard` / `secret-guard:test` scripts.

**Proof.**
```
node scripts/secret-guard.test.mjs
  PASS  A: planted client->secret leak is RED (RULE2)
  PASS  B: server-only reachable from client is RED (RULE2)
  PASS  C: unguarded shared secret module is RED (RULE1)
  PASS  D: anon+admin client mix is RED (RULE3)
  PASS  E: type-only import of server-only module is GREEN
  PASS  F: NEXT_PUBLIC_ env in client is GREEN
  PASS  G: real repo is GREEN (scanned 214 files)
```

---

## 2. Guest-flow error handling + server idempotency

**Audited:** booking inquiry (`/api/inquiries/create` + `InquiryDrawer`), chat
(`ChatWidget` + `/api/chat/*`), payment (`/api/billing/webhook`), booking lookup.

**Findings + fixes.**
- **ChatWidget — two silent failures (fixed):**
  1. On conversation-create failure the user's typed text was cleared with **no
     error shown** (data loss). Now the text is preserved, an error banner with a
     retry hint appears, and the input is only cleared once the send is in flight.
  2. The message `POST` had **zero** error handling — a failed send left a fake
     "delivered" bubble. Now: optimistic bubble rolls back on failure, text is
     restored, `429` vs generic error messaged, connection errors caught.
  3. Added a load-failure state with a "Try again" button (404 = fresh session,
     handled silently).
- **Inquiry creation — idempotency (fixed):** double-submit / retry created
  duplicate `inquiry` rows (`no_overlap` only covers confirmed/picked_up/returned).
  Added a look-back dedup (returns the existing `booking_code` for the same
  car+customer+date-range) — **works on the current schema, no migration needed** —
  plus graceful handling of the migration-19 unique-index conflict for true
  concurrency.
- **Stripe webhook — idempotency (fixed):** Stripe redelivers events
  (at-least-once); reprocessing re-sent emails. Added a `stripe_events` ledger
  insert that short-circuits duplicates. **Degrades gracefully** if migration 19
  isn't applied yet (catches `42P01 undefined_table` and proceeds).
- `InquiryDrawer` already had solid handling (submit-disable, error counter,
  WhatsApp fallback) — left as is. Booking-lookup already hardened (unified 404
  anti-enumeration, rate-limit, validation).

**`InquiryDrawer` was already double-submit-guarded client-side** (`disabled={submitting}`);
the server dedup is the durable backstop.

> **Language note (needs a Roland decision):** the spec asked for *magyar*
> feedback. The public guest UI (CostaSol) is an **English** product with HU/ES
> i18n variants, and these strings are currently hardcoded English (not routed
> through `next-intl`). I fixed the **functional** gaps and kept each component's
> existing language rather than inject Hungarian into the English flow. Decision
> for you: (a) leave English, (b) route all guest error strings through the
> translation system (larger i18n task, recommended), or (c) Hungarian-only.

---

## 3. Monitoring + health

- **`lib/health.ts`** (server-only) — shared `getHealthDetails()` (DB ping,
  required-env completeness + missing list, Resend/Stripe configured flags,
  `APP_SCHEMA_VERSION = 19`, release sha), `pingDb()`, `lastBookingAt()`.
- **`/api/health`** — public response is **only** `{ status: 'ok' | 'degraded' }`
  (200/503), nothing descriptive. With `x-health-secret == HEALTH_SECRET` it
  returns full details. No secret value is ever returned.
- **`/api/ops/status`** — Domrol Ops, internal cross-tenant view. Auth:
  `x-ops-secret == OPS_SECRET` (route 404s if `OPS_SECRET` unset, so it can't be
  left open by accident). Reports per-tenant `status`, last real booking +
  staleness flag, schema version, release. **Multi-tenant-ready:** local tenant
  inspected directly; remote tenants declared in `OPS_TENANTS` (JSON) and polled
  via their own `/api/health`. One tenant today, array shape for many.
- **`/api/cron/health-watch`** (hourly, added to `vercel.json`) — alerts on
  `health=degraded` (critical) or no real booking in 48h (warning).
- **`lib/alerts.ts`** — `dispatchAlert()`: POSTs to `ALERT_WEBHOOK_URL` if set,
  else Resend email if `ALERT_EMAIL_ENABLED=true`, else a **logged stub**. Never
  throws, carries **no PII** (tenant slug + reason only). No paid integration
  wired without a decision.

---

## 4. Sentry (placeholder DSN)

- Installed `@sentry/nextjs@10.55.0` (free SDK). Marked `@sentry/cli`'s build
  script as ignored in `pnpm-workspace.yaml` (`allowBuilds`) — its only job is
  downloading the source-map-upload CLI, which we intentionally skip.
- **`instrumentation.ts`** (server, Next-16 native hook) — `register()` inits
  Sentry **only if `SENTRY_DSN` is set**; exports `onRequestError`.
- **`instrumentation-client.ts`** — inits browser SDK **only if
  `NEXT_PUBLIC_SENTRY_DSN` is set**; exports `onRouterTransitionStart`.
- **`lib/sentry-scrub.ts`** — PII scrubbing (pure, no env, safe both sides):
  drops `user.email`/`ip`, scrubs `query_string` (booking URLs carry `?email=`),
  cookies, sensitive headers (incl. `x-health/ops-secret`), and deep-redacts any
  key matching `email|phone|token|authorization|cookie|password|secret|session_id|visitor`.
  `sendDefaultPii: false`. **`visitor_email`/session tokens never leave the system.**
- env + release tagged (`VERCEL_GIT_COMMIT_SHA` server, `NEXT_PUBLIC_RELEASE` client).
- **Inert by default**: with no DSN (the placeholder state) the app builds and
  runs identically — zero events, zero overhead.

---

## 5. Backup + restore (dev-branch proven)

- **`scripts/backup.mjs`** — `pg_dump` (custom/compressed), per-tenant timestamped
  filename, retention prune, `< 1 KB` = failure guard, `--check` prerequisites
  mode, external-upload hook (documented, no paid SDK). `pnpm backup` / `pnpm backup:check`.
- **`scripts/restore.mjs`** — `pg_restore --clean --if-exists` into a **disposable**
  target, with a **prod-overwrite guard** (`PROD_DB_HOST` + `--force-prod`), then a
  `psql` **smoke** (core tables queryable + migration-19 objects present).
- **`docs/runbooks/backup-restore.md`** — full runbook incl. DR flow and the
  free-vs-paid tier table.
- **`supabase/migrations/19_idempotency.sql`** — the inquiry dedup unique index +
  `stripe_events` ledger. 100% additive; code degrades gracefully without it.

**Live proof (Supabase dev branch `midcpowguytqzdftybiy`, created → proven →
deleted):**
- Migration 19 applied cleanly to a fresh branch (`{"success":true}`).
- Idempotency: `inquiry_dup_blocked=true`, `stripe_evt_dup_blocked=true`,
  `inquiry_rows_kept=1`, `stripe_evt_rows_kept=1`.
- Restore round-trip: `src_cars=restored_cars=1`, `src_bookings=restored_bookings=1`,
  `src_events=restored_events=1`; smoke `dedup_idx=1`, `stripe_events_tbl=1`.
- Branch deleted; only `main` remains (cost stopped, ~cents).

> `pg_dump`/`psql` are **not installed on the dev box**, so the real binary
> round-trip can't run here — `pnpm backup:check` correctly reports this. The
> dev-branch proof validates the migration, the idempotency guarantees, and the
> restore smoke assertions at the database level.

---

## Remaining human / dashboard steps

These are **prod-intended but NOT applied** (prod untouched):

1. **Apply migration 19 to prod** before/at the deploy of this branch
   (`supabase/migrations/19_idempotency.sql`). The code is safe either way, but
   the unique index + `stripe_events` table give the hard guarantees. Prove on a
   dev branch first per the runbook (already done here once).
2. **Sentry DSN** — create the Sentry project, set `SENTRY_DSN` +
   `NEXT_PUBLIC_SENTRY_DSN` (+ optional `*_ENV`, `SENTRY_RELEASE`) in Vercel. Until
   then Sentry is inert by design.
3. **Alerting** — set `ALERT_WEBHOOK_URL` (Slack/Discord/n8n) **or**
   `ALERT_EMAIL_ENABLED=true`. Set `HEALTH_SECRET` and `OPS_SECRET` (strong random)
   to unlock `/api/health` details and the Ops route.
4. **Backups** — install `postgresql-client` on the cron host, set
   `SUPABASE_DB_URL` (direct 5432 string) + `BACKUP_DIR` (off-box) + retention,
   schedule `pnpm backup` daily, wire the external-upload hook.
5. **Paid Supabase tier** — a real paying client must be on **Supabase Pro+**:
   the free tier has **no managed backups / no PITR**. These logical dumps are a
   complement, not a replacement for provider-managed backups.
6. **STATUS.md** — Roland's `feature/complete-sprint-tasks` entry (2026-05-16) is
   stale; confirm/clear it. This branch claimed its area.
7. **Language decision** — see §2 note on guest-flow error-string language / i18n.

## Files added / changed (high level)
```
A scripts/secret-guard.mjs, scripts/secret-guard.test.mjs
A scripts/backup.mjs, scripts/restore.mjs
A lib/health.ts, lib/alerts.ts, lib/ops-registry.ts, lib/sentry-scrub.ts
A instrumentation.ts, instrumentation-client.ts
A app/api/ops/status/route.ts, app/api/cron/health-watch/route.ts
A supabase/migrations/19_idempotency.sql
A docs/runbooks/backup-restore.md, docs/reports/blok1-prod-ready.md
M lib/stripe.ts, lib/n8n.ts            (server-only guards + PII log fix)
M app/api/health/route.ts              (public ok/degraded, details server-only)
M app/api/inquiries/create/route.ts    (inquiry idempotency)
M app/api/billing/webhook/route.ts     (stripe event idempotency)
M components/chat/ChatWidget.tsx       (silent-failure fixes + error UI)
M package.json (build gate + scripts), vercel.json (health-watch cron)
M .env.example (ops/alert/sentry placeholders), pnpm-workspace.yaml, STATUS.md
```
