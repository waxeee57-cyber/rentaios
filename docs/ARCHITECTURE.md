# RentalOS — Architecture Overview

Generated: 2026-05-11

## System Overview

RentalOS is a single-tenant, white-label rental booking SaaS built on Next.js 15 App Router, Supabase, Stripe, and Resend. One Vercel deployment = one business. Configuration is driven by the `business_config` table; no hardcoded brand strings.

---

## Mermaid Architecture Diagram

```mermaid
graph TB
  subgraph BROWSER["Browser / Client"]
    B1[Customer Browser]
    B2[Admin Browser]
  end

  subgraph PAGES_PUBLIC["(public) Layout — Header + Footer + WhatsApp + Cookie"]
    P1[/ — Homepage]
    P2[/pricing — PricingClient + PlanQuiz]
    P3[/fleet — FleetFilters + FleetGrid]
    P4["/fleet/[slug] — CarDetailClient"]
    P5["/booking/[code] — BookingStatusClient"]
    P6[/faq]
    P7[/contact]
    P8[/about]
    P9[/customers]
    P10[/refer — ReferralForm / AdminDashboard]
    PLEGAL["(legal): /privacy /terms /cookies /insurance /cancellation"]
  end

  subgraph PAGES_LANDING["(landing) Layout — standalone"]
    L1[/sell]
    L2[/onboarding — OnboardingForm]
    L3[/onboarding/thank-you]
    L4[/car-rental-booking-software]
    L5[/car-rental-software-dubai]
    L6[/yacht-charter-booking-system]
    L7[/yacht-charter-software-mediterranean]
    L8[/villa-rental-management-software]
    L9[/luxury-rental-software-marbella]
  end

  subgraph PAGES_DEMO["(demo) Layout — gold demo banner"]
    D1[/demo → redirect /demo/fleet]
    D2[/demo/fleet]
    D3["/demo/fleet/[slug]"]
    D4[/demo/admin]
  end

  subgraph PAGES_ADMIN["(admin) Layout — requireAdmin + AdminNav + suspension overlay"]
    A1[/admin — Dashboard]
    A2[/admin/bookings]
    A3[/admin/bookings/new]
    A4[/admin/cars]
    A5[/admin/cars/new]
    A6[/admin/clients]
    A7[/admin/billing]
    A8[/admin/settings]
    A9[/admin/analytics]
    A10[/admin/waitlist]
    A11[/admin/outreach]
    A12[/admin/reseller]
    ALOGIN[/admin/login]
  end

  subgraph API_PUBLIC["Public API Routes"]
    AP1["POST /api/inquiries/create — RL 5/15min"]
    AP2["POST /api/booking/lookup — RL 10/min"]
    AP3["GET /api/cars/[slug]/availability"]
    AP4["GET /api/health"]
    AP5["POST /api/analytics/event — RL 60/hr"]
    AP6["POST /api/billing/create-checkout — RL 30/hr"]
    AP7["POST /api/billing/webhook — Stripe"]
    AP8["POST /api/onboarding/submit — RL 10/hr"]
    AP9["POST /api/referrals/register — RL 5/hr"]
    AP10["GET /api/r/[code] — redirect + cookie"]
    AP11["POST /api/waitlist/join — RL 5/hr"]
    AP12["POST /api/webhooks/gumroad — RL 20/hr"]
  end

  subgraph API_ADMIN["Admin API Routes (all requireAdmin)"]
    AA1["POST /api/admin/signout"]
    AA2["GET /api/billing/portal"]
    AA3["PATCH /api/admin/settings"]
    AA4["PATCH /api/admin/settings/slug"]
    AA5["GET+POST /api/admin/cars"]
    AA6["PATCH /api/admin/cars/[id]/pricing|status|photos|description"]
    AA7["POST /api/admin/cars/[id]/upload-photo"]
    AA8["POST /api/admin/bookings/manual"]
    AA9["POST /api/admin/bookings/[id]/confirm|cancel|picked-up|returned|complete"]
    AA10["PATCH /api/admin/bookings/[id]/transfer-fee|notes"]
    AA11["GET+POST+DELETE /api/admin/bookings/[id]/documents"]
    AA12["PATCH /api/admin/customers/[id]/notes|vip"]
    AA13["GET+POST+DELETE+PATCH /api/admin/customers/[id]/documents"]
    AA14["PATCH /api/admin/customers/[id]/documents/[doc_id]/verify"]
    AA15["GET+POST+DELETE /api/admin/vehicles/[id]/documents"]
    AA16["PATCH /api/admin/clients/[id]/status|notes|checklist"]
    AA17["POST+DELETE /api/admin/billing/addons"]
    AA18["GET /api/admin/export/[type] — RL 5/hr — CSV"]
    AA19["POST /api/admin/outreach/send — RL 5/hr"]
    AA20["PATCH /api/admin/outreach/[id]"]
    AA21["GET+POST /api/admin/reseller/clients"]
    AA22["PATCH /api/admin/reseller/clients/[id]"]
  end

  subgraph API_CRON["Cron Routes (CRON_SECRET)"]
    CR1["GET /api/cron/weekly-report — Mon 09:00 UTC"]
    CR2["GET /api/cron/reset-demo — daily 00:00 UTC"]
    CR3["GET /api/cron/review-emails — hourly"]
    CR4["GET /api/cron/document-expiry — daily 09:00 UTC"]
    CR5["GET /api/cron/cold-email-followup — Tue 09:00 UTC"]
    CR6["GET /api/cron/dunning — daily 10:00 UTC"]
  end

  subgraph DB["Supabase Database"]
    T1[(cars)]
    T2[(bookings)]
    T3[(customers)]
    T4[(admin_users)]
    T5[(business_config)]
    T6[(subscriptions)]
    T7[(subscription_addons)]
    T8[(client_leads)]
    T9[(referrals)]
    T10[(vehicle_documents)]
    T11[(customer_documents)]
    T12[(booking_documents)]
    T13[(page_events)]
    T14[(waitlist)]
    T15[(template_sales)]
    T16[(cold_email_leads)]
    T17[(agency_clients)]
  end

  subgraph STORAGE["Supabase Storage"]
    S1[car-photos — public]
    S2[vehicle-documents — private]
    S3[customer-documents — private]
    S4[booking-documents — private]
    S5[documents — legacy private]
  end

  subgraph SERVICES["External Services"]
    SV1[Stripe — subscriptions + checkout]
    SV2[Resend — transactional email]
    SV3[n8n — webhook notifications]
    SV4[Gumroad — template sales]
    SV5[Anthropic Claude — cold email generation]
    SV6[Vercel Cron — scheduled jobs]
    SV7[Vercel Analytics — pageview tracking]
  end

  %% Customer flows
  B1 --> PAGES_PUBLIC
  B1 --> PAGES_DEMO
  B1 --> PAGES_LANDING
  P3 --> AP3
  P4 --> AP1
  P5 --> AP2
  P2 --> AP6
  AP6 --> SV1
  L2 --> AP8
  AP8 --> T8
  AP8 --> SV2

  %% Admin flows
  B2 --> PAGES_ADMIN
  ALOGIN --> T4
  PAGES_ADMIN --> API_ADMIN
  API_ADMIN --> DB
  API_ADMIN --> SV1
  API_ADMIN --> S1
  API_ADMIN --> S2
  API_ADMIN --> S3
  API_ADMIN --> S4
  API_ADMIN --> SV2
  API_ADMIN --> SV5

  %% Cron flows
  SV6 --> API_CRON
  CR1 --> T2
  CR1 --> SV2
  CR2 --> T1
  CR2 --> T2
  CR3 --> T2
  CR3 --> SV2
  CR4 --> T10
  CR4 --> T11
  CR4 --> SV2
  CR5 --> T16
  CR5 --> SV2
  CR5 --> SV5
  CR6 --> T6
  CR6 --> SV2

  %% Webhook flows
  SV1 --> AP7
  AP7 --> T6
  AP7 --> SV2
  SV4 --> AP12
  AP12 --> T15
  AP12 --> SV2

  %% Key table relationships
  T2 --> T1
  T2 --> T3
  T10 --> T1
  T11 --> T3
  T12 --> T2
  T7 --> T6
```

