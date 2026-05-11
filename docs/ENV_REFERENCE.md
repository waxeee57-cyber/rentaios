# RentalOS — Environment Variables Reference

Generated: 2026-05-11

All variables are set in Vercel (Settings → Environment Variables) and locally in `.env.local`.  
Missing required vars throw at server startup (`lib/env.ts → requireEnv()`).

---

## Required — Core Infrastructure

| Variable | Required | Format | Used by | Fallback |
|----------|----------|--------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `https://<ref>.supabase.co` | `lib/supabase.ts`, `lib/supabase-server.ts` | App fails to start |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | JWT string | `lib/supabase.ts`, `lib/supabase-server.ts` | App fails to start |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | JWT string | `lib/supabase.ts` (supabaseAdmin) — bypasses RLS | App fails to start |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://yourdomain.com` | Email templates, Stripe redirects, sitemap, webhooks | `https://localhost:3000` |
| `ADMIN_EMAIL` | Yes | Email address | `lib/resend.ts` — all admin alert emails | `hello@rentaios.com` |

---

## Required — Email

| Variable | Required | Format | Used by | Fallback |
|----------|----------|--------|---------|----------|
| `RESEND_API_KEY` | Yes (for emails) | `re_...` | `lib/resend.ts` | Email silently skipped |
| `RESEND_FROM_EMAIL` | No | Email address | `lib/resend.ts` FROM address | `noreply@rentaios.com` |
| `RESEND_FROM_NAME` | No | String | `lib/resend.ts` FROM display name | `RentalOS` |

---

## Required — Stripe (billing)

All Stripe vars are optional. If `STRIPE_SECRET_KEY` is not set, billing features degrade gracefully.

| Variable | Required | Format | Used by | Fallback |
|----------|----------|--------|---------|----------|
| `STRIPE_SECRET_KEY` | No (graceful) | `sk_test_...` or `sk_live_...` | `lib/stripe.ts`, billing routes | Billing disabled, 503 on checkout |
| `STRIPE_WEBHOOK_SECRET` | No | `whsec_...` | `/api/billing/webhook` | Webhook returns 200, no processing |
| `STRIPE_STARTER_PRICE_ID` | No | `price_...` | `/api/billing/create-checkout`, webhook | |
| `STRIPE_GROWTH_PRICE_ID` | No | `price_...` | `/api/billing/create-checkout`, webhook | |
| `STRIPE_PRO_PRICE_ID` | No | `price_...` | `/api/billing/create-checkout`, webhook | |
| `STRIPE_STARTER_ANNUAL_PRICE_ID` | No | `price_...` | `/api/billing/create-checkout`, webhook | |
| `STRIPE_GROWTH_ANNUAL_PRICE_ID` | No | `price_...` | `/api/billing/create-checkout`, webhook | |
| `STRIPE_PRO_ANNUAL_PRICE_ID` | No | `price_...` | `/api/billing/create-checkout`, webhook | |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | `pk_test_...` or `pk_live_...` | Client-side (not yet used directly) | |
| `STRIPE_SMS_ADDON_PRICE_ID` | No | `price_...` | `/api/admin/billing/addons` (SMS add-on) | Add-on recorded, Stripe not charged |
| `STRIPE_DEPOSIT_ADDON_PRICE_ID` | No | `price_...` | `/api/admin/billing/addons` (deposit add-on) | Add-on recorded, Stripe not charged |

---

## Required — Cron Jobs

| Variable | Required | Format | Used by | Fallback |
|----------|----------|--------|---------|----------|
| `CRON_SECRET` | Yes (for crons) | Random hex string | All `/api/cron/*` routes | Returns 401 |

Generate: `openssl rand -hex 32`

---

## Optional — Business Branding

| Variable | Required | Format | Used by | Fallback |
|----------|----------|--------|---------|----------|
| `NEXT_PUBLIC_BUSINESS_NAME` | No | String | `lib/config.ts` DEFAULT_CONFIG | `RentalOS` |
| `NEXT_PUBLIC_BUSINESS_PHONE` | No | Phone number | `lib/config.ts` DEFAULT_CONFIG | null |
| `NEXT_PUBLIC_BUSINESS_WHATSAPP` | No | Digits only e.g. `34600000001` | `lib/whatsapp.ts` | WhatsApp button hidden |
| `NEXT_PUBLIC_BUSINESS_TAGLINE` | No | String | `.env.example` reference | (unused in code currently) |
| `NEXT_PUBLIC_GUMROAD_URL` | No | Gumroad product URL | Homepage pricing teaser `/sell` link | `/sell` |

---

## Optional — Integrations

| Variable | Required | Format | Used by | Fallback |
|----------|----------|--------|---------|----------|
| `N8N_WEBHOOK_URL` | No | `https://...` | `lib/n8n.ts` — booking notifications | Webhook skipped, logged |
| `N8N_WEBHOOK_SECRET` | No | String | `lib/n8n.ts` `x-webhook-secret` header | Empty string |
| `ANTHROPIC_API_KEY` | No | `sk-ant-...` | `/api/cron/cold-email-followup`, `/api/admin/outreach/send` | Falls back to static email templates |
| `GUMROAD_SELLER_ID` | No | String | `/api/webhooks/gumroad` seller verification | Accepts without seller check (dev mode) |
| `APOLLO_API_KEY` | No | String | Not wired in code yet — future lead sourcing | Unused |
| `INSTANTLY_API_KEY` | No | String | Not wired in code yet — future email delivery | Unused |
| `HEALTH_SECRET` | No | Random hex | `/api/health` — unlocks full diagnostic response | Health returns `{ ok: true }` only |
| `TWILIO_ACCOUNT_SID` | No | `AC...` | Not wired in code yet — SMS add-on | Unused |
| `TWILIO_AUTH_TOKEN` | No | String | Not wired in code yet — SMS add-on | Unused |
| `TWILIO_PHONE_NUMBER` | No | E.164 format | Not wired in code yet — SMS add-on | Unused |

---

## Optional — Display / Behaviour

| Variable | Required | Format | Used by | Fallback |
|----------|----------|--------|---------|----------|
| `MAINTENANCE_MODE` | No | `true` / `false` | (checked in middleware — not wired in current code) | `false` |
| `NEXT_PUBLIC_AED_RATE` | No | Float e.g. `4.1` | `/pricing` PricingClient currency conversion | `4.1` |

---

## Variable Categories by Risk

**Extremely sensitive (never log, never expose):**
- `SUPABASE_SERVICE_ROLE_KEY` — full DB access, bypasses all RLS
- `STRIPE_SECRET_KEY` — can charge customers and issue refunds
- `STRIPE_WEBHOOK_SECRET` — validates Stripe webhook authenticity
- `RESEND_API_KEY` — can send email as your domain
- `CRON_SECRET` — can trigger data resets (including demo wipe)
- `ANTHROPIC_API_KEY` — paid API access

**Sensitive (don't log, limit exposure):**
- `N8N_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public but should stay in env, not code
- `HEALTH_SECRET`

**Safe to expose (prefixed `NEXT_PUBLIC_`):**
- All `NEXT_PUBLIC_*` vars are bundled into client JavaScript by Next.js
