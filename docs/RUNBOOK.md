# RentalOS — Operations Runbook

## Document Management

### Supabase Storage Setup

Three private storage buckets must be created manually in Supabase before document uploads will work:

1. Go to **Supabase Dashboard → Storage → New Bucket**
2. Create: `vehicle-documents` — Public: OFF, File size limit: 20MB
3. Create: `customer-documents` — Public: OFF, File size limit: 20MB
4. Create: `booking-documents` — Public: OFF, File size limit: 20MB

All buckets must have Public access OFF. The service role key handles all reads/writes from API routes.

### Running the Migration

Run `supabase/migrations/12_documents.sql` in Supabase Studio → SQL Editor.
This creates: `vehicle_documents`, `customer_documents`, `booking_documents` tables with RLS enabled.

### Document Types Supported

- **Vehicle**: Insurance, Registration, MOT Certificate, Service History, Purchase Invoice, Other
- **Customer**: Driving Licence (Front/Back), Passport, National ID, Proof of Address, Other
- **Booking**: Rental Agreement, Damage Report, Pickup Photo, Return Photo, Deposit Receipt, Other

Accepted file formats: JPEG, PNG, WEBP, PDF. Max 20MB per file.

### Expiry Alerts

The `document-expiry` cron runs daily at 09:00 UTC. It sends one email per expiring document (vehicle and customer) within 60 days of expiry. Once an alert is sent, `expiry_alert_sent = true` prevents duplicate emails.

To test manually:
```
POST /api/cron/document-expiry
Authorization: Bearer {CRON_SECRET}
```

### Signed URLs

All document view/download URLs are signed with a 1-hour expiry. This is intentional — documents contain sensitive PII. URLs are regenerated fresh on each GET request to the document list API.

### Document Verification

Customer documents have a `verified` boolean. Toggle it in the booking detail → Customer Documents section after visually inspecting the document. The dashboard shows a count of unverified documents as a reminder.

---

## Daily Workflow

Every morning: open `/admin/bookings` → check **Inquiries** tab (red dot = waiting >2 h) → check **Today Pickups** and **Today Returns**.

---

## Inquiry Response

**Goal:** respond to every inquiry within 2 hours.

1. Open `/admin/bookings` → **Inquiries** tab
2. Click the inquiry row to expand it
3. Review: car, dates, customer details, message
4. **To confirm:**
   - Click **Confirm Booking**
   - The system sends a confirmation email to the customer automatically
   - Status moves to `confirmed`, dates are locked (overlap prevention is active)
5. **To decline:**
   - Click **Cancel**
   - Send a personal message to the customer via WhatsApp or email explaining why
   - (No automated decline email is sent — do this manually)
6. **If you need more info first:** reply to the customer via WhatsApp using the phone number shown, then add a note in Admin Notes so you remember where you left off

---

## Pickup Procedure

**Day of pickup:**

1. Open `/admin/bookings` → **Today Pickups** tab (or **Upcoming** for advance prep)
2. Expand the booking
3. **Collect documents from customer:**
   - Tap **Capture Licence** → take a photo of the driving licence
   - Tap **Capture ID** → take a photo of the passport / national ID
   - Photos upload directly to Supabase Storage (private, not publicly accessible)
4. Collect the deposit (cash or transfer) — record the amount in **Admin Notes** (e.g. `Deposit €500 cash received`)
5. Click **Mark as Picked Up** — status moves to `picked_up`
6. Hand over keys

---

## Return Procedure

**When the vehicle comes back:**

1. Open `/admin/bookings` → **Today Returns** tab (or **Active** for currently out vehicles)
2. Expand the booking
3. Inspect the vehicle
4. Fill in **Return Notes** — any damage, fuel level, mileage, observations. This auto-saves.
5. Click **Mark as Returned** — status moves to `returned`
6. Return the deposit (or deduct for damage — note the deduction in Return Notes)
7. Once paperwork is settled, click **Mark as Completed** — status moves to `completed`

---

## Cancellation Handling

1. Expand the booking → click **Cancel**
2. Status moves to `cancelled`. Dates are freed immediately (overlap constraint no longer applies).
3. Contact the customer manually (WhatsApp or email) — no automated cancellation email is sent.
4. Note any deposit situation in Admin Notes.

---

## Conflict Resolution (Date Overlap)

The system prevents two confirmed bookings for the same vehicle on overlapping dates. If you try to confirm a booking that overlaps, the API returns an error and the status does not change.

**If a conflict appears:**
1. Check which booking is confirmed for those dates (Admin → Bookings → filter by vehicle / dates)
2. Contact the newer inquiry customer to offer alternative dates or a different vehicle
3. If the earlier booking needs to move, cancel it first, then re-confirm both

**Important:** `inquiry` status does NOT lock dates. Only `confirmed`, `picked_up`, and `returned` prevent overlaps. You can have multiple inquiries for the same dates — first one confirmed wins.

---

## Manual Booking (Walk-in or Phone)

For customers who don't go through the website inquiry form:

1. `/admin/bookings` → **New Booking** (top-right button)
2. Fill in: vehicle, dates, customer name, email, phone, pickup location, price, deposit
3. Set source to `manual`
4. Submit — booking is created directly in `confirmed` status
5. The system sends a confirmation email to the customer

---

## Supabase Studio Operations

Access: `https://supabase.com/dashboard/project/[your-project-id]`

### View all bookings
Table Editor → `bookings` table

### Fix a booking status manually
SQL Editor:
```sql
update bookings
set status = 'confirmed'  -- or any valid status
where booking_code = '[YOUR-BOOKING-CODE]';
```
Valid statuses: `inquiry`, `confirmed`, `picked_up`, `returned`, `completed`, `cancelled`

### Delete a test booking
```sql
delete from bookings where booking_code = '[YOUR-BOOKING-CODE]';
```

### View uploaded documents
Storage → `documents` bucket → browse by booking ID folder

### Add a new vehicle
Insert a row into the `cars` table with all required fields. Add photos to Supabase Storage or update the `photos` column to point to hosted image URLs.

---

## Deposit Ledger Note

There is no automated deposit tracking in this system. Keep a simple record (spreadsheet or notes app) with:

| Booking Code | Customer | Amount | Received | Returned | Notes |
|---|---|---|---|---|---|
| [CODE-001] | John Smith | €500 | ✓ cash | ✓ full | — |
| [CODE-002] | Maria García | €500 | ✓ transfer | partial | scratch on bumper, €100 deducted |

Add deposit info to **Admin Notes** on each booking so everything is in one place.
