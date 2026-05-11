# RentalOS — Database Schema Reference

Generated: 2026-05-11  
Supabase project: `cgbthkoqncgvlgzetlum.supabase.co`

---

## Entity Relationships

```
cars ──1:N──> bookings (via car_id)
customers ──1:N──> bookings (via customer_id)
cars ──1:N──> vehicle_documents (via car_id)
customers ──1:N──> customer_documents (via customer_id)
bookings ──1:N──> booking_documents (via booking_id)
subscriptions ──1:N──> subscription_addons (via subscription_id)
```

---

## Tables

### `cars`
Rental vehicles. `is_demo=true` rows are used by `/demo` and reset daily by cron.

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | yes | gen_random_uuid() | PK |
| slug | text | yes | — | Unique, URL-safe identifier |
| brand | text | yes | — | e.g. "Ferrari" |
| model | text | yes | — | e.g. "488 Spider" |
| year | integer | yes | — | |
| category | text | yes | — | sport/suv/sedan/convertible/luxury |
| daily_price_eur | numeric | yes | — | |
| deposit_eur | numeric | yes | — | Refundable deposit amount |
| status | text | yes | 'hidden' | available/maintenance/hidden |
| transmission | text | no | 'Automatic' | Automatic/Manual |
| fuel | text | no | 'Petrol' | Petrol/Diesel/Electric/Hybrid |
| seats | integer | no | 2 | |
| features | text[] | no | [] | Array of feature strings |
| photos | jsonb | no | [] | Array of `{ url, alt }` objects |
| description | text | no | null | Rich description |
| license_plate | text | no | null | |
| is_demo | boolean | no | false | Demo data flag |
| created_at | timestamptz | yes | now() | |
| updated_at | timestamptz | no | null | |

---

### `bookings`
Core booking records. Overlap prevention enforced in confirm route (application-level check).

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | yes | gen_random_uuid() | PK |
| booking_code | text | yes | — | Unique, format: CSR-XXXXXX |
| car_id | uuid | yes | — | FK → cars.id |
| customer_id | uuid | yes | — | FK → customers.id |
| status | text | yes | 'inquiry' | inquiry/confirmed/picked_up/returned/completed/cancelled |
| status_history | jsonb | no | [] | Array of `{ status, at, by }` |
| pickup_location | text | yes | — | |
| dropoff_location | text | no | null | |
| start_at | timestamptz | yes | — | UTC |
| end_at | timestamptz | yes | — | UTC |
| days | integer | yes | — | |
| total_eur | numeric | yes | — | days × daily_price_eur |
| deposit_eur | numeric | yes | — | |
| customer_message | text | no | null | Message from customer |
| admin_notes | text | no | null | Internal admin notes |
| return_notes | text | no | null | Notes on vehicle return |
| source | text | no | 'web' | web/manual |
| is_demo | boolean | no | false | Demo data flag |
| transfer_requested | boolean | no | false | Custom delivery requested |
| transfer_address | text | no | null | |
| transfer_fee_eur | numeric | no | null | Set by admin post-inquiry |
| pickup_time | text | no | null | HH:MM format |
| review_email_sent | boolean | no | false | Tracks review email dispatch |
| license_doc_url | text | no | null | Legacy — storage path |
| id_doc_url | text | no | null | Legacy — storage path |
| created_at | timestamptz | yes | now() | |
| updated_at | timestamptz | no | null | |

---

### `customers`
Customer records. Upserted on `email` conflict.

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | yes | gen_random_uuid() | PK |
| email | text | yes | — | Unique |
| full_name | text | yes | — | |
| phone | text | no | null | |
| country | text | no | null | |
| admin_notes | text | no | null | Internal notes |
| notes | text | no | null | General notes |
| vip | boolean | no | false | VIP flag |
| created_at | timestamptz | yes | now() | |

---

### `admin_users`
Links Supabase Auth UIDs to admin privileges.

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | yes | gen_random_uuid() | PK |
| user_id | uuid | yes | — | FK → auth.users.id |
| email | text | yes | — | |
| created_at | timestamptz | yes | now() | |

---

### `business_config`
Single-row white-label configuration. Cached via `unstable_cache` (1hr TTL, tag: `business-config`).

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | yes | gen_random_uuid() | PK |
| business_name | text | yes | — | |
| business_email | text | yes | — | |
| business_phone | text | no | null | |
| business_whatsapp | text | no | null | |
| business_address | text | no | null | |
| business_city | text | yes | 'Marbella' | |
| business_country | text | yes | 'Spain' | |
| delivery_radius_km | integer | no | 25 | |
| delivery_base_location | text | no | — | |
| currency_code | text | no | 'EUR' | ISO 4217 |
| currency_symbol | text | no | '€' | |
| min_driver_age | integer | no | 25 | |
| min_license_years | integer | no | 2 | |
| max_rental_days | integer | no | 14 | |
| primary_color | text | no | '#C8A96B' | Hex |
| logo_url | text | no | null | |
| hero_image_url | text | no | null | |
| tagline | text | no | — | |
| about_text | text | no | null | |
| cancel_tier1_days | integer | no | 7 | Days before for tier 1 |
| cancel_tier1_pct | integer | no | 100 | Refund % |
| cancel_tier2_days | integer | no | 2 | |
| cancel_tier2_pct | integer | no | 50 | |
| cancel_tier3_pct | integer | no | 0 | |
| google_review_url | text | no | null | Google Maps review link |
| review_email_enabled | boolean | no | true | |
| business_slug | text | no | null | URL slug for showcase |
| slug_locked | boolean | no | false | Prevents re-use |
| show_powered_by | boolean | no | true | "Powered by RentalOS" |
| white_label_fee_paid | boolean | no | false | |
| featured_on_showcase | boolean | no | false | |
| showcase_vehicle_type | text | no | null | car/yacht/villa/motorcycle/other |

