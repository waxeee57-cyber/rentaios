-- ============================================================
-- DB CORRECTION — business_config.currency_symbol mojibake
-- 2026-06-01  ·  HUMAN-RUN ONLY (after backup). NOT auto-applied.
--
-- WHY
--   The prod row holds the double-encoded (mojibake) form of the euro sign in
--   currency_symbol instead of a real U+20AC. Any code path that reads
--   config.currency_symbol directly renders mojibake. (Fleet prices are safe —
--   they use Intl/EUR via formatPrice(), not this column.)
--
-- SAFETY
--   - Idempotent: re-running changes nothing once the value is '€'.
--   - Scoped to EUR configs only, so a non-EUR tenant's symbol is never touched.
--   - Does NOT embed the mojibake literal (avoids re-introducing bad bytes via a
--     mis-saved file); it simply asserts the correct symbol for EUR.
--   - PROD: run ONLY after a backup. See docs/runbooks/db-mojibake-correction.md.
--
-- NOTE
--   Do NOT also patch cars.demo-porsche-911.description here. That row is a DEMO
--   record regenerated nightly by /api/cron/reset-demo, whose seed strings are
--   now fixed in code (this branch). The next reset-demo run overwrites it with
--   clean text — a manual UPDATE would be duplicate work.
-- ============================================================

UPDATE public.business_config
SET currency_symbol = '€'
WHERE currency_code = 'EUR'
  AND currency_symbol IS DISTINCT FROM '€';

-- Verify (expect 0 rows):
-- SELECT id, currency_symbol FROM public.business_config
--   WHERE currency_code = 'EUR' AND currency_symbol IS DISTINCT FROM '€';
