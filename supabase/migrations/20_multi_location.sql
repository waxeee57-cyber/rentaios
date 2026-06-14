-- 20_multi_location.sql
-- RentalOS — additive multi-location support. NON-BREAKING by construction:
--  * new table + nullable columns + one boolean flag (default false)
--  * single-location tenants (CostaSol, Berelj ki!) are 100% unaffected until the
--    tenant flips business_config.multi_location_enabled = true
--  * RLS mirrors public.cars: public reads active rows, writes happen via service_role

-- 1) Locations -------------------------------------------------------------
create table if not exists public.locations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text unique,
  address       text,
  city          text,
  postal_code   text,
  phone         text,
  lat           numeric,
  lng           numeric,
  opening_hours jsonb   default '{}'::jsonb,
  is_active     boolean default true,
  sort_order    integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.locations enable row level security;

drop policy if exists "Public can view active locations" on public.locations;
create policy "Public can view active locations"
  on public.locations for select
  to public
  using (is_active = true);

-- dedicated trigger fn (uniquely named so it never clobbers an existing shared fn)
create or replace function public.locations_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_locations_updated_at on public.locations;
create trigger trg_locations_updated_at
  before update on public.locations
  for each row execute function public.locations_set_updated_at();

-- 2) Cars -> location (nullable: existing 11 rows stay valid; NULL = available everywhere)
alter table public.cars
  add column if not exists location_id uuid references public.locations(id) on delete set null;
create index if not exists idx_cars_location_id on public.cars(location_id);

-- 3) Bookings -> pickup/dropoff location (nullable FKs; keep existing text columns for back-compat)
alter table public.bookings
  add column if not exists pickup_location_id  uuid references public.locations(id) on delete set null,
  add column if not exists dropoff_location_id uuid references public.locations(id) on delete set null;
create index if not exists idx_bookings_pickup_location_id  on public.bookings(pickup_location_id);
create index if not exists idx_bookings_dropoff_location_id on public.bookings(dropoff_location_id);

-- 4) Tenant toggle: OFF by default => zero behaviour change for single-location tenants
alter table public.business_config
  add column if not exists multi_location_enabled boolean default false;
