-- ============================================================
-- SEED DATA — development only
-- Replace with real data before launch (see PLACEHOLDERS.md)
-- ============================================================

insert into cars (
  slug, brand, model, year, category,
  daily_price_eur, deposit_eur,
  mileage_included_per_day, extra_km_price_eur,
  min_driver_age, min_license_years,
  transmission, fuel, seats,
  status, description, photos, features
) values (
  'ferrari-488-spider-2024',
  'Ferrari', '488 Spider', 2024, 'sport',
  800, 10000,
  200, 1.50,
  25, 3,
  'Automatic', 'Petrol', 2,
  'available',
  'The Ferrari 488 Spider is a masterclass in open-top performance. Its twin-turbocharged V8 delivers 660 hp with a ferocity that only a mid-engine Ferrari can produce. The retractable hardtop opens in 14 seconds — enough time to decide the sky looks better without a roof.',
  '[
    {"url": "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=1600&q=80", "alt": "Ferrari 488 Spider side profile"},
    {"url": "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1600&q=80", "alt": "Ferrari 488 Spider front detail"},
    {"url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80", "alt": "Sports car on open road"}
  ]',
  '["Twin-turbo V8 660 hp", "0–100 in 3.0s", "Retractable hardtop", "Carbon ceramic brakes", "Manettino drive mode selector", "Bluetooth audio", "Reversing camera", "Racing seats"]'
),
(
  'bentley-bentayga-2024',
  'Bentley', 'Bentayga', 2024, 'suv',
  600, 8000,
  250, 0.75,
  25, 2,
  'Automatic', 'Hybrid', 5,
  'available',
  'The Bentley Bentayga defines the luxury SUV category it created. Hand-stitched leather, a Naim for Bentley audio system, and a 4.0-litre twin-turbo V8 combine into a vehicle that is simultaneously the most refined and the most capable thing you can arrive in.',
  '[
    {"url": "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1600&q=80", "alt": "Bentley Bentayga front"},
    {"url": "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1600&q=80", "alt": "Bentley Bentayga interior"},
    {"url": "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1600&q=80", "alt": "Luxury SUV on mountain road"}
  ]',
  '["Twin-turbo V8 550 hp", "Naim premium audio", "Panoramic sunroof", "Air suspension", "360° camera", "Heated and ventilated seats", "Five seats with full boot", "Dynamic ride system"]'
),
(
  'porsche-911-carrera-2024',
  'Porsche', '911 Carrera', 2024, 'sport',
  500, 6000,
  200, 1.00,
  25, 2,
  'Automatic', 'Petrol', 4,
  'available',
  'The Porsche 911 Carrera is the benchmark against which every sports car is measured. Sixty years of unbroken evolution have produced a machine that is as precise at 9/10ths as it is forgiving at 5/10ths. The 3.0-litre flat-six is as characterful as ever.',
  '[
    {"url": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1600&q=80", "alt": "Porsche 911 Carrera side profile"},
    {"url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80", "alt": "Porsche 911 Carrera rear"},
    {"url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80", "alt": "Sports car on coastal road"}
  ]',
  '["Flat-six 385 hp", "0–100 in 4.2s", "PDK dual-clutch gearbox", "Sport Chrono package", "PASM adaptive suspension", "Bose sound system", "Reversing camera", "4 seats"]'
);