---

### `subscriptions`
Single row per installation. Managed by Stripe webhook.

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | yes | gen_random_uuid() | PK |
| plan | text | no | null | starter/growth/pro/white_glove |
| status | text | no | 'trialing' | trialing/active/past_due/cancelled |
| stripe_customer_id | text | no | null | |
| stripe_subscription_id | text | no | null | |
| trial_ends_at | timestamptz | no | null | |
| current_period_end | timestamptz | no | null | |
| access_locked | boolean | no | false | Set by dunning cron at day 7 |
| past_due_since | timestamptz | no | null | Set on invoice.payment_failed |
| dunning_email_1_sent | boolean | no | false | |
| dunning_email_2_sent | boolean | no | false | |
| dunning_email_3_sent | boolean | no | false | |

---

### `subscription_addons`
Active add-ons linked to the subscription.

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | yes | gen_random_uuid() | PK |
| subscription_id | uuid | yes | — | FK → subscriptions.id |
| addon_key | text | yes | — | sms_notifications/deposit_hold/multi_language |
| stripe_subscription_item_id | text | no | null | |
| status | text | yes | 'active' | active/cancelled |
| cancelled_at | timestamptz | no | null | |
| created_at | timestamptz | yes | now() | |

---

### `client_leads`
Done-for-you setup pipeline (submitted via /onboarding).

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | yes | gen_random_uuid() | PK |
| business_name | text | yes | — | |
| contact_name | text | yes | — | |
| contact_email | text | yes | — | |
| business_type | text | yes | — | Car rental/Yacht charter/Villa rental/Motorcycle rental/other |
| business_type_custom | text | no | null | Used when type = other |
| business_city | text | yes | — | |
| business_country | text | yes | — | |
| current_booking_method | text | no | null | |
| monthly_bookings_estimate | text | no | null | |
| vehicle_count | integer | no | null | |
| domain_name | text | no | null | |
| preferred_language | text | yes | — | |
| logo_url | text | no | null | |
| brand_color | text | yes | '#C8A96B' | Hex |
| tagline | text | no | null | |
| delivery_location | text | yes | — | |
| delivery_radius | text | yes | — | |
| min_driver_age | integer | yes | 25 | |
| min_license_years | integer | yes | 2 | |
| max_rental_days | integer | yes | 14 | |
| cancellation_policy | text | yes | — | flexible/moderate/strict/custom |
| notes | text | no | null | Free text from client |
| referral_source | text | no | null | |
| status | text | yes | 'new' | new/contacted/in_progress/live/cancelled |
| admin_notes | text | no | null | Internal admin notes |
| deployment_checklist | jsonb | no | {} | 8 boolean checklist items |
| created_at | timestamptz | yes | now() | |

---

### `referrals`
Referral program. One row per referrer email.

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | yes | gen_random_uuid() | PK |
| referrer_email | text | yes | — | |
| referrer_code | text | yes | auto-generated | Unique short code |
| referee_email | text | no | null | Set when referred party signs up |
| referee_business | text | no | null | |
| status | text | no | 'pending' | pending/credited |
| credited_at | timestamptz | no | null | |
| created_at | timestamptz | yes | now() | |

---

### `vehicle_documents`
Documents attached to cars (insurance, registration, MOT, etc.).

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | yes | gen_random_uuid() | PK |
| car_id | uuid | yes | — | FK → cars.id |
| document_type | text | yes | — | insurance/registration/mot_certificate/service_history/purchase_invoice/other |
| document_type_label | text | no | null | Custom label for `other` type |
| file_name | text | yes | — | Original filename |
| file_url | text | yes | — | Storage path in `vehicle-documents` bucket |
| file_size_bytes | integer | no | null | |
| mime_type | text | no | null | |
| expires_at | date | no | null | Used by document-expiry cron |
| notes | text | no | null | |
| uploaded_by | text | no | null | Admin email |
| expiry_alert_sent | boolean | no | false | Prevents duplicate cron alerts |
| created_at | timestamptz | yes | now() | |

---

