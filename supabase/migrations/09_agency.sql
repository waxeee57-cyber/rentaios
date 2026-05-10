CREATE TABLE agency_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_code text NOT NULL,
  client_business_name text NOT NULL,
  client_email text NOT NULL,
  client_plan text CHECK (client_plan IN ('starter', 'growth', 'pro')),
  client_domain text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'churned', 'trial')),
  revenue_share_pct integer DEFAULT 70,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE agency_clients ENABLE ROW LEVEL SECURITY;

ALTER TABLE client_leads
  ADD COLUMN IF NOT EXISTS agency_code text;
