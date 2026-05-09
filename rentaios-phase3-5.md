# RentalOS — Phase 3, 4, 5
## Run this after Phase 1+2 is complete and pushed to Vercel

Read this entire document before starting. Work through each
phase in order. After each phase: npm run build → commit → push.
Never start the next phase if the current one has build errors.

GROUND RULES:
1. Every new feature degrades gracefully if env vars are missing
2. Every new page runs /impeccable polish before commit
3. Every new public API route has rate limiting
4. Every new admin API route has auth check
5. Build must be 0 errors and 0 TypeScript errors after each phase

---

## CONTEXT CHECK — Before starting

Verify the following are in place from Phase 1+2:
- business_config table exists in Supabase
- subscriptions table exists in Supabase
- /sell, /pricing, /admin/billing, /admin/settings pages exist
- Stripe env vars are in .env.example (even if empty)
- CLAUDE.md has been updated to RentalOS context

If any of the above is missing, fix it before continuing.

---

## PHASE 3 — AI Service Wrapper
### Goal: Automate the €499 done-for-you service

The done-for-you setup service is the highest-margin product.
Currently it requires manually emailing back and forth to collect
client data. Phase 3 eliminates that friction.

After Phase 3 a client pays → fills one form → you have
everything needed to deploy their system → you send them keys.
Two emails total. No back-and-forth.

### 3A — Client onboarding form at /onboarding

Public page. Clients land here after paying the €499 setup fee.
The form must be fast (under 5 minutes), mobile-friendly, and
collect every piece of information needed to deploy and configure
their RentalOS system without follow-up.

Create /app/(public)/onboarding/page.tsx
Create /app/(public)/onboarding/thank-you/page.tsx
Create /app/api/onboarding/submit/route.ts

Form design: multi-step, one section per screen. Progress
indicator at top (1/6, 2/6...). No scrolling through a long page.
Back button on every step. Only submit on final step.
Mobile-first — large touch targets, native date/select inputs.

Step 1 of 6 — Your business
Fields:
- Business name (text, required)
- Your full name (text, required)
- Email address (email, required)
- Business type (radio cards, required):
  [Car rental] [Yacht charter] [Villa rental]
  [Motorcycle rental] [Other (specify below)]
- If Other: free text field
- City (text, required)
- Country (text, required)

Step 2 of 6 — Current situation
Fields:
- How do you manage bookings now? (radio, required)
  [WhatsApp] [Email] [Spreadsheet] [Another booking system] [Nothing yet]
- Monthly bookings estimate (select, required)
  [Under 10] [10-30] [30-50] [50+]
- Number of vehicles/units (number, required, min 1)

Step 3 of 6 — Your new system
Fields:
- Domain name, if you have one (text, optional)
  Helper: "Leave blank if you don't have one. We can advise."
- Preferred language (select, required)
  [English] [Spanish] [French] [German] [Italian] [Other]
- Logo URL (text, optional)
  Helper: "Paste a direct image URL. Leave blank to use text logo."

Step 4 of 6 — Branding
Fields:
- Primary brand color (color picker + hex input)
  Default: #C8A96B with live preview swatch
  Helper: "This is your accent color — buttons, highlights, etc."
- Tagline (text, optional, max 80 chars)
  Placeholder: "e.g. The Coast, Driven Beautifully"
  Helper: "Short phrase that appears on your homepage"

Step 5 of 6 — Service area and rules
Fields:
- Base delivery location (text, required)
  Placeholder: "e.g. Marbella city centre"
  Helper: "Where free delivery applies from"
- Free delivery radius (select, required)
  [10 km] [25 km] [50 km] [Nationwide / no limit]
- Minimum driver age (number, default 25)
- Minimum licence held for (select)
  [1 year] [2 years] [3 years]
