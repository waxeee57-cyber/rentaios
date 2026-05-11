# RentalOS — Audit Findings

Generated: 2026-05-11  
Status: Read-only audit — no code changes made.

---

## Summary

| Category | Count | Severity |
|----------|-------|----------|
| Missing rate limiting | 2 | Medium |
| Routes referenced in vercel.json but not found | 0 | — |
| Orphan / stale env vars | 4 | Low |
| Dead code (unused exports) | 2 | Low |
| Inconsistent naming | 3 | Low |
| Duplicate logic | 2 | Low |
| Missing error handling | 3 | Low |
| Security notes | 1 | Low |
| Business logic notes | 3 | Info |

---

## 1. Missing Rate Limiting

### 1a. `GET /api/cars/[slug]/availability` — no rate limit
**File:** `app/api/cars/[slug]/availability/route.ts`  
**Issue:** This public endpoint has no rate limiting. A malicious actor could enumerate all car slugs and probe availability for every date combination (calendar scraping / competitive intel).  
**Recommendation:** Add `rateLimit(ip, 120, 60_000)` — generous enough for normal use but blocks automated scraping.

### 1b. `GET /api/health` — no rate limit on the full-detail response
**File:** `app/api/health/route.ts`  
**Issue:** If `HEALTH_SECRET` is guessable or leaked, repeated calls to the detailed health endpoint could expose service status. The anonymous `{ ok: true }` response has no rate limiting but reveals nothing sensitive.  
**Recommendation:** Low-risk; add rate limit only if `HEALTH_SECRET` is considered high-value.

---

## 2. Orphan / Stale Environment Variables

Variables present in `.env.example` with no corresponding code usage found:

| Variable | Status |
|----------|--------|
| `APOLLO_API_KEY` | Declared in `.env.example`, not referenced in any source file |
| `INSTANTLY_API_KEY` | Declared in `.env.example`, not referenced in any source file |
| `TWILIO_ACCOUNT_SID` | Checked in `admin/billing/page.tsx` (`TWILIO_CONFIGURED`) but not used in any actual Twilio calls |
| `TWILIO_AUTH_TOKEN` | Same — declared but no implementation |
| `TWILIO_PHONE_NUMBER` | Same — declared but no implementation |
| `NEXT_PUBLIC_BUSINESS_TAGLINE` | Declared in `.env.example`, referenced in `getBusinessConfig()` as `tagline` but the env var key does not match |

**Note:** Twilio vars and Apollo/Instantly keys appear to be planned features not yet implemented.

---

## 3. Dead / Unused Code

### 3a. `lib/utils.ts`
**Issue:** Standard shadcn/ui `cn()` helper. Likely used throughout components but worth verifying it's not imported anywhere unnecessarily.

### 3b. `shortDate` function defined in both `lib/email/templates.ts` and `lib/email/send.ts`
**File:** `lib/email/templates.ts:16` and `lib/email/send.ts:21`  
**Issue:** `shortDate()` is duplicated verbatim in both files. The one in `send.ts` is used internally; the one in `templates.ts` is exported but not consumed outside the file.  
**Recommendation:** Extract to `lib/formatters.ts` (already the home for date utilities) and import from there.

---

## 4. Inconsistent Naming

### 4a. `daily_rate_eur` vs `daily_price_eur`
**File:** `app/api/admin/export/[type]/route.ts:101`  
**Issue:** The fleet CSV export queries `daily_rate_eur` (`c.daily_rate_eur`), but the actual column name in `cars` is `daily_price_eur`. This means the fleet export CSV will have an empty "Daily Rate (EUR)" column.  
**Severity:** Bug — fleet CSV export is broken for that column.

### 4b. Booking status `status_history` entry key `transfer_fee_set`
**File:** `app/api/admin/bookings/[id]/transfer-fee/route.ts:32`  
**Issue:** The status history records `{ status: 'transfer_fee_set' }` but `transfer_fee_set` is not a valid booking status in the state machine. Other history entries use valid statuses. This is cosmetic (the `status` column is not changed) but could confuse tooling that reads `status_history`.

### 4c. `resend.ts` exports `ADMIN_EMAIL` and `lib/config.ts` has `business_email`
**Issue:** Two sources of truth for the admin email: `process.env.ADMIN_EMAIL` (hard-coded in `lib/resend.ts`) and `getBusinessConfig().business_email` (from DB). Email templates use `ADMIN_EMAIL` from `lib/resend.ts`, not the DB value. If admin changes `business_email` in Settings, emails still go to the env var address.  
**Severity:** Functional inconsistency — settings change doesn't affect email routing.

---

## 5. Duplicate Logic

### 5a. Overlap check duplicated across two routes
**Files:**  
- `app/api/admin/bookings/[id]/confirm/route.ts:26–38`  
- `app/api/admin/bookings/manual/route.ts:56–73`  

Both implement identical overlap-check logic (query `bookings`, check `in ['confirmed','picked_up','returned']`, `lt start_at`, `gt end_at`). The application relies on this application-level check — there is **no database-level exclusion constraint** currently active (the CLAUDE.md mentions a `no_overlap` exclusion but it was not found in migrations). If the constraint is missing from the DB, a race condition between two simultaneous confirms could produce a double booking.  
**Recommendation:** Verify the `no_overlap` exclusion constraint exists in Supabase, or add it.

