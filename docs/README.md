# RentalOS

White-label luxury rental booking SaaS. Built for car rental, yacht, villa, and motorcycle rental businesses.

## What it is

A complete, production-ready booking system that turns inquiry chaos (WhatsApp, spreadsheets, email threads) into a structured workflow with a professional customer-facing site and a mobile-first admin panel.

**Live reference deployment:** [costasol.vercel.app](https://costasol.vercel.app)

## Stack

- **Framework:** Next.js 15 (App Router), TypeScript
- **Styling:** Tailwind CSS v4
- **Database + Auth + Storage:** Supabase
- **Email:** Resend
- **Payments:** Stripe (optional — graceful degradation without it)
- **Automation:** n8n (optional webhook workflow)
- **Analytics:** Vercel Analytics
- **Hosting:** Vercel

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd rentaios
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in all values.
See `docs/ENV.md` for full documentation.

### 3. Supabase setup

1. Create a Supabase project at supabase.com
2. Run `supabase/schema.sql` in the Supabase SQL editor
3. Run `supabase/policies.sql` in the SQL editor
4. (Dev only) Run `supabase/seed.sql` to add demo vehicles
5. Create storage bucket: `documents` (private) — required for pickup document uploads

### 4. Admin user

In Supabase:
1. Go to Authentication > Users > Add user
2. Create with your admin email + password
3. Run `supabase/admin-seed.sql` in the SQL editor

### 5. n8n workflow (optional)

1. Sign up at n8n.cloud or self-host
2. Import `n8n/workflows/inquiry-created.json`
3. Add Resend API credentials in n8n
4. Set `N8N_WEBHOOK_URL` and `N8N_WEBHOOK_SECRET` in env vars

### 6. Run locally

```bash
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
```

## Deploy

Push to GitHub → connect to Vercel → set env vars in Vercel dashboard → deploy.

See `docs/GO_LIVE.md` for the full launch checklist.

## Business model

| Product | Price | What they get |
|---|---|---|
| Template | €299 once | Full source code, MIT license, deploy yourself |
| Done-for-you | €499 once | We deploy and configure it on your domain |
| Starter SaaS | €99/month | Hosted, up to 50 bookings/mo, 1 vehicle category |
| Pro SaaS | €199/month | Unlimited bookings and vehicles, all features |
| White Glove | €299/month | Everything managed, monthly check-in, custom domain |

## Booking flow

```
Customer browses fleet
  → submits inquiry (dates, location, message)
    → admin receives email alert
      → admin confirms via admin panel (or declines)
        → confirmation email sent to customer
          → pickup: admin marks picked_up, uploads documents
            → return: admin marks returned, adds notes
              → complete: admin closes booking
```

No online payment. Payment collected in person at pickup.