- Maximum rental days (number, default 14)
- Cancellation policy (radio, required)
  [Flexible — full refund if cancelled 7+ days before]
  [Moderate — 50% refund if cancelled 2-7 days before]
  [Strict — no refund under 48 hours]
  [Custom — I'll explain in notes]

Step 6 of 6 — Anything else
Fields:
- Special requirements or notes (textarea, optional, max 500 chars)
  Placeholder: "Any integrations you need, languages, special features..."
- How did you hear about us? (select, optional)
  [Search engine] [Social media] [Referral from a colleague]
  [drivecostasol.com] [Other]

On final submit:
1. Validate all required fields
2. Show loading state ("Sending your details...")
3. POST to /api/onboarding/submit
4. On success: redirect to /onboarding/thank-you
5. On error: show inline error, keep form data

/api/onboarding/submit:
- Rate limit: 3 requests per IP per hour
- Validate required fields server-side (Zod)
- Insert into client_leads table (migration below)
- Fire-and-forget: sendOnboardingEmails(data)
  Two emails via Resend:
  a. To client: "Setup request received"
     Subject: "We're on it — setup starts within 24 hours"
     Body: "Hi {name}, we've received everything we need to
     set up your {business_type} booking system. We'll send you
     your admin login details within 24 hours.
     Booking reference: {id}"
     Reply-to: ADMIN_EMAIL
  b. To admin: "New setup request"
     Subject: "Setup request — {business_name} — {business_type}"
     Body: All form data formatted as a clean list.
     Include: deployment checklist as empty checkboxes.
- Return { success: true, id: client_lead_id }

/onboarding/thank-you:
Clean confirmation page. Dark background, gold accent.
"We received your details. Expect your system within 48 hours.
Check your email for confirmation."
[Return to homepage →] button.
No nav, no footer — keep them focused.

New migration: supabase/migrations/05_client_leads.sql

```sql
CREATE TABLE client_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  business_type text NOT NULL,
  business_type_custom text,
  business_city text NOT NULL,
  business_country text NOT NULL,
  current_booking_method text,
  monthly_bookings_estimate text,
  vehicle_count integer,
  domain_name text,
  preferred_language text DEFAULT 'English',
  logo_url text,
  brand_color text DEFAULT '#C8A96B',
  tagline text,
  delivery_location text,
  delivery_radius text DEFAULT '25 km',
  min_driver_age integer DEFAULT 25,
  min_license_years integer DEFAULT 2,
  max_rental_days integer DEFAULT 14,
  cancellation_policy text DEFAULT 'flexible',
  notes text,
  referral_source text,
  status text NOT NULL DEFAULT 'new' CHECK (
    status IN ('new', 'contacted', 'in_progress', 'live', 'cancelled')
  ),
  deployment_checklist jsonb NOT NULL DEFAULT '{
    "payment_confirmed": false,
    "supabase_created": false,
    "domain_configured": false,
    "business_config_set": false,
    "fleet_data_entered": false,
    "test_booking_done": false,
    "credentials_sent": false,
    "client_signed_off": false
  }'::jsonb,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE client_leads ENABLE ROW LEVEL SECURITY;
-- No public read/write. Service role only via API routes.
```

Run /seo-auditor on /onboarding after building.
Run /impeccable polish on /onboarding after building.
It must look trustworthy — clients have already paid €499.

### 3B — Client pipeline at /admin/clients

The operator needs to track every setup job from intake to live.
This is the internal CRM for the done-for-you service.

Add "Clients" to AdminNav between "Fleet" and "Settings".

/admin/clients page — pipeline view:

Four status columns rendered as a horizontal strip on desktop,
vertical list on mobile. Each column shows client count in header.

Column headers: NEW · IN PROGRESS · LIVE · CANCELLED

Each client card (compact):
- Business name (bold, 15px)
- Business type badge (small pill)
- City, Country (muted, 13px)
- Time since received (e.g. "2 hours ago")
- [Open] button → expands inline below the card

Expanded view (replaces card, inline):
Left column:
- All intake form data as a clean two-column table
  (label: value pairs)
- Admin notes textarea (auto-saves on blur, 300ms debounce)
  PATCH /api/admin/clients/[id]/notes

Right column:
- Status selector (select → PATCH /api/admin/clients/[id]/status)
- Deployment checklist (8 checkboxes)
  Each checkbox saves immediately on click
  PATCH /api/admin/clients/[id]/checklist
  With { key: "payment_confirmed", value: true }
- WhatsApp message button (visible if phone/WhatsApp known)
  Pre-fills: "Hi {contact_name}, your {business_name} system
  is ready. Here are your login details: ..."

[Close] button collapses back to card view.

New API routes:
PATCH /api/admin/clients/[id]/status — updates status field
PATCH /api/admin/clients/[id]/checklist — updates one checkbox
PATCH /api/admin/clients/[id]/notes — updates admin_notes
All routes: auth required, service role Supabase client.

### 3C — Automated weekly summary email

Every Monday at 09:00 CET, the operator gets an automated
email summarising their own business performance for the week.

This serves two purposes:
1. The operator sees their business performing without logging in
2. It proves the cron/email system works before white-glove
   clients need it (easy to extend to them later)

New Vercel cron: /api/cron/weekly-report

Add to vercel.json:
```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-report",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

Route logic:
1. Verify CRON_SECRET header (add to .env.example)
   ```typescript
   if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
   }
   ```
2. Query Supabase (service role) for last 7 days:
   - inquiries_count: bookings where created_at > now()-7d
   - confirmed_count: bookings where status changed to 'confirmed'
     this week (check status_history or created_at for confirmed)
   - revenue_week: sum of total_eur for bookings confirmed this week
   - upcoming_pickups: bookings where status='confirmed' AND
     start_at BETWEEN now() AND now()+7d
     (include: car name, customer first name, date, pickup_time)
3. Send to ADMIN_EMAIL via Resend

Weekly report email template (add to /lib/email/templates.ts):

Subject: "Your week — {dateRange}"
(dateRange: "Mon 5 May – Sun 11 May")

```
Good morning,

