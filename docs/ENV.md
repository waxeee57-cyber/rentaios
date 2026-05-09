# Environment Variables

Copy `.env.example` to `.env.local` for local development.

## Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server only) |
| `RESEND_API_KEY` | Yes (launch) | Resend API key. Leave empty locally — emails log to console. |
| `RESEND_FROM_EMAIL` | Yes (launch) | Verified sender address, e.g. `noreply@yourdomain.com`. Domain must be verified in Resend dashboard first. |
| `RESEND_FROM_NAME` | No | Display name in From header. Defaults to `RentalOS`. |
| `N8N_WEBHOOK_URL` | No | n8n webhook URL — only needed for WhatsApp automation. Empty = skipped. |
| `N8N_WEBHOOK_SECRET` | No | Secret sent in `x-webhook-secret` header for n8n. |
| `ADMIN_EMAIL` | Yes | Owner email for admin notifications |
| `NEXT_PUBLIC_SITE_URL` | Yes | Full URL, e.g. `https://yourdomain.com`. Used in emails and metadata. |
| `NEXT_PUBLIC_BUSINESS_NAME` | No | Defaults to `RentalOS` |
| `NEXT_PUBLIC_BUSINESS_PHONE` | Yes (launch) | Phone in international format, e.g. `+34600000000` |
| `NEXT_PUBLIC_BUSINESS_WHATSAPP` | Yes (launch) | WhatsApp number without +, e.g. `34600000000` |
| `MAINTENANCE_MODE` | No | Set to `true` to show maintenance page on all public routes |
| `STRIPE_SECRET_KEY` | No | Stripe secret key. App runs without it — billing features show "not configured". |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret. Required to verify webhook events. |
| `STRIPE_STARTER_PRICE_ID` | No | Stripe Price ID for the Starter plan (€99/mo) |
| `STRIPE_PRO_PRICE_ID` | No | Stripe Price ID for the Pro plan (€199/mo) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key (safe to expose in browser) |
| `HEALTH_SECRET` | No | Secret for `/api/health`. Without it, endpoint returns only `{ ok: true }` to anonymous callers. |

## Analytics

Vercel Analytics is enabled by default — view dashboards in your Vercel project under the Analytics tab. No additional configuration required.

## Email (Resend)

```
RESEND_API_KEY         — from resend.com dashboard → API Keys
                         Leave empty during development (emails log to console)
                         Required for production email delivery

RESEND_FROM_EMAIL      — verified sender address, e.g. noreply@yourdomain.com
                         Domain must be verified in Resend dashboard first

RESEND_FROM_NAME       — display name, default: "RentalOS"

ADMIN_EMAIL            — where admin alerts are sent, e.g. admin@yourdomain.com
```

## Stripe (optional — graceful degradation)

```
STRIPE_SECRET_KEY               — from Stripe dashboard → Developers → API keys
STRIPE_WEBHOOK_SECRET           — from Stripe dashboard → Webhooks → signing secret
STRIPE_STARTER_PRICE_ID         — create in Stripe → Products → add price
STRIPE_PRO_PRICE_ID             — create in Stripe → Products → add price
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — from Stripe dashboard → Developers → API keys
```

All Stripe features degrade gracefully: the app builds and runs with no Stripe keys set.
Admin billing page shows "Billing not configured" with setup instructions.

## Graceful degradation (dev)

- `RESEND_API_KEY` empty → skips Resend calls, logs to console
- `N8N_WEBHOOK_URL` empty → skips n8n calls, logs to console
- `STRIPE_SECRET_KEY` empty → billing routes return informative errors, no crashes
