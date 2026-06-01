# Runbook — DB mojibake correction (currency_symbol)

**Status:** prod-intended, **NOT applied** by the agent. A human runs this after
a backup. Production was touched read-only only.

## What & why
Prod `business_config.currency_symbol` holds the double-encoded (mojibake) form
of the euro sign instead of a real `€` (U+20AC). Anything reading
`config.currency_symbol` directly renders mojibake. Fleet prices are unaffected
(they use `Intl`/EUR via `formatPrice()`).

The code-level mojibake (incl. the `reset-demo` seed) is fixed on
`fix/utf8-mojibake-v2`. After that deploys, the **only** remaining DB item is
`currency_symbol`. The demo car description (`demo-porsche-911`) is **not** fixed
here on purpose — `reset-demo` regenerates it nightly from the now-clean code.

## Pre-flight
1. Confirm a recent backup exists (Supabase Pro daily backup or `pnpm backup`).
2. Confirm the affected row(s):
   ```sql
   SELECT id, currency_code, currency_symbol,
          (currency_symbol = '€') AS is_clean
   FROM public.business_config;
   ```
   Expect `is_clean = false` for the EUR row before the fix.

## Apply
Run `supabase/corrections/2026-06-01_fix_currency_symbol.sql` against prod
(Supabase SQL editor or `psql "$SUPABASE_DB_URL" -f ...`):
```sql
UPDATE public.business_config
SET currency_symbol = '€'
WHERE currency_code = 'EUR'
  AND currency_symbol IS DISTINCT FROM '€';
```
Idempotent — re-running is a no-op. Scoped to EUR configs only.

## Verify (expect 0 rows)
```sql
SELECT id, currency_symbol FROM public.business_config
WHERE currency_code = 'EUR' AND currency_symbol IS DISTINCT FROM '€';
```
Then load `/admin/settings` and any page using the symbol — it should show `€`.

## Correctness (dev-branch proof intentionally skipped)
By decision, no dev branch was spun for this — it is a single idempotent one-row
UPDATE. Correctness guarantees:
- The target literal in the SQL is a **real** `€` = U+20AC (verified by codepoint;
  the `lint:mojibake` guard also scans this file and confirms it is mojibake-free).
- `IS DISTINCT FROM '€'` + `currency_code = 'EUR'` makes it idempotent and scoped:
  re-running is a no-op, and non-EUR tenants are never touched.
- Run on prod **after a backup**; if anything looks wrong, restore from backup.