Here's your RentalOS summary for the week.

THIS WEEK
────────────────────────────────
New inquiries       {inquiries_count}
Confirmed bookings  {confirmed_count}
Revenue             {formatPrice(revenue_week)}

UPCOMING PICKUPS
────────────────────────────────
{for each pickup: car · customer · date · time}
{if none: "No pickups scheduled this week."}

────────────────────────────────
[Open admin panel →]

RentalOS · Your automated booking system
```

Plain text style — no images, minimal HTML. Renders perfectly
in every email client. Feels like a message from a smart tool,
not a marketing email.

Add CRON_SECRET to .env.example and ENV.md.
Document in RUNBOOK.md how to test the cron manually:
POST /api/cron/weekly-report with correct Authorization header.

---

## PHASE 4 — Growth Engine
### Goal: Automated customer acquisition

### 4A — Four SEO landing pages

Each page targets people actively searching for rental software.
Real searches, real pain points, real product. No fluff.

Create these pages:

/landing/car-rental-booking-software
Primary keyword: "car rental booking software"
Secondary: "car hire management system", "car rental software uk"

/landing/yacht-charter-booking-system
Primary: "yacht charter booking system"
Secondary: "day charter booking software", "boat rental software"

/landing/villa-rental-management-software
Primary: "villa rental management software"
Secondary: "holiday rental software", "vacation rental system"

/landing/luxury-rental-software-marbella
Primary: "car rental software marbella"
Secondary: "luxury rental software spain", "rental booking system costa del sol"

For each page use this structure:

1. Hero (problem-first, not product-first)
   H1: "[Pain statement in their language]"
   e.g. "Stop managing car rental bookings on WhatsApp."
   Subheadline: One sentence on what RentalOS does.
   CTA: [See how it works →] scrolls to demo section

2. Pain section
   H2: "Sound familiar?"
   Three specific pains as icon + text blocks:
   e.g. "Missed inquiries when you're busy on site"
   e.g. "Double bookings because you forgot to update the calendar"
   e.g. "Hours lost chasing customers for documents and deposits"

3. Solution section
   H2: "RentalOS handles it."
   Three solution points matching the pains above.
   Each: bold label + one sentence.

4. Feature highlights
   Pick 4 features most relevant to that vertical.
   e.g. for yacht: calendar, inquiry form, transfer/delivery, email alerts

5. Social proof
   Single blockquote:
   "Built for CostaSol Car Rent, Marbella. Live at drivecostasol.com"
   Small, honest. Real proof beats fabricated testimonials.

6. Pricing teaser
   "From €99/month. 14-day free trial. No credit card required."
   [See all plans →] links to /pricing

7. Final CTA
   H2: "Ready to automate your bookings?"
   [Start free trial] [See live demo]

8. FAQ (3-4 vertical-specific questions)
   Use FAQPage JSON-LD schema on each page.

Each page requirements:
- Unique <title> and meta description containing primary keyword
- H1 contains primary keyword naturally
- 600-900 words total (no padding — every sentence earns its place)
- SoftwareApplication JSON-LD schema
- Canonical URL pointing to itself
- Internal links: /pricing, /demo, /sell
- Breadcrumb: Home > Software > {page title}

Run /seo-auditor on each page after building.
Run /impeccable polish on each page after building.

### 4B — Referral program

Rental business owners in the same city know each other.
Word of mouth is the natural growth channel for this product.
The referral program makes it systematic and rewarded.

New migration: supabase/migrations/06_referrals.sql

```sql
CREATE TABLE referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_email text NOT NULL,
  referrer_code text UNIQUE NOT NULL
    DEFAULT substr(md5(random()::text), 1, 8),
  referee_email text,
  referee_business text,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'signed_up', 'subscribed', 'credited')
  ),
  credited_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

