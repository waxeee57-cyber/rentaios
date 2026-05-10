CREATE TABLE subscription_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
  addon_key text NOT NULL CHECK (addon_key IN (
    'sms_notifications', 'deposit_hold', 'multi_language'
  )),
  stripe_subscription_item_id text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'pending')),
  activated_at timestamptz DEFAULT now(),
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_addons ENABLE ROW LEVEL SECURITY;
