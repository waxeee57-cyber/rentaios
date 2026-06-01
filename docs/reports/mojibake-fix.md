# UTF-8 Mojibake — Final Fix Report

**Branch:** `fix/utf8-mojibake-v2` (off `fix/p0-security-rls`, the live line).
**Date:** 2026-06-01 · **Production:** read-only (SELECT) only; no writes, no deploy.

## Root cause (mechanism)
**Double-encoding.** Source files were saved by a Windows editor as cp125x
instead of UTF-8: real characters were decoded as cp1252/cp1250 and re-saved as
UTF-8. So `—` (E2 80 94) became `â€"` and `€` (E2 82 AC) became `â‚¬`. The
accented place names in the demo seed (`Málaga`, `Banús`) were corrupted via
**cp1250** (`Ă`-lead) rather than cp1252 — i.e. mixed code pages. Legitimate
single accented chars (Spanish/Hungarian i18n, real `—`) were never affected,
which is why only some files showed mojibake.

## Code vs DB
- **CODE** (24 files, fixed on this branch) — all hardcoded strings.
- **DB** (prod, read-only verified) — `business_config.currency_symbol` only.
  The demo car description (`cars.demo-porsche-911`) is **not** a separate DB fix:
  it is regenerated nightly by `reset-demo`, whose seed strings are now clean.

## Full grep hit-list (before fix)
Unique mojibake sequences found in app sources (cp = codepoints):

| Sequence | Codepoints | Correct | Count |
|---|---|---|---|
| em dash | U+00E2 U+20AC U+201D | `—` | (in `â€` family, 54) |
| en dash | U+00E2 U+20AC U+201C | `–` | ″ |
| ellipsis | U+00E2 U+20AC U+00A6 | `…` | ″ |
| right/left single quote | U+00E2 U+20AC U+2122 / U+02DC | `'` `'` | ″ |
| left/right double quote | U+00E2 U+20AC U+0153 / U+009D | `"` `"` | ″ |
| bullet | U+00E2 U+20AC U+00A2 | `•` | ″ |
| euro | U+00E2 U+201A U+00AC | `€` | 6 |
| right arrow | U+00E2 U+2020 U+2019 | `→` | 23 (`â†`) |
| left arrow | U+00E2 U+2020 U+0090 | `←` | 1 |
| middle dot | U+00C2 U+00B7 | `·` | 4 |
| a-acute (Málaga) | U+0102 U+02C7 | `á` | 1 |
| u-acute (Banús) | U+0102 U+015F | `ú` | 2 |

**Total fixed: 90 sequences across 24 files**, including the confirmed symptoms:
`billing/page.tsx` (`€79/149/249/mo` + invoice `€`), `page.tsx` L89 (`Free trial — …`),
`analytics/page.tsx` L88/L112 headers, and **`api/cron/reset-demo/route.ts`**
(Porsche desc `—`, `Málaga Airport`, `Puerto Banús`) — the source of the nightly
DB corruption. Other files touched: gumroad/billing webhooks, document-expiry,
dunning, cold-email-followup, outreach, booking lookup, weekly-report, waitlist,
layout, bookings, customers, demo admin/fleet pages, manual-bookings, addons,
settings slug, inquiries.

> The `.claude/skills/.../README.cs.md` / `.pl.md` "hits" are **legitimate** Czech/
> Polish text in a gitignored third-party skill (not app code) — excluded.

## What changed
1. **Code** — rewrote all 90 mojibake sequences to clean single-encoded UTF-8
   (real `€`, `—`, `–`, `…`, `·`, `→`, `←`, `á`, `ú`). Files saved UTF-8, no BOM.
2. **Guard** — `scripts/lint-mojibake.mjs` + `pnpm lint:mojibake`. Detects a
   `Â/Ã/â/Ă` lead followed by a high/special char (plus U+FFFD). Wired into
   `build`: `node scripts/lint-mojibake.mjs && next build`.
3. **Prevention** — `.editorconfig` (`charset = utf-8`, `eol = lf` repo-wide) and
   `.gitattributes` (text=auto eol=lf; binaries excluded).
4. **Fleet polish** (`/admin/cars`) — added `formatCategory` (known-types map:
   `suv→SUV`, `mpv→MPV`, `ev→EV`, else Title Case) and `formatVehicleSpecs`
   (joins `category · transmission · fuel`, dropping empty segments so a missing
   field no longer leaves a dangling `· ·`). Applied to the card summary line and
   the Basic-Info Category value in `CarsManager.tsx`.
5. **DB correction (prepared, NOT applied)** —
   `supabase/corrections/2026-06-01_fix_currency_symbol.sql` +
   `docs/runbooks/db-mojibake-correction.md`.

## Guard proof (RED → GREEN)
- **GREEN** (fixed tree): `node scripts/lint-mojibake.mjs` → `OK, scanned 244 files, no mojibake.` (exit 0)
- **RED** (pre-fix content from `HEAD`, byte-exact): guard flagged **14 lines**
  in `billing/page.tsx` + `reset-demo/route.ts` (euro, dashes, arrows, cp1250
  accents) → exit 1.
- **Build gate proven live**: an early draft of the correction SQL accidentally
  embedded the mojibake euro in a comment — the guard **failed the build** until
  it was removed. The gate works end-to-end.

## Remaining human steps
1. **Run the DB correction on prod after a backup** —
   `supabase/corrections/2026-06-01_fix_currency_symbol.sql` (idempotent, EUR-scoped,
   one row). Verify per runbook. Dev-branch proof was intentionally skipped (your
   call) for a one-row idempotent UPDATE; target verified as real `€` U+20AC.
2. **Deploy this branch** so the `reset-demo` cron seeds clean demo data (the
   `demo-porsche-911` DB description then self-heals on the next nightly run).
3. **Build chaining when branches converge** — this branch's `build` runs
   `lint:mojibake && next build`. When merged with `feat/phase1-prod-ready`
   (which adds `secret-guard`), chain both:
   `node scripts/secret-guard.mjs && node scripts/lint-mojibake.mjs && next build`.

## Files
```
A scripts/lint-mojibake.mjs
A .editorconfig, .gitattributes
A supabase/corrections/2026-06-01_fix_currency_symbol.sql
A docs/runbooks/db-mojibake-correction.md, docs/reports/mojibake-fix.md
M package.json (build gate + lint:mojibake script)
M lib/formatters.ts (formatCategory / formatVehicleSpecs / formatSpecLine)
M components/admin/CarsManager.tsx (SUV + empty-segment polish)
M 24 source files (mojibake → clean UTF-8)
```
