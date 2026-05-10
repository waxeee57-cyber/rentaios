CREATE TABLE referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_email text NOT NULL,
  referrer_code text UNIQUE NOT NULL
    DEFAULT substr(md5(random()::text), 1, 8),
  referee_email text,
  referee_business text,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'signed_up', 'subscribed', 'credited')
  ),
  credited_at timestamptz,
  created_at timestamptz DEFAULT now()
);