Public page /refer:

If user is not logged in (no admin session): show a simple
form to enter email → creates referral row → sends them
their unique link by email.

If user has admin session: show their referral dashboard.

Referral dashboard content:
- Their unique link: rentaios.com/r/{code}
  Displayed prominently with [Copy link] button
- [Share on WhatsApp] button
  Pre-fills: "I manage my rental bookings with RentalOS —
  it's saved me hours every week. Try it free:
  https://rentaios.com/r/{code}"
- [Share by email] mailto link
- Referrals table: columns = Business, Status, Credit earned
- Total credits: "You've earned {n} months free"

Incentive copy: "Refer a rental business. When they subscribe,
you both get one month free."

Route /r/[code]:
1. Look up referral row by code (404 if not found)
2. Set cookie: referral_code={code}, expires 30 days
3. Redirect to /?ref={code}

On homepage with ?ref param: show small banner at top:
"You were referred by a RentalOS customer.
 Start your free trial →" (dismissible, stores dismiss in session)

When new subscription created in Stripe webhook:
- Check for referral_code cookie value in the session metadata
  (pass referral_code in Stripe checkout metadata)
- If found and status='signed_up': update to 'subscribed'
- Issue one-month credit to referrer via Stripe API
  (create a coupon and apply to their next invoice)
- Update status to 'credited'
- Send email to referrer: "You earned a free month!"

If Stripe not configured: referral tracking still works
(cookie → cookie → DB record) but credits are manual.
Document this in the code with a TODO comment.

Add [Refer a friend] link to /admin/billing page.

### 4C — Live demo at /demo

The most powerful conversion tool. Let people try before buying.
No signup. No friction. Full system, real data, read-only.

Implementation strategy: use a seeded demo mode within the
existing Supabase project, not a separate project. Simpler,
cheaper, easier to maintain.

Add is_demo boolean column to bookings and cars tables:

```sql
ALTER TABLE cars ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false;
```