### `customer_documents`
KYC documents attached to customers.

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | yes | gen_random_uuid() | PK |
| customer_id | uuid | yes | — | FK → customers.id |
| document_type | text | yes | — | driving_licence_front/driving_licence_back/passport/national_id/proof_of_address/other |
| document_type_label | text | no | null | |
| file_name | text | yes | — | |
| file_url | text | yes | — | Storage path in `customer-documents` bucket |
| file_size_bytes | integer | no | null | |
| mime_type | text | no | null | |
| expires_at | date | no | null | Used by document-expiry cron |
| notes | text | no | null | |
| uploaded_by | text | no | null | Admin email |
| expiry_alert_sent | boolean | no | false | |
| verified | boolean | no | false | Admin-toggled via verify endpoint |
| created_at | timestamptz | yes | now() | |

---

### `booking_documents`
Documents attached to a booking (rental agreement, damage report, etc.).

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | yes | gen_random_uuid() | PK |
| booking_id | uuid | yes | — | FK → bookings.id |
| document_type | text | yes | — | rental_agreement/damage_report/pickup_photo/return_photo/deposit_receipt/other |
| document_type_label | text | no | null | |
| file_name | text | yes | — | |
| file_url | text | yes | — | Storage path in `booking-documents` bucket |
| file_size_bytes | integer | no | null | |
| mime_type | text | no | null | |
| notes | text | no | null | |
| uploaded_by | text | no | null | Admin email |
| created_at | timestamptz | yes | now() | |

---

### `page_events`
Client-side analytics events. Written via `/api/analytics/event`.

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | yes | gen_random_uuid() | PK |
| event_type | text | yes | — | page_view/cta_click/form_start/form_complete/demo_view/pricing_view/trial_start/waitlist_join |
| page | text | no | null | URL path |
| metadata | jsonb | no | {} | Key-value string pairs |
| session_id | text | no | null | Browser session ID |
| created_at | timestamptz | yes | now() | |

---

### `waitlist`
Feature waitlist signups (yacht, villa, motorcycle, add-ons).

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | yes | gen_random_uuid() | PK |
| email | text | yes | — | Unique per email+vertical |
| vertical | text | no | 'other' | yacht/villa/motorcycle/multi_language/arabic/deposit_hold/sms_notifications/other |
| source_page | text | no | null | Which page the signup came from |
| created_at | timestamptz | yes | now() | |

---

### `template_sales`
Gumroad template purchase records. Written by Gumroad webhook.

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | yes | gen_random_uuid() | PK |
| gumroad_sale_id | text | yes | — | Unique — prevents duplicate processing |
| buyer_email | text | yes | — | |
| buyer_name | text | no | null | |
| amount_eur | numeric | no | null | Sale price in EUR |
| licence_type | text | no | 'single_deployment' | |
| welcome_email_sent | boolean | no | false | |
| created_at | timestamptz | yes | now() | |

---

### `cold_email_leads`
B2B cold outreach tracking.

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | yes | gen_random_uuid() | PK |
| email | text | yes | — | Unique — prevents duplicate sends |
| first_name | text | no | null | |
| company_name | text | no | null | |
| business_type | text | no | null | |
| location | text | no | null | |
| status | text | yes | 'contacted' | contacted/follow_up_1/follow_up_2/replied/booked_demo/converted/not_interested/unsubscribed |
| email_sent_at | timestamptz | no | null | |
| follow_up_1_sent_at | timestamptz | no | null | |
| follow_up_2_sent_at | timestamptz | no | null | |
| replied_at | timestamptz | no | null | |
| demo_booked_at | timestamptz | no | null | |
| converted_at | timestamptz | no | null | |
| subject | text | no | null | Email subject line used |
| body | text | no | null | Email body used |
| source | text | no | 'manual' | |
| notes | text | no | null | Admin notes |
| updated_at | timestamptz | no | null | |

---

### `agency_clients`
Reseller/agency client tracking.

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | yes | gen_random_uuid() | PK |
| agency_code | text | yes | — | |
| client_business_name | text | yes | — | |
| client_email | text | yes | — | |
| client_plan | text | no | null | starter/growth/pro |
| client_domain | text | no | null | |
| status | text | no | 'active' | active/churned/trial |
| notes | text | no | null | |
| created_at | timestamptz | yes | now() | |
| updated_at | timestamptz | no | null | |

---

## Storage Buckets

| Bucket | Visibility | Max File Size | Allowed Types | Used By |
|--------|------------|---------------|---------------|---------|
| `car-photos` | Public | 10MB | image/jpeg, image/png | `/api/admin/cars/[id]/upload-photo` |
| `vehicle-documents` | Private (signed URLs) | 20MB | JPEG, PNG, WEBP, PDF | `/api/admin/vehicles/[id]/documents` |
| `customer-documents` | Private (signed URLs) | 20MB | JPEG, PNG, WEBP, PDF | `/api/admin/customers/[id]/documents` |
| `booking-documents` | Private (signed URLs) | 20MB | JPEG, PNG, WEBP, PDF | `/api/admin/bookings/[id]/documents` |
| `documents` | Private (signed URLs) | 10MB | Any image | Legacy booking license/ID uploads |
