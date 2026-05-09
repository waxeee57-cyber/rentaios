# Gumroad Listing Setup — RentalOS

## Product title

RentalOS — Luxury Car Rental Booking System (Next.js 15 + Supabase)

---

## SEO description (~400 words)

If you've ever tried to build a car rental booking system from scratch, you know the real work isn't the homepage. It's the admin panel. The booking overlap logic. The email templates. The document uploads at pickup. The mobile experience for the person running the business from their phone in a car park.

RentalOS is a complete luxury rental booking software built in production for a real car rental company in Marbella, Spain. It handles the entire inquiry-to-return lifecycle and ships with everything you need to be live in a day.

**What's included in this car rental booking system template:**

A full Next.js 15 App Router codebase in TypeScript. A complete Supabase database schema with Row Level Security policies and demo seed data. A mobile-first admin panel tested on phones in real field conditions — because the person marking the car as "picked up" is standing in a car park, not at a desk.

The booking flow covers everything: customer inquiry → admin confirmation → pickup → return → completion. Overlap prevention is enforced at the database level using a btree_gist exclusion constraint — double-bookings on confirmed reservations are structurally impossible.

Email notifications use 5 pre-built HTML templates via Resend: customer inquiry confirmation, admin inquiry alert, booking confirmation, booking update, and return summary. All templates are ready to go — just add your API key and sender domain.

The system also includes a transfer/delivery fee feature for businesses that bring vehicles to customers, rate limiting and IP-based request throttling, full SEO optimization (JSON-LD structured data, dynamic sitemap, robots.txt), and Vercel deployment configuration.

**Who this nextjs rental saas template is for:**

Freelancers who want to deliver a production-ready booking system without building the infrastructure from scratch. Rental business owners who are managing bookings via WhatsApp and spreadsheets and want to own their tech. Developers who want to launch their own rental SaaS — car, yacht, villa, or motorcycle — without starting from zero.

**Deployment time:** About 1–2 hours from zero to live with the included setup documentation.

**Tech stack:** Next.js 15, TypeScript, Tailwind CSS v4, Supabase, Resend, Vercel

**License:** MIT — use commercially, build client projects on it, launch your own SaaS, resell to clients.

The reference deployment is live at costasol.vercel.app — a luxury car rental business in Marbella running this exact codebase in production.

---

## Files to include in zip

```
/
├── app/                    # All Next.js pages and API routes
├── components/             # React components (admin, booking, marketing, ui)
├── lib/                    # Utilities (formatters, supabase, email, etc.)
├── supabase/
│   ├── schema.sql          # Full database schema
│   ├── policies.sql        # RLS policies
│   ├── seed.sql            # Demo data (3 vehicles)
│   ├── admin-seed.sql      # Admin user setup
│   └── migrations/         # All migrations
├── public/                 # Static assets
├── docs/                   # ENV, RUNBOOK, GO_LIVE, README guides
├── .env.example            # All env vars documented
├── package.json
├── tsconfig.json
├── postcss.config.mjs
└── README.md
```

Exclude: `.env.local`, `node_modules/`, `.next/`, `.git/`

---

## Pricing

- **Suggested price:** €299
- **Floor (minimum):** €199
- **Enable "pay what you want":** No — fixed price protects positioning

---

## MIT License text

```
MIT License

Copyright (c) 2025 RentalOS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Tags

`nextjs`, `supabase`, `car-rental`, `booking-system`, `saas-template`, `typescript`,
`tailwind`, `vercel`, `rental-software`, `admin-panel`, `luxury-rental`, `booking-software`