Seed demo data (add to supabase/demo-seed.sql):
3 demo cars (is_demo=true):
- Ferrari 488 Spider 2024 · sport · €850/day · deposit €10,000
- Bentley Bentayga 2024 · suv · €650/day · deposit €8,000
- Porsche 911 Carrera 2024 · sport · €480/day · deposit €6,000

5 demo bookings (is_demo=true, linked to demo cars):
- 1 with status='inquiry' (created today)
- 1 with status='confirmed' (pickup tomorrow)
- 1 with status='picked_up' (started 2 days ago)
- 1 with status='completed' (last week)
- 1 with status='cancelled' (last week)

New route context: /demo wraps all pages with a demo banner
and forces all queries to use WHERE is_demo=true.

Create app/(demo)/layout.tsx:
- Gold banner at very top: "Live demo — data resets daily · "
  with [Start free trial →] link
- Otherwise identical to public layout
- Pass is_demo=true context to all child pages

/demo/fleet — shows only demo cars
/demo/fleet/[slug] — shows demo car detail, inquiry form disabled
  (form shows "This is a demo. Start a free trial to take real bookings.")
/demo/admin — read-only admin panel showing demo data
  - All action buttons (Confirm, Cancel, etc.) show a tooltip:
    "Actions disabled in demo mode"
  - All inputs are readonly
  - Shows full UI: bookings list, detail view, dashboard stats

Demo admin access: no login required for /demo/admin
Add is_demo check to all admin queries when in demo mode.

New Vercel cron: /api/cron/reset-demo
Schedule: "0 0 * * *" (midnight UTC, daily)
Action: delete all bookings and cars where is_demo=true,
re-run demo-seed.sql
Protect with CRON_SECRET Bearer header.

Add demo links throughout the site:
- /sell page: "See live demo →" button in hero
- /pricing page: "Explore demo →" link under each CTA
- Homepage hero: secondary CTA "See how it works →" → /demo

---

## PHASE 5 — Operations
### Goal: Run the business in under 3 hours per week

### 5A — Business metrics in admin dashboard

The current /admin dashboard shows booking stats. Add a
"Business" section above the existing booking stats.

New section: "Your business" (only show if subscriptions table
has at least one row OR Stripe is configured)

Stat cards:
- Active plan: {plan name} or "Free trial ({days} days left)"
- MRR: €{calculated} (starter=99, pro=199, white_glove=299)
  If multiple subscriptions: sum them
  If Stripe not configured: "—" with tooltip "Connect Stripe"
- Setup requests: {count of client_leads where status='new'}
  Clickable → goes to /admin/clients
- Live clients: {count of client_leads where status='live'}

Each stat: clicking it navigates to the relevant page.
Design: matches existing booking stat cards, same visual weight.

Note below section: "Connect Stripe in /admin/billing to see
live revenue data." — only show if Stripe not configured.

### 5B — FAQ page at /faq

A full FAQ page that:
1. Deflects support tickets (saves you time)
2. Ranks for "rental booking software faq" type searches
3. Helps trial users understand the product

Create /app/(public)/faq/page.tsx

Content (render as accordion, one category per section):

Category: Getting started
- What do I need to get started?
  → Node.js, a Supabase account, and a Vercel account.
  Everything else is included. Deployment takes about 1-2 hours
  following the guide. Or choose the done-for-you option.
- How long does setup take?
  → Self-hosted: 1-2 hours. Done-for-you: we set up in 24-48h.
- Can I use my own domain?
  → Yes. You connect it in Vercel after deploying.
- What if I'm not technical?
  → Choose the done-for-you plan. We handle everything.
- Is there a free trial?
  → Yes. 14 days, no credit card required.

Category: Features
- Can I manage multiple vehicle types?
  → Yes. Add cars, yachts, villas — any type of rental unit.
- How does the booking flow work?
  → Customer submits inquiry → you confirm personally →
  customer gets confirmation email with pickup details.
- What emails are sent automatically?
  → Inquiry confirmation, booking confirmation, cancellation.
  You get an alert for every new inquiry.
