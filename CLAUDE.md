@AGENTS.md

# CostaSol Car Rent — Project Context

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui,
Supabase (auth + db + storage), Resend, n8n, Vercel

## Brand colors (never hardcode hex — use tokens)
black: #0F0F10, graphite: #1B1B1D, gold: #C8A96B,
goldHover: #D4B57A, textPrimary: #FFFFFF, textSecondary: #B8B8B8

## Key rules
- All currency: formatPrice() or formatPriceDecimals() from lib/formatters.ts
- All dates: formatDate() / formatDateTime() in Europe/Madrid timezone
- No Stripe (payments in person at pickup)
- Mobile-first — admin panel used on phone in field
- Brand voice: confident, understated, no exclamation marks

## Business model
Luxury car rental, Marbella / Costa del Sol. Concierge model:
inquiry → admin confirms via WhatsApp → pickup in person.
No online payment. 2 cars at launch.

## Database
Supabase project: cgbthkoqncgvlgzetlum.supabase.co
Tables: cars, bookings, customers, admin_users
Key constraint: no_overlap exclusion on bookings (confirmed/picked_up/returned)

## After every change
npm run build → 0 errors → git add . → git commit → git push
Vercel auto-deploys on push.

## Live site
https://costasol.vercel.app
Admin: https://costasol.vercel.app/admin
