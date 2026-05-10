-- Subscriptions: add agency/growth to plan check
ALTER TABLE subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('starter', 'growth', 'pro', 'white_glove', 'agency'));

-- Bookings: review email tracking
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS review_email_sent boolean DEFAULT false;

-- Customers: history and VIP
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS total_bookings integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_revenue_eur numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vip boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS preferred_vehicle_category text;

-- business_config: all new columns
ALTER TABLE business_config
  ADD COLUMN IF NOT EXISTS google_review_url text,
  ADD COLUMN IF NOT EXISTS review_email_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS business_slug text,
  ADD COLUMN IF NOT EXISTS slug_locked boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_powered_by boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS white_label_fee_paid boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_on_showcase boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS showcase_vehicle_type text;

-- business_slug unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'business_config_slug_unique'
  ) THEN
    ALTER TABLE business_config
      ADD CONSTRAINT business_config_slug_unique UNIQUE (business_slug);
  END IF;
END $$;

-- showcase_vehicle_type check constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'business_config_showcase_type_check'
  ) THEN
    ALTER TABLE business_config
      ADD CONSTRAINT business_config_showcase_type_check
      CHECK (showcase_vehicle_type IN ('car', 'yacht', 'villa', 'motorcycle', 'other'));
  END IF;
END $$;

-- client_leads: agency tracking
ALTER TABLE client_leads
  ADD COLUMN IF NOT EXISTS agency_code text;

-- page_events table for first-party analytics
CREATE TABLE IF NOT EXISTS page_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN (
    'page_view', 'cta_click', 'form_start',
    'form_complete', 'demo_view', 'pricing_view',
    'trial_start', 'waitlist_join'
  )),
  page text,
  metadata jsonb DEFAULT '{}',
  session_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE page_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_only" ON page_events
  FOR INSERT TO anon WITH CHECK (true);
