ALTER TABLE cars ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false;
