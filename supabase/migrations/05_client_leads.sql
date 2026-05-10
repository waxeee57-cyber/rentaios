CREATE TABLE client_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  business_type text NOT NULL,
  business_type_custom text,
  business_city text NOT NULL,
  business_country text NOT NULL,
  current_booking_method text,
  monthly_bookings_estimate text,
  vehicle_count integer,
  domain_name text,
  preferred_language text DEFAULT 'English',
  logo_url text,
  brand_color text DEFAULT '#C8A96B',
  tagline text,
  delivery_location text,
  delivery_radius text DEFAULT '25 km',
  min_driver_age integer DEFAULT 25,
  min_license_years integer DEFAULT 2,
  max_rental_days integer DEFAULT 14,
  cancellation_policy text DEFAULT 'flexible',
  notes text,
  referral_source text,
  status text NOT NULL DEFAULT 'new' CHECK (
    status IN ('new', 'contacted', 'in_progress', 'live', 'cancelled')
  ),
  deployment_checklist jsonb NOT NULL DEFAULT '{
    "payment_confirmed": false,
    "supabase_created": false,
    "domain_configured": false,
    "business_config_set": false,
    "fleet_data_entered": false,
    "test_booking_done": false,
    "credentials_sent": false,
    "client_signed_off": false
  }'::jsonb,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE client_leads ENABLE ROW LEVEL SECURITY;
-- No public read/write. Service role only via API routes.

CREATE OR REPLACE FUNCTION set_client_leads_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER client_leads_updated_at
  BEFORE UPDATE ON client_leads
  FOR EACH ROW EXECUTE FUNCTION set_client_leads_updated_at();
