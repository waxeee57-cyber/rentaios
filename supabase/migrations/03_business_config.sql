CREATE TABLE business_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL DEFAULT 'RentalOS',
  business_email text NOT NULL DEFAULT 'hello@rentaios.com',
  business_phone text,
  business_whatsapp text,
  business_address text,
  business_city text DEFAULT 'Marbella',
  business_country text DEFAULT 'Spain',
  delivery_radius_km integer DEFAULT 25,
  delivery_base_location text DEFAULT 'San Juan de los Terreros',
  currency_code text DEFAULT 'EUR',
  currency_symbol text DEFAULT '€',
  min_driver_age integer DEFAULT 25,
  min_license_years integer DEFAULT 2,
  max_rental_days integer DEFAULT 14,
  primary_color text DEFAULT '#C8A96B',
  logo_url text,
  hero_image_url text,
  tagline text DEFAULT 'The Coast, Driven Beautifully',
  about_text text,
  cancel_tier1_days integer DEFAULT 7,
  cancel_tier1_pct integer DEFAULT 100,
  cancel_tier2_days integer DEFAULT 2,
  cancel_tier2_pct integer DEFAULT 50,
  cancel_tier3_pct integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Only one row ever — enforce it
CREATE UNIQUE INDEX business_config_singleton ON business_config ((true));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_business_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_config_updated_at
  BEFORE UPDATE ON business_config
  FOR EACH ROW EXECUTE FUNCTION update_business_config_updated_at();

-- Default row
INSERT INTO business_config (business_name) VALUES ('RentalOS');
