# RentalOS — Component Tree

Generated: 2026-05-11

Legend: `[S]` = Server Component, `[C]` = Client Component (`'use client'`)

---

## Root Layout

```
app/layout.tsx [S]
  └── DM Sans + Cormorant Garamond fonts (Google Fonts)
  └── Vercel Analytics
  └── {children}
```

---

## (public) Layout

```
app/(public)/layout.tsx [S]
  ├── components/marketing/Header.tsx [C]
  │   └── components/brand/Logo.tsx [S]
  ├── {children}
  ├── components/marketing/Footer.tsx [S]
  ├── components/brand/WhatsAppButton.tsx [C]
  └── components/brand/CookieBanner.tsx [C]
```

---

## (public) Pages

```
app/(public)/page.tsx [S]  →  /
  └── (inline — no imported components)

app/(public)/fleet/page.tsx [S]  →  /fleet
  ├── components/marketing/FleetFilters.tsx [C]
  └── components/marketing/FleetGrid.tsx [C]
      └── components/marketing/CarCard.tsx [C]

app/(public)/fleet/[slug]/page.tsx [S]  →  /fleet/[slug]
  └── app/(public)/fleet/[slug]/CarDetailClient.tsx [C]
      ├── components/booking/DateRangePicker.tsx [C]
      ├── components/booking/CostBreakdown.tsx [C]
      ├── components/booking/InquiryDrawer.tsx [C]
      └── components/booking/MobileStickyCTA.tsx [C]

app/(public)/booking/[code]/page.tsx [S]  →  /booking/[code]
  └── app/(public)/booking/[code]/BookingStatusClient.tsx [C]
      ├── components/booking/CodeEmailLookup.tsx [C]
      ├── components/booking/StatusPill.tsx [S]
      └── components/booking/CostBreakdown.tsx [C]

app/(public)/pricing/page.tsx [S]  →  /pricing
  └── app/(public)/pricing/PricingClient.tsx [C]
      └── components/marketing/PlanQuiz.tsx [C]

app/(public)/faq/page.tsx [S]  →  /faq
  ├── components/marketing/FAQ.tsx [C]
  └── app/(public)/faq/FAQAccordion.tsx [C]
      └── components/ui/accordion.tsx [C]

app/(public)/refer/page.tsx [S]  →  /refer
  ├── app/(public)/refer/ReferralPublicForm.tsx [C]
  └── app/(public)/refer/ReferralAdminDashboard.tsx [C]
      (shown when user is authenticated admin)

app/(public)/contact/page.tsx [S]  →  /contact
  └── (inline form — no imported custom components)

app/(public)/about/page.tsx [S]  →  /about
  └── (inline content)

app/(public)/customers/page.tsx [S]  →  /customers
  └── components/marketing/WaitlistForm.tsx [C]

app/(public)/(legal)/*/page.tsx [S]
  └── (inline content per legal page)

app/(public)/(legal)/layout.tsx [S]
  └── (prose wrapper)
```

---

## (admin) Layout

```
app/(admin)/admin/(protected)/layout.tsx [S]
  ├── getAuthUser() → redirect if not logged in
  ├── getBusinessConfig() → business_name in header
  ├── subscriptions.access_locked → suspension overlay
  └── components/admin/AdminNav.tsx [C]
```

---

## (admin) Pages

```
app/(admin)/admin/(protected)/page.tsx [S]  →  /admin
  └── (inline dashboard with Supabase data — no custom components)

app/(admin)/admin/(protected)/bookings/page.tsx [S]  →  /admin/bookings
  └── components/admin/BookingsList.tsx [C]
      ├── components/booking/StatusPill.tsx [S]
      └── components/admin/BookingDetail.tsx [C]
          ├── components/admin/BookingDocuments.tsx [C]
          └── components/admin/ManualBookingForm.tsx [C]

app/(admin)/admin/(protected)/bookings/new/page.tsx  →  /admin/bookings/new
  └── components/admin/ManualBookingForm.tsx [C]

app/(admin)/admin/(protected)/cars/page.tsx [S]  →  /admin/cars
  └── components/admin/CarsManager.tsx [C]
      └── components/admin/VehicleDocuments.tsx [C]

app/(admin)/admin/(protected)/cars/new/page.tsx  →  /admin/cars/new
  └── (inline form using CarsManager)

app/(admin)/admin/(protected)/clients/page.tsx [S]  →  /admin/clients
  └── app/(admin)/admin/(protected)/clients/ClientsList.tsx [C]

app/(admin)/admin/(protected)/billing/page.tsx [S]  →  /admin/billing
  └── app/(admin)/admin/(protected)/billing/AddonsSection.tsx [C]

app/(admin)/admin/(protected)/settings/page.tsx [S]  →  /admin/settings
  └── app/(admin)/admin/(protected)/settings/SettingsForm.tsx [C]

app/(admin)/admin/(protected)/reseller/page.tsx  →  /admin/reseller
  └── app/(admin)/admin/(protected)/reseller/ResellerDashboard.tsx [C]

app/(admin)/admin/(protected)/outreach/page.tsx  →  /admin/outreach
  └── app/(admin)/admin/(protected)/outreach/OutreachClient.tsx [C]

app/(admin)/admin/(protected)/analytics/page.tsx [S]  →  /admin/analytics
  └── (inline)

app/(admin)/admin/(protected)/waitlist/page.tsx [S]  →  /admin/waitlist
  └── (inline)

app/(admin)/admin/login/page.tsx  →  /admin/login
  └── (Supabase Auth UI or inline login form)
```

