CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  plan text CHECK (plan IN ('starter', 'pro', 'white_glove')),
  status text CHECK (status IN (
    'active', 'past_due', 'cancelled', 'trialing'
  )) DEFAULT 'trialing',
  trial_ends_at timestamptz DEFAULT now() + interval '14 days',
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Default trial row (single-tenant: one subscription per installation)
INSERT INTO subscriptions DEFAULT VALUES;