- Can customers pay online?
  → Not yet. Payment is collected in person at pickup.
  This is deliberate — most luxury rental businesses prefer it.
- How does the transfer/delivery feature work?
  → Customer can request delivery to a custom address.
  You set the fee in the admin before confirming.
- Can I set my own cancellation policy?
  → Yes. Set it in Admin → Settings.
- Does it work on mobile?
  → Yes. The admin panel and customer-facing site are
  both designed mobile-first.

Category: Billing
- How much does it cost?
  → Starter €99/month, Pro €199/month, or buy the template
  outright for €299. See /pricing for full details.
- Can I cancel anytime?
  → Yes. Cancel from Admin → Billing. No questions asked.
- Do you offer refunds?
  → 30-day money-back guarantee on subscriptions.
  Template sales are final.
- What happens when my trial ends?
  → You choose a plan. If you don't, your admin panel is
  locked but your data is kept for 30 days.
- Can I upgrade or downgrade?
  → Yes, anytime from Admin → Billing.

Category: Technical
- What tech stack is it built on?
  → Next.js 15, Supabase, Resend, Vercel.
  All open source. No vendor lock-in.
- Where is my data stored?
  → Supabase (PostgreSQL). EU region by default.
- Is it GDPR compliant?
  → The system is built with GDPR in mind. You are the
  data controller. See Privacy Policy.
- Can I self-host it?
  → Yes. Buy the template and deploy wherever you want.
- Can I buy the source code?
  → Yes. See /sell. MIT licence — use it commercially.
- Do you offer white-label for agencies?
  → Yes. Contact us for agency pricing.

Add FAQPage JSON-LD schema.
Add to sitemap.
Add "FAQ" link to footer navigation column.
Run /seo-auditor and /impeccable polish on the page.

### 5C — Email sequence documentation

Generate docs/EMAIL_SEQUENCES.md — a complete playbook for
setting up automated sequences in Resend. These run automatically
once configured; no additional code needed.

Document three sequences:

Sequence 1 — Trial onboarding (automated in Resend)
Trigger: new subscription where status='trialing'

Day 0 (immediate):
Subject: "Your RentalOS trial has started — here's what to do first"
Body:
"Hi {name},

Your 14-day trial has started. Here's what to do first:

1. Add your vehicles → Admin → Fleet → Add Car
2. Take a test booking → visit your public site and submit an inquiry
3. Confirm it in the admin to see the full flow

Your trial runs until {trial_end_date}.

[Open your admin panel →]"

Day 3:
Subject: "Have you added your first vehicle?"
Body: Short check-in. One tip. Link to admin.

Day 10:
Subject: "4 days left in your trial"
Body: What you'll lose (bookings, email history, fleet data).
Upgrade link. Mention template option for those who want to own code.

Day 14:
Subject: "Your trial ends today"
Body: Three sentences maximum.
"Your trial ends today. Upgrade to keep everything running.
[Choose a plan →]"

Sequence 2 — Done-for-you post-delivery (manual send from admin)
Trigger: send manually when deployment_checklist is complete

Delivery email:
Subject: "Your {business_name} booking system is live"
Body:
"Hi {name},

Your system is live. Here's everything you need:

Admin panel: {admin_url}
Email: {admin_email}
Password: {temp_password} (change this on first login)

What to do next:
1. Log in and change your password
2. Add your real vehicles (replace the sample data)
3. Share your booking page with a customer to test

Reply to this email if you have any questions."

Day 7 follow-up:
Subject: "How's your first week going?"
Body: Check-in. Offer 15-min call. Link to FAQ.

Sequence 3 — Past-due payment (automated in Resend)
Trigger: subscription status = 'past_due' (set by Stripe webhook)

Day 1:
Subject: "Action needed — payment failed"
Body: Direct. Payment failed. Update card. Link to billing portal.
No fluff. They need to fix it.

Day 5:
Subject: "Your account will be suspended in 2 days"
Body: Two sentences. Link. Done.