---

## (demo) Layout

```
app/(demo)/layout.tsx [S]
  └── Gold demo banner + "Start free trial" CTA
  └── {children}
```

## (demo) Pages

```
app/(demo)/demo/page.tsx  →  /demo
  └── redirect('/demo/fleet')

app/(demo)/demo/fleet/page.tsx [S]  →  /demo/fleet
  └── app/(demo)/DemoTabs.tsx [C]
      └── (fleet grid with is_demo cars)

app/(demo)/demo/fleet/[slug]/page.tsx [S]  →  /demo/fleet/[slug]
  └── (car detail for demo cars)

app/(demo)/demo/admin/page.tsx [S]  →  /demo/admin
  └── (read-only admin view using is_demo data)
```

---

## (landing) Layout

```
app/(landing)/layout.tsx [S]
  └── (minimal wrapper — no shared header/footer)
```

## (landing) Pages

```
app/(landing)/sell/page.tsx [S]  →  /sell
  ├── components/brand/Logo.tsx [S]
  └── (inline marketing content + Gumroad CTA)

app/(landing)/onboarding/page.tsx [S]  →  /onboarding
  └── app/(landing)/onboarding/OnboardingForm.tsx [C]

app/(landing)/onboarding/thank-you/page.tsx [S]  →  /onboarding/thank-you
  └── (inline confirmation)

app/(landing)/car-rental-booking-software/page.tsx [S]
app/(landing)/car-rental-software-dubai/page.tsx [S]
app/(landing)/yacht-charter-booking-system/page.tsx [S]
app/(landing)/yacht-charter-software-mediterranean/page.tsx [S]
app/(landing)/villa-rental-management-software/page.tsx [S]
app/(landing)/luxury-rental-software-marbella/page.tsx [S]
  └── (standalone SEO pages — no shared components)
```

---

## Shared UI Components (`components/ui/`)

All shadcn/ui primitives — used by admin components and booking forms:

```
components/ui/
  ├── accordion.tsx [C]   — FAQAccordion
  ├── badge.tsx [S]       — StatusPill
  ├── button.tsx [S]
  ├── dialog.tsx [C]      — InquiryDrawer
  ├── input.tsx [S]       — Forms
  ├── label.tsx [S]
  ├── select.tsx [C]      — FleetFilters, ManualBookingForm
  ├── textarea.tsx [S]    — Forms
  └── tooltip.tsx [C]     — Admin panels
```

---

## Utility / Non-Visual Components

```
components/TrackEventOnMount.tsx [C]
  └── Calls /api/analytics/event on mount
  └── Used on: /demo, /pricing, other key pages
```

---

## Component → Route Usage Matrix

| Component | Used by Pages |
|-----------|--------------|
| `AdminNav` | All `/admin/*` (protected layout) |
| `BookingsList` | `/admin/bookings` |
| `BookingDetail` | `/admin/bookings` (inline drawer) |
| `BookingDocuments` | `/admin/bookings` (inside BookingDetail) |
| `CarsManager` | `/admin/cars` |
| `VehicleDocuments` | `/admin/cars` (inside CarsManager) |
| `CustomerDocuments` | `/admin/bookings` (inside BookingDetail) |
| `ManualBookingForm` | `/admin/bookings/new`, `/admin/bookings` |
| `ClientsList` | `/admin/clients` |
| `AddonsSection` | `/admin/billing` |
| `SettingsForm` | `/admin/settings` |
| `ResellerDashboard` | `/admin/reseller` |
| `OutreachClient` | `/admin/outreach` |
| `Header` | All `(public)` pages |
| `Footer` | All `(public)` pages |
| `WhatsAppButton` | All `(public)` pages |
| `CookieBanner` | All `(public)` pages |
| `FleetGrid` | `/fleet` |
| `FleetFilters` | `/fleet` |
| `CarCard` | `/fleet` (inside FleetGrid) |
| `PlanQuiz` | `/pricing` (inside PricingClient) |
| `WaitlistForm` | `/customers`, landing pages |
| `InquiryDrawer` | `/fleet/[slug]` |
| `DateRangePicker` | `/fleet/[slug]` |
| `CostBreakdown` | `/fleet/[slug]`, `/booking/[code]` |
| `StatusPill` | `/booking/[code]`, `/admin/bookings` |
| `MobileStickyCTA` | `/fleet/[slug]` |
| `CodeEmailLookup` | `/booking/[code]` |
| `ReferralPublicForm` | `/refer` (public view) |
| `ReferralAdminDashboard` | `/refer` (when admin logged in) |
| `FAQAccordion` | `/faq` |
| `Logo` | `/sell`, `(public)` Header |
| `TrackEventOnMount` | `/demo`, `/pricing`, key conversion pages |
| `DemoTabs` | `/demo/fleet` |
