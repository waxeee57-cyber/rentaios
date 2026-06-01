-- ============================================================
-- 01_base_schema — canonical base tables (chain bootstrap)
-- 2026-05-31
--
-- WHY: the base tables (cars, customers, bookings, admin_users) and the
-- shared functions/triggers previously lived ONLY in supabase/schema.sql,
-- which is not part of the numbered migration chain. The chain started at
-- 02_transfer.sql, which ALTERs `bookings` — so `supabase db reset` (migrations
-- only) died at 02 on a fresh DB. This migration moves that base into the chain
-- as step 01 so 01→…→17 builds a complete DB from scratch.
--
-- SAFE ON AN EXISTING (prod) DB: every statement is idempotent —
--   CREATE TABLE/​EXTENSION IF NOT EXISTS, CREATE OR REPLACE FUNCTION,
--   DROP …​ IF EXISTS + CREATE for the constraint/triggers. Re-running it on the
--   live DB (where these objects already exist) is a no-op-equivalent. Migrations
--   run in a transaction, so the DROP+CREATE of the trigger/constraint is atomic.
--
-- ⚠️ PROD MIGRATION HISTORY: do NOT let the chain *replay* 01 against prod
--   unmanaged. Mark it already-applied instead (see docs/BASE_SCHEMA_RUNBOOK.md):
--     supabase migration repair --status applied 01
--   The idempotency here is a safety net, not the intended prod path.
--
-- Content mirrors supabase/schema.sql verbatim except for the idempotency guards.
-- Base policies live in 01b_base_policies.sql.
-- ============================================================

-- Exclusion constraints need btree_gist
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ------------------------------------------------------------ CARS
CREATE TABLE IF NOT EXISTS cars (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  brand            text not null,
  model            text not null,
  year             int,
  category         text check (category in ('sport','suv','sedan','convertible','luxury')),
  license_plate    text unique,
  transmission     text,
  fuel             text,
  seats            int,
  daily_price_eur  numeric not null,
  deposit_eur      numeric not null,
  mileage_included_per_day int default 200,
  extra_km_price_eur numeric default 0.50,
  min_driver_age   int default 25,
  min_license_years int default 2,
  status           text check (status in ('available','maintenance','hidden')) default 'available',
  photos           jsonb default '[]',
  features         jsonb default '[]',
  description      text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ------------------------------------------------------------ CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  phone      text,
  full_name  text not null,
  country    text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ------------------------------------------------------------ BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
  id               uuid primary key default gen_random_uuid(),
  booking_code     text unique not null,
  car_id           uuid not null references cars(id),
  customer_id      uuid not null references customers(id),
  pickup_location  text not null,
  dropoff_location text not null,
  start_at         timestamptz not null,
  end_at           timestamptz not null,
  days             int not null,
  total_eur        numeric not null,
  deposit_eur      numeric not null,
  customer_message text,
  status           text not null check (status in (
                     'inquiry','confirmed','picked_up','returned','completed','cancelled'
                   )) default 'inquiry',
  status_history   jsonb default '[]',
  license_doc_url  text,
  id_doc_url       text,
  return_notes     text,
  admin_notes      text,
  source           text default 'web' check (source in ('web','manual')),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Exclusion constraint: only confirmed/picked_up/returned bookings reserve dates.
-- Guarded so re-runs on an existing DB don't error on the already-present constraint.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'no_overlap' AND conrelid = 'public.bookings'::regclass
  ) THEN
    ALTER TABLE bookings ADD CONSTRAINT no_overlap
      EXCLUDE USING gist (
        car_id WITH =,
        tstzrange(start_at, end_at, '[)') WITH &&
      ) WHERE (status IN ('confirmed','picked_up','returned'));
  END IF;
END $$;

-- ------------------------------------------------------------ ADMIN USERS
-- Base shape only (id/role/full_name). user_id + email are added by
-- 17_admin_users_reconcile.sql — keep this faithful to the original schema.sql
-- so the chain order (01 then 17) matches a real fresh build.
CREATE TABLE IF NOT EXISTS admin_users (
  id         uuid primary key references auth.users on delete cascade,
  role       text default 'admin',
  full_name  text,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------ updated_at triggers
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cars_updated_at ON cars;
CREATE TRIGGER cars_updated_at
  BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS customers_updated_at ON customers;
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS bookings_updated_at ON bookings;
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------ customer upsert
CREATE OR REPLACE FUNCTION upsert_customer(
  p_email     text,
  p_phone     text,
  p_full_name text,
  p_country   text
) RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO customers (email, phone, full_name, country)
  VALUES (p_email, p_phone, p_full_name, p_country)
  ON CONFLICT (email) DO UPDATE
    SET phone      = excluded.phone,
        full_name  = excluded.full_name,
        country    = excluded.country,
        updated_at = now()
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
