-- ============================================================
-- BLOK 1 — IDEMPOTENCY HARDENING
-- Migration 19 — 2026-06-01
--
-- Adds defense-in-depth idempotency for the two guest/payment write paths
-- that can be triggered more than once for a single logical action:
--
--   1. Booking inquiry creation (app/api/inquiries/create)
--      A double-submit / double-click / network retry could insert two
--      `inquiry` rows for the same car + customer + date range. The existing
--      `no_overlap` exclusion constraint only covers confirmed/picked_up/
--      returned, NOT inquiries, so it does not stop this. The application code
--      already de-duplicates with a 10-minute look-back SELECT (works without
--      this migration), but this partial unique index makes it race-safe even
--      under truly concurrent inserts.
--
--   2. Stripe webhook (app/api/billing/webhook)
--      Stripe redelivers events (at-least-once delivery). Re-processing a
--      `checkout.session.completed` or `invoice.payment_succeeded` event would
--      re-send notification emails. The `stripe_events` table records every
--      processed event id; the handler inserts the id first and short-circuits
--      on a duplicate-key error.
--
-- SAFETY
--   - 100% additive. No existing column/row is modified.
--   - The application code degrades gracefully if this migration has NOT been
--     applied yet (catches 23505 from the index, and 42P01 undefined_table
--     from stripe_events) — so it is safe to deploy the code before/after.
--   - PROD-INTENDED but applied only after dev-branch proof (see runbook).
-- ============================================================

-- 1) Race-safe inquiry de-duplication --------------------------------------
-- A single customer cannot have two simultaneous *inquiry* rows for the exact
-- same car + start_at + end_at. Confirmed/cancelled rows are unaffected, so a
-- customer can still re-book the same car/dates later.
CREATE UNIQUE INDEX IF NOT EXISTS bookings_inquiry_dedup_idx
  ON public.bookings (car_id, customer_id, start_at, end_at)
  WHERE status = 'inquiry';

-- 2) Stripe webhook event ledger -------------------------------------------
CREATE TABLE IF NOT EXISTS public.stripe_events (
  event_id     text PRIMARY KEY,
  type         text,
  processed_at timestamptz NOT NULL DEFAULT now()
);

-- service_role (server webhook route) bypasses RLS, but enable RLS so the anon
-- role can never read the ledger. No policies = no anon access.
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.stripe_events IS
  'Idempotency ledger for Stripe webhook delivery. One row per processed event id (migration 19).';