### 5b. `generateBookingCode()` with 3-attempt retry loop duplicated
**Files:**  
- `app/api/inquiries/create/route.ts:112`  
- `app/api/admin/bookings/manual/route.ts:84`  

Identical retry pattern. Could be extracted to a shared helper, but the duplication is minor.

---

## 6. Missing Error Handling

### 6a. `revalidateTag` called with wrong signature in settings routes
**Files:**  
- `app/api/admin/settings/route.ts:88` — `revalidateTag('business-config', 'default')`  
- `app/api/admin/settings/slug/route.ts:60` — `revalidateTag('business-config', 'default')`  

`revalidateTag` in Next.js 15 takes a single string argument. Passing `'default'` as a second argument is silently ignored — it does not cause an error but is incorrect. The revalidation still works for the `'business-config'` tag.

### 6b. `booking/lookup` — no error logging on failed customer lookup
**File:** `app/api/booking/lookup/route.ts:48`  
**Issue:** If `customer` fetch fails with a Supabase error (not just "not found"), the error is silently swallowed. A network issue with Supabase would return 404 instead of 500, misleading the caller.

### 6c. Demo reset cron — no cleanup on partial failure
**File:** `app/api/cron/reset-demo/route.ts`  
**Issue:** If cars insert succeeds but bookings insert fails, the demo is left in a half-seeded state (cars without bookings). The cron returns a 500 but the cars remain. Next daily run will attempt to delete `is_demo=true` cars but the orphaned cars will be cleaned up.  
**Severity:** Low — self-healing on next run.

---

## 7. Security Notes

### 7a. `referral_code` cookie is `httpOnly: false`
**File:** `app/api/r/[code]/route.ts:32`  
**Issue:** The referral tracking cookie is readable by JavaScript (`httpOnly: false`). This is intentional for client-side referral attribution reads, but worth documenting. It does not store sensitive data.

---

## 8. Business Logic Notes (Informational)

### 8a. Booking `max_rental_days` is hardcoded in manual booking route
**File:** `app/api/admin/bookings/manual/route.ts:40`  
```ts
if (days <= 0 || days > 14) return ...
```
The manual booking route hardcodes 14 days instead of reading `config.max_rental_days`. The public inquiry route correctly reads from config.  
**Impact:** Admin can only create manual bookings up to 14 days regardless of the setting.

### 8b. Gumroad webhook has no HMAC signature verification
**File:** `app/api/webhooks/gumroad/route.ts`  
**Issue:** Gumroad webhook security is based only on checking `seller_id` (a static value). Gumroad does not provide HMAC signatures. If `GUMROAD_SELLER_ID` is not set, the webhook accepts all requests with a warning.  
**Recommendation:** Always set `GUMROAD_SELLER_ID` in production.

### 8c. `n8n` webhook is fire-and-forget with no delivery guarantee
**File:** `lib/n8n.ts:19`  
**Issue:** The n8n webhook call uses `AbortSignal.timeout(8_000)` and silently continues on failure. If n8n is unavailable at inquiry time, the notification is lost — there is no retry queue or fallback. The Resend email still fires, so admin receives the email alert regardless.

---

## 9. Orphan Pages (No Inbound Links Found in Code)

These pages exist but no other page in the codebase links to them via `<Link>` or `<a>`:

| Page | Notes |
|------|-------|
| `/maintenance` | Likely shown via middleware redirect — no middleware.ts found in scan |
| `/customers` | Listed in sitemap but no nav link found in Header |
| `/admin/analytics` | Listed in AdminNav (assumed) — need to verify |
| `/admin/waitlist` | Listed in AdminNav (assumed) — need to verify |
| `/admin/outreach` | Listed in AdminNav (assumed) — need to verify |
| `/admin/reseller` | Listed in AdminNav (assumed) — need to verify |

---

## 10. Missing middleware.ts

No `middleware.ts` was found in the project root. The `MAINTENANCE_MODE` env var is documented but not wired up. The admin route protection relies entirely on per-layout `redirect()` calls, not middleware. This means:
- Unauthenticated requests to admin API routes still reach `requireAdmin()` (correct)
- But there is no edge-level auth enforcement (not a security issue given `requireAdmin()` is always called)

---

## Summary of Action Items

| Priority | Issue | File |
|----------|-------|------|
| High | Bug: `daily_rate_eur` typo breaks fleet CSV export | `app/api/admin/export/[type]/route.ts:101` |
| Medium | Missing rate limit on `/api/cars/[slug]/availability` | `app/api/cars/[slug]/availability/route.ts` |
| Medium | Max rental days hardcoded (14) in manual booking route | `app/api/admin/bookings/manual/route.ts:40` |
| Medium | Admin email routing uses env var, ignores DB `business_email` | `lib/resend.ts`, `lib/config.ts` |
| Low | `revalidateTag` called with extra argument | `app/api/admin/settings/route.ts:88` |
| Low | Duplicate `shortDate()` function | `lib/email/templates.ts:16`, `lib/email/send.ts:21` |
| Low | Verify `no_overlap` DB constraint exists | Supabase migrations |
| Info | Twilio vars declared but not implemented | `.env.example` |
| Info | Apollo/Instantly vars declared but not implemented | `.env.example` |
