-- Vehicle documents (attached to cars table)
CREATE TABLE vehicle_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN (
    'insurance', 'registration', 'mot_certificate', 'service_history', 'purchase_invoice', 'other'
  )),
  document_type_label text,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size_bytes integer,
  mime_type text,
  expires_at date,
  notes text,
  expiry_alert_sent boolean DEFAULT false,
  uploaded_by text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;

-- Customer documents (attached to customers table)
CREATE TABLE customer_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN (
    'driving_licence_front', 'driving_licence_back', 'passport', 'national_id', 'proof_of_address', 'other'
  )),
  document_type_label text,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size_bytes integer,
  mime_type text,
  expires_at date,
  notes text,
  verified boolean DEFAULT false,
  expiry_alert_sent boolean DEFAULT false,
  uploaded_by text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customer_documents ENABLE ROW LEVEL SECURITY;

-- Booking documents (structured, per booking)
CREATE TABLE IF NOT EXISTS booking_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN (
    'rental_agreement', 'damage_report', 'pickup_photo', 'return_photo', 'deposit_receipt', 'other'
  )),
  document_type_label text,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size_bytes integer,
  mime_type text,
  notes text,
  uploaded_by text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE booking_documents ENABLE ROW LEVEL SECURITY;

-- Supabase Storage buckets must be created manually in the dashboard:
-- vehicle-documents  (private, 20MB limit)
-- customer-documents (private, 20MB limit)
-- booking-documents  (private, 20MB limit)
