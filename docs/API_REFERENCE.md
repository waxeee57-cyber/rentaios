# RentalOS — API Reference

Generated: 2026-05-11

All admin routes require `requireAdmin()` (Supabase session cookie, verified against `admin_users` table).  
Cron routes require `Authorization: Bearer <CRON_SECRET>` header.  
Rate limits are in-memory per Vercel instance (not distributed).

---

## Public Routes

| Method | Path | Auth | Rate Limit | Input | Output | Service |
|--------|------|------|------------|-------|--------|---------|
| GET | `/api/health` | None (secret header for details) | None | `x-health-secret` header | `{ ok, checks, ts }` | Supabase |
| GET | `/api/cars/[slug]/availability` | None | None | `?start=ISO&end=ISO` | `{ available: bool }` | Supabase |
| POST | `/api/inquiries/create` | None | 5/15min per IP | `{ car_slug, start_date, end_date, pickup_location, full_name, email, phone, country, pickup_time, message?, transfer_requested, transfer_address? }` | `{ booking_code }` | Supabase, Resend, n8n |
| POST | `/api/booking/lookup` | None | 10/min per IP | `{ code, email }` | Full booking object (sanitised — no admin notes) | Supabase |
| POST | `/api/analytics/event` | None | 60/hr per IP | `{ event_type, page?, metadata?, session_id? }` | `{ ok: true }` | Supabase |
| POST | `/api/billing/create-checkout` | None | 30/hr per IP | `{ priceId }` | `{ url }` (Stripe checkout URL) | Stripe |
| POST | `/api/billing/webhook` | Stripe signature | None | Stripe event body | `{ received: true }` | Stripe, Supabase, Resend |
| POST | `/api/onboarding/submit` | None | 10/hr per IP | Full onboarding schema (business details) | `{ success, id }` | Supabase, Resend |
| POST | `/api/referrals/register` | None | 5/hr per IP | `{ email }` | `{ success, link, code }` | Supabase, Resend |
| GET | `/api/r/[code]` | None | None | URL param: code | `302 → /?ref=code` + `referral_code` cookie | Supabase |
| POST | `/api/waitlist/join` | None | 5/hr per IP | `{ email, vertical?, source_page? }` | `{ success: true }` | Supabase |
| POST | `/api/webhooks/gumroad` | `GUMROAD_SELLER_ID` check | 20/hr per IP | URL-encoded Gumroad sale payload | `{ success: true }` | Supabase, Resend |

---

## Admin Routes

