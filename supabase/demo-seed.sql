-- Demo seed data for /demo routes.
-- Run AFTER 07_demo_mode.sql migration.
-- These rows are deleted and re-created daily by /api/cron/reset-demo.

-- Demo cars (is_demo = true)
INSERT INTO cars (slug, brand, model, year, category, daily_price_eur, deposit_eur, status, is_demo, features, description)
VALUES
  (
    'demo-ferrari-488',
    'Ferrari', '488 Spider', 2024, 'sport',
    850, 10000, 'available', true,
    '["V8 Twin-Turbo", "Convertible", "7-speed DCT", "Launch Control", "Carbon ceramic brakes"]',
    'The Ferrari 488 Spider combines a 3.9-litre twin-turbo V8 with the purest open-top driving experience. 670 hp, 0-100 in 3.0 seconds.'
  ),
  (
    'demo-bentley-bentayga',
    'Bentley', 'Bentayga', 2024, 'suv',
    650, 8000, 'available', true,
    '["4.0L V8 Biturbo", "AWD", "Air suspension", "Naim audio", "Mulliner interior"]',
    'The Bentley Bentayga defines the luxury SUV. Effortless performance with hand-crafted British craftsmanship throughout.'
  ),
  (
    'demo-porsche-911',
    'Porsche', '911 Carrera', 2024, 'sport',
    480, 6000, 'available', true,
    '["3.0L Flat-6 Turbo", "PDK 8-speed", "Sport Chrono", "PASM suspension", "Bose sound"]',
    'The Porsche 911 Carrera — the icon that set the benchmark for sports cars. 385 hp, rear-wheel drive, timeless in every generation.'
  );

-- Demo customers (needed for demo bookings)
INSERT INTO customers (id, email, phone, full_name, country)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'demo-james@example.com', '+44 7700 000001', 'James Harrington', 'United Kingdom'),
  ('00000000-0000-0000-0000-000000000002', 'demo-sofia@example.com', '+34 600 000002', 'Sofia Andersen', 'Denmark'),
  ('00000000-0000-0000-0000-000000000003', 'demo-marco@example.com', '+39 347 000003', 'Marco Bianchi', 'Italy')
ON CONFLICT (email) DO NOTHING;

-- Demo bookings (is_demo = true)
-- We reference cars by their slugs for simplicity; must match inserted cars above.
DO $$
DECLARE
  v_ferrari uuid;
  v_bentley uuid;
  v_porsche uuid;
  v_customer1 uuid := '00000000-0000-0000-0000-000000000001';
  v_customer2 uuid := '00000000-0000-0000-0000-000000000002';
  v_customer3 uuid := '00000000-0000-0000-0000-000000000003';
BEGIN
  SELECT id INTO v_ferrari FROM cars WHERE slug = 'demo-ferrari-488';
  SELECT id INTO v_bentley FROM cars WHERE slug = 'demo-bentley-bentayga';
  SELECT id INTO v_porsche FROM cars WHERE slug = 'demo-porsche-911';

  -- 1. Inquiry (today)
  INSERT INTO bookings (booking_code, car_id, customer_id, pickup_location, dropoff_location,
    start_at, end_at, days, total_eur, deposit_eur, status, is_demo, source)
  VALUES (
    'DEMO-001', v_ferrari, v_customer1,
    'Marbella City Centre', 'Marbella City Centre',
    now() + interval '3 days', now() + interval '6 days',
    3, 2550, 10000, 'inquiry', true, 'web'
  );

  -- 2. Confirmed (pickup tomorrow)
  INSERT INTO bookings (booking_code, car_id, customer_id, pickup_location, dropoff_location,
    start_at, end_at, days, total_eur, deposit_eur, status, is_demo, source)
  VALUES (
    'DEMO-002', v_bentley, v_customer2,
    'Málaga Airport', 'Marbella',
    now() + interval '1 day', now() + interval '5 days',
    4, 2600, 8000, 'confirmed', true, 'web'
  );

  -- 3. Picked up (started 2 days ago)
  INSERT INTO bookings (booking_code, car_id, customer_id, pickup_location, dropoff_location,
    start_at, end_at, days, total_eur, deposit_eur, status, is_demo, source)
  VALUES (
    'DEMO-003', v_porsche, v_customer3,
    'Puerto Banús', 'Puerto Banús',
    now() - interval '2 days', now() + interval '3 days',
    5, 2400, 6000, 'picked_up', true, 'web'
  );

  -- 4. Completed (last week)
  INSERT INTO bookings (booking_code, car_id, customer_id, pickup_location, dropoff_location,
    start_at, end_at, days, total_eur, deposit_eur, status, is_demo, source)
  VALUES (
    'DEMO-004', v_ferrari, v_customer2,
    'Estepona', 'Estepona',
    now() - interval '10 days', now() - interval '7 days',
    3, 2550, 10000, 'completed', true, 'web'
  );

  -- 5. Cancelled (last week)
  INSERT INTO bookings (booking_code, car_id, customer_id, pickup_location, dropoff_location,
    start_at, end_at, days, total_eur, deposit_eur, status, is_demo, source)
  VALUES (
    'DEMO-005', v_bentley, v_customer1,
    'Marbella City Centre', 'Marbella City Centre',
    now() - interval '8 days', now() - interval '5 days',
    3, 1950, 8000, 'cancelled', true, 'web'
  );
END $$;
