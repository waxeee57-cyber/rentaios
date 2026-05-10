# RentalOS — Luxury Rental Booking System

A complete booking and management system for luxury rental businesses.
Built with Next.js, Supabase, Resend, and Vercel.

**Live demo:** [costasol.vercel.app](https://costasol.vercel.app)

## What's included

- Customer-facing fleet and booking pages
- Full admin panel (bookings, fleet, dashboard)
- Email notifications (5 templates, Resend)
- Transfer/delivery feature with fee management
- Rate limiting and security hardening
- SEO optimised (sitemap, JSON-LD schema, robots.txt)
- Mobile-first, luxury design
- Business config system (database-driven settings)
- Stripe subscription billing (graceful degradation)
- Complete documentation

## Quick start

1. Clone this repository
2. Copy `.env.example` to `.env.local` and fill in your values
3. Create a Supabase project and run the migrations in `supabase/migrations/`
4. Deploy to Vercel

Full guide: [docs/RUNBOOK.md](docs/RUNBOOK.md)

## Documentation

- [RUNBOOK.md](docs/RUNBOOK.md) — complete setup and operations guide
- [ENV.md](docs/ENV.md) — environment variables reference
- [GO_LIVE.md](docs/GO_LIVE.md) — pre-launch checklist

## Tech stack

Next.js App Router · TypeScript · Tailwind CSS v4 · shadcn/ui ·
Supabase · Resend · Stripe · Vercel

## License

MIT — use commercially, resell to clients, white-label freely.