| Method | Path | Auth | Rate Limit | Input | Output | Service |
|--------|------|------|------------|-------|--------|---------|
| POST | `/api/admin/signout` | Supabase session | None | None | `302 → /admin/login` | Supabase |
| GET | `/api/billing/portal` | requireAdmin | None | None | `{ url }` (Stripe portal URL) | Stripe, Supabase |
| PATCH | `/api/admin/settings` | requireAdmin | None | Partial `business_config` fields | `{ ok, data }` | Supabase |
| PATCH | `/api/admin/settings/slug` | requireAdmin | None | `{ business_slug }` | `{ ok, business_slug }` | Supabase |
| GET | `/api/admin/cars` | requireAdmin | None | None | Array of car objects | Supabase |
| POST | `/api/admin/cars` | requireAdmin | None | `{ brand, model, year, category, daily_price_eur, deposit_eur, transmission, fuel, seats, license_plate?, description? }` | Car object | Supabase |
| PATCH | `/api/admin/cars/[id]/pricing` | requireAdmin | None | `{ daily_price_eur, deposit_eur }` | Car object | Supabase |
| PATCH | `/api/admin/cars/[id]/status` | requireAdmin | None | `{ status: available|maintenance|hidden }` | Car object | Supabase |
| PATCH | `/api/admin/cars/[id]/photos` | requireAdmin | None | `{ photos: array }` | Car object | Supabase |
| POST | `/api/admin/cars/[id]/upload-photo` | requireAdmin | None | `FormData: file` | `{ url }` | Supabase Storage |
| PATCH | `/api/admin/cars/[id]/description` | requireAdmin | None | `{ description }` | Car object | Supabase |
| POST | `/api/admin/bookings/manual` | requireAdmin | None | `{ car_id, start_date, end_date, pickup_location, pickup_time, full_name, email, phone?, country?, initial_status }` | `{ booking_code }` | Supabase, Resend |
| POST | `/api/admin/bookings/[id]/confirm` | requireAdmin | None | None | `{ ok: true }` | Supabase, Resend |
| POST | `/api/admin/bookings/[id]/cancel` | requireAdmin | None | None | `{ ok: true }` | Supabase, Resend |
| POST | `/api/admin/bookings/[id]/picked-up` | requireAdmin | None | None | `{ ok: true }` | Supabase |
| POST | `/api/admin/bookings/[id]/returned` | requireAdmin | None | None | `{ ok: true }` | Supabase |
| POST | `/api/admin/bookings/[id]/complete` | requireAdmin | None | None | `{ ok: true }` | Supabase |
| PATCH | `/api/admin/bookings/[id]/transfer-fee` | requireAdmin | None | `{ transfer_fee_eur }` | Booking object | Supabase |
| POST | `/api/admin/bookings/[id]/notes` | requireAdmin | None | `{ field: admin_notes|return_notes, value }` | `{ ok: true }` | Supabase |
| GET | `/api/admin/bookings/[id]/documents` | requireAdmin | None | None | Array of docs with signed URLs | Supabase |
| POST | `/api/admin/bookings/[id]/documents` | requireAdmin | None | `FormData: file, document_type, ...` | Document object | Supabase, Supabase Storage |
| DELETE | `/api/admin/bookings/[id]/documents/[doc_id]` | requireAdmin | None | None | `{ ok: true }` | Supabase |
| PATCH | `/api/admin/customers/[id]/notes` | requireAdmin | None | `{ admin_notes }` | `{ ok: true }` | Supabase |
| PATCH | `/api/admin/customers/[id]/vip` | requireAdmin | None | `{ vip: bool }` | `{ ok: true }` | Supabase |
| GET | `/api/admin/customers/[id]/documents` | requireAdmin | None | None | Array of docs with signed URLs | Supabase |
| POST | `/api/admin/customers/[id]/documents` | requireAdmin | None | `FormData: file, document_type, ...` | Document object | Supabase, Supabase Storage |
| DELETE | `/api/admin/customers/[id]/documents/[doc_id]` | requireAdmin | None | None | `{ ok: true }` | Supabase |
| PATCH | `/api/admin/customers/[id]/documents/[doc_id]/verify` | requireAdmin | None | None | Document object (toggled) | Supabase |
| GET | `/api/admin/vehicles/[id]/documents` | requireAdmin | None | None | Array of docs with signed URLs | Supabase |
| POST | `/api/admin/vehicles/[id]/documents` | requireAdmin | None | `FormData: file, document_type, ...` | Document object | Supabase, Supabase Storage |
| DELETE | `/api/admin/vehicles/[id]/documents/[doc_id]` | requireAdmin | None | None | `{ ok: true }` | Supabase |
| PATCH | `/api/admin/clients/[id]/status` | requireAdmin | None | `{ status: new|contacted|in_progress|live|cancelled }` | `{ success: true }` | Supabase |
| PATCH | `/api/admin/clients/[id]/notes` | requireAdmin | None | `{ notes }` | `{ success: true }` | Supabase |
| PATCH | `/api/admin/clients/[id]/checklist` | requireAdmin | None | `{ key: checklist_key, value: bool }` | `{ success: true }` | Supabase |
| POST | `/api/admin/billing/addons` | requireAdmin | 10/hr per IP | `{ addon_key: sms_notifications|deposit_hold|multi_language }` | `{ ok, addon }` | Supabase, Stripe |
| DELETE | `/api/admin/billing/addons/[addon_key]` | requireAdmin | None | None | `{ ok: true }` | Supabase, Stripe |
| GET | `/api/admin/export/[type]` | requireAdmin | 5/hr per IP | Path param: `bookings|customers|fleet` | CSV download | Supabase |
| POST | `/api/admin/outreach/send` | requireAdmin | 5/hr per IP | `{ leads: [{ email, first_name?, company_name?, business_type?, location? }] }` | `{ sent, skipped, errors }` | Supabase, Resend, Anthropic |
| PATCH | `/api/admin/outreach/[id]` | requireAdmin | None | `{ status }` or `{ notes }` | `{ success: true }` | Supabase |
| GET | `/api/admin/reseller/clients` | requireAdmin | None | None | `{ clients: [] }` | Supabase |
| POST | `/api/admin/reseller/clients` | requireAdmin | None | `{ agency_code, client_business_name, client_email, client_plan?, client_domain?, notes? }` | `{ client }` | Supabase |
| PATCH | `/api/admin/reseller/clients/[id]` | requireAdmin | None | `{ client_plan?, client_domain?, status?, notes? }` | `{ client }` | Supabase |

---

## Cron Routes

| Method | Path | Schedule | Auth | Process | Output |
|--------|------|----------|------|---------|--------|
| GET | `/api/cron/weekly-report` | Mon 09:00 UTC | CRON_SECRET | Query last 7d bookings; send weekly summary email | `{ success, dateRange }` |
| GET | `/api/cron/reset-demo` | Daily 00:00 UTC | CRON_SECRET | Delete is_demo rows; re-seed 3 demo cars + 5 demo bookings | `{ success, reset }` |
| GET | `/api/cron/review-emails` | Hourly | CRON_SECRET | Find completed bookings 20-28h ago; send Google Review request email | `{ sent: N }` |
| GET | `/api/cron/document-expiry` | Daily 09:00 UTC | CRON_SECRET | Find vehicle_documents + customer_documents expiring within 60d; send admin alerts | `{ success, sent: N }` |
| GET | `/api/cron/cold-email-followup` | Tue 09:00 UTC | CRON_SECRET | Send follow-up 1 (4d after initial) and follow-up 2 (4d after FU1) via Claude | `{ followup1_sent, followup2_sent }` |
| GET | `/api/cron/dunning` | Daily 10:00 UTC | CRON_SECRET | Check past_due subscriptions; send warning/suspension emails; lock account at day 7 | `{ processed: N }` |

---

## Booking Status State Machine

```
inquiry → confirmed → picked_up → returned → completed
        ↘ cancelled (from any non-terminal state)
```

Status transitions are enforced server-side on each route. `status_history` JSONB array logs every transition with timestamp and admin email.