---

## Route Group Summary

| Route Group | Layout | Auth | Purpose |
|-------------|--------|------|---------|
| `(public)` | Header + Footer + WhatsApp + Cookie | None | Customer-facing site |
| `(admin)` | AdminNav + suspension overlay | requireAdmin redirect | Business operations |
| `(demo)` | Gold demo banner | None | Live demo (is_demo data) |
| `(landing)` | Minimal (no header/footer) | None | SEO landing + sales pages |
| Root | DM Sans + Cormorant fonts, Vercel Analytics | None | Shell |

---

## Data Flow: Booking Lifecycle

```
Customer submits inquiry
  → POST /api/inquiries/create
  → INSERT bookings (status: inquiry)
  → UPSERT customers
  → sendInquiryEmails → Resend
  → notifyInquiry → n8n webhook

Admin confirms
  → POST /api/admin/bookings/[id]/confirm
  → overlap check on bookings
  → UPDATE bookings (status: confirmed)
  → sendConfirmationEmails → Resend

Admin marks picked-up
  → POST /api/admin/bookings/[id]/picked-up
  → UPDATE bookings (status: picked_up)

Admin marks returned
  → POST /api/admin/bookings/[id]/returned
  → UPDATE bookings (status: returned)

Admin marks complete
  → POST /api/admin/bookings/[id]/complete
  → UPDATE bookings (status: completed)

Cron: review-emails (hourly)
  → find completed bookings 20-28h ago
  → sendReviewRequest → Resend
  → UPDATE bookings (review_email_sent: true)
```

---

## Data Flow: Subscription Lifecycle

```
Customer clicks pricing CTA
  → POST /api/billing/create-checkout
  → stripe.checkout.sessions.create (14-day trial)
  → redirect to Stripe Hosted Checkout

Stripe fires webhook
  → POST /api/billing/webhook
  → checkout.session.completed → UPDATE subscriptions
  → customer.subscription.updated → UPDATE subscriptions
  → customer.subscription.deleted → UPDATE subscriptions (cancelled)
  → invoice.payment_failed → UPDATE subscriptions (past_due)
  → invoice.payment_succeeded → UPDATE subscriptions (active, reset dunning)

Cron: dunning (daily 10:00)
  → find past_due subscriptions
  → day 1: warning email
  → day 3: suspension warning email
  → day 7: lock account, suspension email

Admin layout
  → checks subscriptions.access_locked
  → shows suspension overlay if true
```