Note: These sequences require Resend's automation features.
Document setup steps in ENV.md under "Email Automation".

### 5D — Final CLAUDE.md update

Replace the entire CLAUDE.md with the following — this becomes
the definitive project context for every future session:

```markdown
# RentalOS — Project Context

## What this is
White-label luxury rental booking SaaS for car rental, yacht
charter, villa, and motorcycle rental businesses.

Sell the codebase (€299) or run it as a SaaS (€99-199/mo).
Done-for-you setup service (€499 one-time).

## Revenue model
| Product | Price | Where |
|---------|-------|-------|
| Template | €299 once | /sell → Gumroad |
| Starter plan | €99/month | /pricing → Stripe |
| Pro plan | €199/month | /pricing → Stripe |
| Done-for-you setup | €499 once | /onboarding → manual |
| White-glove management | €299/month | /pricing → contact |

## Key pages
| Page | Purpose |
|------|---------|
| /sell | Template sales |
| /pricing | Subscription pricing |
| /onboarding | Done-for-you client intake |
| /demo | Live explorable demo |
| /refer | Referral program |
| /faq | Support deflection + SEO |
| /landing/* | SEO landing pages (4 verticals) |
| /admin/clients | Done-for-you pipeline |
| /admin/billing | Subscription management |
| /admin/settings | Business configuration |

## Architecture
- Single-tenant per Vercel deployment (one business = one deploy)
- business_config table: all white-label customisation
- is_demo flag on cars and bookings: powers /demo without
  a separate Supabase project
- Stripe: subscriptions and one-time payments (graceful
  degradation if STRIPE_SECRET_KEY is not set)
- Vercel crons: weekly-report (Mon 09:00 CET),
  reset-demo (daily 00:00 UTC)

## Database tables
- cars, bookings, customers, admin_users (original)
- business_config (Phase 2 — white-label config)
- subscriptions (Phase 2 — Stripe billing)
- client_leads (Phase 3 — done-for-you pipeline)
- referrals (Phase 4 — referral program)

## Stack
Next.js 15 App Router · TypeScript · Tailwind CSS · shadcn/ui
Supabase (auth + db + storage) · Resend · Stripe · Vercel

## Commands
pnpm dev — local development
pnpm build — production build (must be 0 errors)
pnpm lint — ESLint check

## Weekly operations (under 3 hours)
- Monday: review client_leads NEW column
- Daily: check /admin for new inquiries (email alert sent)
- Monthly: review MRR dashboard, follow up on expiring trials
```

---

## AFTER ALL PHASES — Final checklist

Code:
1. npm run build — 0 errors, 0 TypeScript errors
2. /impeccable audit — resolve all P1 and P2 findings
3. /seo-auditor — run on all new public pages
4. /security-auditor — run on all new API routes

Database migrations to run manually in Supabase SQL Editor:
- 05_client_leads.sql
- 06_referrals.sql
- ALTER TABLE cars/bookings ADD is_demo (from 4C)
- supabase/demo-seed.sql (run after adding is_demo column)

New env vars to add in Vercel:
- CRON_SECRET (generate: openssl rand -hex 32)
- STRIPE_SECRET_KEY (from Stripe dashboard)
- STRIPE_WEBHOOK_SECRET (from Stripe webhook settings)
- STRIPE_STARTER_PRICE_ID (create in Stripe)
- STRIPE_PRO_PRICE_ID (create in Stripe)
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (from Stripe dashboard)

Git:
5. git add .
6. git commit -m "RentalOS Phase 3-5: complete business system"
7. git push

Final report must include:
A. Every file created or modified (grouped by phase)
B. Every database migration (list in order to run)
C. Every new env var (with instructions to obtain value)
D. The 5 highest-leverage actions to take in week 1
   to get the first paying customer
E. Realistic projections:
   Month 1: what is achievable with this system
   Month 3: with consistent outreach
   Month 6: with referral flywheel active
