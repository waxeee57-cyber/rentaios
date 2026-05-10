-- Cold email outreach tracking
CREATE TABLE IF NOT EXISTS cold_email_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  first_name text,
  last_name text,
  company_name text,
  business_type text,
  location text,
  website text,
  status text DEFAULT 'contacted' CHECK (status IN (
    'new', 'contacted', 'follow_up_1', 'follow_up_2',
    'replied', 'booked_demo', 'converted',
    'unsubscribed', 'bounced', 'not_interested'
  )),
  email_sent_at timestamptz,
  follow_up_1_sent_at timestamptz,
  follow_up_2_sent_at timestamptz,
  replied_at timestamptz,
  demo_booked_at timestamptz,
  converted_at timestamptz,
  subject text,
  body text,
  reply_text text,
  notes text,
  source text DEFAULT 'apollo',
  instantly_contact_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE cold_email_leads ENABLE ROW LEVEL SECURITY;
-- No public access — admin only via authenticated API routes.

-- Template sales tracking (Gumroad purchases)
CREATE TABLE IF NOT EXISTS template_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gumroad_sale_id text UNIQUE,
  buyer_email text NOT NULL,
  buyer_name text,
  amount_eur numeric(10,2),
  licence_type text DEFAULT 'single_deployment',
  welcome_email_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE template_sales ENABLE ROW LEVEL SECURITY;
-- No public access — admin only.

-- Subscription: dunning + access control columns
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS access_locked boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS past_due_since timestamptz,
  ADD COLUMN IF NOT EXISTS dunning_email_1_sent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS dunning_email_2_sent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS dunning_email_3_sent boolean DEFAULT false;

-- Client leads: NPS tracking
ALTER TABLE client_leads
  ADD COLUMN IF NOT EXISTS nps_score integer,
  ADD COLUMN IF NOT EXISTS nps_comment text,
  ADD COLUMN IF NOT EXISTS nps_sent_at timestamptz;
