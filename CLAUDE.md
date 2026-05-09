@AGENTS.md

# RentalOS — Project Context

## What this is
RentalOS is a white-label luxury rental booking SaaS.
Base codebase: CostaSol Car Rent (Marbella). Now productized
for any luxury rental business — car, yacht, villa, motorcycle.

## Business model
- Template sale: €299 one-time (full source code, MIT license)
- SaaS subscription: €99/mo Starter, €199/mo Pro, €299/mo White Glove
- Done-for-you setup: €499 one-time (deploy + configure for client)

## Target customers
Luxury car rental companies, yacht day-charter operators,
villa rental agencies, motorcycle/scooter rental businesses.
All currently managing bookings via WhatsApp or spreadsheets.

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS v4, shadcn/ui,
Supabase (auth + db + storage), Resend, n8n, Vercel, Stripe

## Brand colors (never hardcode hex — use tokens)
black: #0F0F10, graphite: #1B1B1D, gold: #C8A96B,
goldHover: #D4B57A, textPrimary: #FFFFFF, textSecondary: #B8B8B8

## Key rules
- All currency: formatPrice() or formatPriceDecimals() from lib/formatters.ts
- All dates: formatDate() / formatDateTime() in Europe/Madrid timezone
- Stripe: graceful degradation — app must build/run without STRIPE_SECRET_KEY
- Mobile-first — admin panel used on phone in field
- Brand voice: confident, understated, no exclamation marks
- Business config values come from business_config table via lib/config.ts
- Site URL: NEXT_PUBLIC_SITE_URL env var
- Admin email: ADMIN_EMAIL env var

## Database
Supabase project: cgbthkoqncgvlgzetlum.supabase.co
Tables: cars, bookings, customers, admin_users, business_config, subscriptions
Key constraint: no_overlap exclusion on bookings (confirmed/picked_up/returned)

## After every change
npm run build → 0 errors → git add . → git commit → git push
Vercel auto-deploys on push.

## Live demo
https://costasol.vercel.app (CostaSol Car Rent — the reference deployment)
Admin: https://costasol.vercel.app/admin
