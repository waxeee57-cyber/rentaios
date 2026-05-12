@AGENTS.md

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
| /onboarding | Done-for-you client intake (6-step form) |
| /demo | Live explorable demo (no login required) |
| /refer | Referral program |
| /faq | Support deflection + SEO |
| /landing/* | SEO landing pages (4 verticals) |
| /admin/clients | Done-for-you pipeline (client_leads table) |
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

## Key rules
- All currency: formatPrice() or formatPriceDecimals() from lib/formatters.ts
- All dates: formatDate() / formatDateTime() in Europe/Madrid timezone
- Stripe: graceful degradation — app must build/run without STRIPE_SECRET_KEY
- Mobile-first — admin panel used on phone in field
- Brand voice: confident, understated, no exclamation marks
- Business config values come from business_config table via lib/config.ts
- Site URL: NEXT_PUBLIC_SITE_URL env var
- Admin email: ADMIN_EMAIL env var
- Zero hardcoded brand strings — all business name/email from getBusinessConfig()
- Zero PII in console.log — booking codes only, never email addresses
- Every new admin API route uses requireAdmin() from lib/auth.ts
- Every new public API route has rate limiting via lib/rate-limit.ts
- Service role for writes, anon for public reads

## Database
Supabase project: cgbthkoqncgvlgzetlum.supabase.co
Tables: cars, bookings, customers, admin_users, business_config,
        subscriptions, client_leads, referrals

Key constraint: no_overlap exclusion on bookings (confirmed/picked_up/returned)

## Weekly operations (under 3 hours)
- Monday: review client_leads NEW column in /admin/clients
- Daily: check /admin for new inquiries (email alert sent automatically)
- Monthly: review MRR dashboard, follow up on expiring trials

## After every change
npm run build → 0 errors → git add . → git commit → git push
Vercel auto-deploys on push.

## Live demo
https://costasol.vercel.app (CostaSol Car Rent — the reference deployment)
Admin: https://costasol.vercel.app/admin

---

## Team Workflow (added 2026-05-12)

This project is co-developed by Roland and Dominik. The rules 
below SUPERSEDE the earlier "After every change → git push" 
instruction. Read these rules at the start of every session.

### Branch rules (NON-NEGOTIABLE)

NEVER commit directly to `main`. Always work on a feature branch.

Before starting any work:
1. Run `git branch --show-current`
2. If the result is `main`: create a new branch BEFORE writing any code:
   - Bug fix: `git checkout -b fix/<short-description>`
   - New feature: `git checkout -b feature/<short-description>`
   - Refactor: `git checkout -b refactor/<short-description>`
   - Docs only: `git checkout -b docs/<short-description>`
3. If already on a feature branch: pull latest main first:
   `git fetch origin main && git rebase origin/main`

After completing work:
1. Verify build still passes: `pnpm build` (must report 0 errors)
2. Stage and commit: `git add . && git commit -m "<message>"`
3. Push the branch: `git push -u origin <branch-name>`
4. Open a PR via GitHub web UI
5. DO NOT auto-merge. Wait for human review.

### Commit message format

Pattern: `<type>: <short description>`

Allowed types: `feat`, `fix`, `refactor`, `docs`, `style`, `chore`

Examples:
- `feat: add print button to order cards`
- `fix: kitchen display missing new orders column`
- `docs: update HANDOFF.md with Zöldfészek client details`
- `chore: bump @types/node to 20.19.40`

Keep the message under 72 characters total.

### STATUS.md coordination

Before starting any work, read STATUS.md in the repo root.
It tracks who is currently working on what.

If your assigned task touches files or feature areas that 
another team member is actively working on (per STATUS.md), 
STOP. Report the conflict to the user. Do not proceed until 
the user resolves it.

When you start a task, update STATUS.md to claim your work area.
When the work is merged to main, clear your entry.
