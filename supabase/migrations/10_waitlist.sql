CREATE TABLE waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  vertical text CHECK (vertical IN (
    'yacht', 'villa', 'motorcycle',
    'multi_language', 'arabic', 'deposit_hold', 'other'
  )),
  source_page text,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX waitlist_email_vertical_idx
  ON waitlist(email, vertical);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
