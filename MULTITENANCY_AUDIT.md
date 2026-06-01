# RentalOS — Multi-Tenancy & Onboarding Architecture Audit

**Date:** 2026-05-29
**Scope:** Read-only audit of the current state. No code was modified.
**Branch audited:** `feature/complete-sprint-tasks`
**Purpose:** Establish the *current* architecture before designing a scalable, secure, self-serve onboarding system.

---

## ⚠️ HIGHEST-RISK ISSUE (read first)

**Public anon key can read every chat conversation and message — including visitor names and emails — across the whole database.**

`supabase/migrations/14_chat.sql:34-35`:
```sql
CREATE POLICY "anon_select_conversations" ON chat_conversations FOR SELECT TO anon USING (true);
CREATE POLICY "anon_select_messages"      ON chat_messages      FOR SELECT TO anon USING (true);
```
- `chat_conversations` stores `visitor_name` and `visitor_email` (PII — `14_chat.sql:6-7`).
- The policy is `USING (true)` — **not** scoped by `session_id`. The in-code justification ("UUIDs are unguessable") does not hold: an `anon` caller does not need to guess any UUID. With the public `NEXT_PUBLIC_SUPABASE_ANON_KEY` (shipped in client JS), anyone can run `select * from chat_conversations` / `chat_messages` and exfiltrate **all** customers' chat PII and message bodies.
- Both tables are also added to the Realtime publication (`14_chat.sql:26-27`), so they can be live-streamed too.

This is a live data-leak in the current single-tenant deployment, and it becomes catastrophic the moment multiple businesses share one database. **Fix before any self-serve rollout.**

---

## 1. Tenancy Model

**There is NO tenant / organization / workspace concept in the schema.** This is critical and intentional: the product is architected as **one customer per deployment + one Supabase project**.

### Evidence
- **Core tables have no tenant column.** `cars`, `customers`, `bookings`, `admin_users` (`supabase/schema.sql:7-89`) — none has `tenant_id`, `org_id`, `workspace_id`, or any equivalent. Bookings link to `car_id` / `customer_id` only.
- **`business_config` is a hard singleton.** `supabase/migrations/03_business_config.sql:32`:
  ```sql
  CREATE UNIQUE INDEX business_config_singleton ON business_config ((true));
  ```
  A unique index on the constant `(true)` allows exactly **one row, ever**. The whole white-label identity (name, branding, policies, slug) is a single global row read by `getBusinessConfig()` (`lib/config.ts:79-94`) with no tenant key.
- **`subscriptions` is one row per installation.** `supabase/migrations/04_subscriptions.sql:14-15`:
  ```sql
  -- Default trial row (single-tenant: one subscription per installation)
  INSERT INTO subscriptions DEFAULT VALUES;
  ```
  The billing webhook fills *that one row* via `.is('stripe_subscription_id', null)` (`app/api/billing/webhook/route.ts:50`).
- **`CLAUDE.md`** states it plainly: *"Single-tenant per Vercel deployment (one business = one deploy)."*

### Classification
**Database-per-tenant, realised as deployment-per-tenant.** Each customer gets their own Supabase project + their own Vercel deployment. Within a single database there is no multi-tenancy at all — and no mechanism (column, schema, or policy) that would isolate two tenants if they were ever placed in the same database.

> Note: `agency_clients` (`09_agency.sql`) and `client_leads` (`05_client_leads.sql`) look tenant-ish but are **CRM/pipeline records about prospective customers**, not a runtime tenancy mechanism. They do not scope `cars`/`bookings`/`customers` data.

---

## 2. Data Isolation & Security

### 2a. RLS coverage

RLS is enabled broadly, but the **security model is "service role bypasses RLS for everything."** All privileged reads/writes go through API routes using the service-role client; the `anon` client is used only for a few public reads. Because there is no tenant column, RLS today provides *defense against the public anon key*, **not** tenant isolation.

| Table | RLS enabled? | Source | Notes |
|---|---|---|---|
| cars | ✅ | policies.sql:6 | anon SELECT where `status != 'hidden'` |
| bookings | ✅ | policies.sql:7 | no anon policy → service-role only |
| customers | ✅ | policies.sql:8 | no anon policy → service-role only |
| admin_users | ✅ | policies.sql:9 | anon/self SELECT `auth.uid() = id` |
| client_leads | ✅ | 05_client_leads.sql:44 | |
| vehicle_documents | ✅ | 12_documents.sql:20 | |
| customer_documents | ✅ | 12_documents.sql:42 | |
| booking_documents | ✅ | 12_documents.sql:61 | |
| agency_clients | ✅ | 09_agency.sql:15 | |
| subscription_addons | ✅ | 08_addons.sql:14 | |
| waitlist | ✅ | 10_waitlist.sql:15 | |
| page_events | ✅ | 11_growth_schema.sql:72 | insert-only policy |
| cold_email_leads | ✅ | 13_automation.sql:31 | |
| template_sales | ✅ | 13_automation.sql:45 | |
| leads | ✅ | 15_leads.sql:14 | |
| chat_conversations | ✅ (but permissive) | 14_chat.sql:30,34 | **anon SELECT `USING (true)` — see top issue** |
| chat_messages | ✅ (but permissive) | 14_chat.sql:31,35 | **anon SELECT `USING (true)` — see top issue** |
| **business_config** | ❌ **NO RLS** | 03_business_config.sql | No `ENABLE ROW LEVEL SECURITY`. Mitigated only by it being read via service role; relies on anon key never querying it directly. |
| **subscriptions** | ❌ **NO RLS** | 04_subscriptions.sql | No RLS. Holds Stripe customer/subscription IDs + billing state. |
| **referrals** | ❌ **NO RLS** | 06_referrals.sql | No RLS. Holds referrer/referee emails. |

**Flagged data-leak risks:**
1. `chat_conversations` / `chat_messages` — permissive `USING (true)` anon read of PII (highest risk, see top).
2. `business_config`, `subscriptions`, `referrals` — **RLS not enabled at all.** Today they happen to be reached only via the service-role client, so the public anon key has no policy granting access — but RLS-disabled tables are one stray anon query (or one future multi-tenant change) away from full exposure. They should have explicit deny-by-default RLS.

### 2b. How the current "tenant" / request identity is determined

There is **no tenant resolution** — there is only *admin authentication*, because the deployment *is* the tenant.

- **No subdomain / header / JWT-claim tenant routing.** `proxy.ts` (the renamed Next middleware, `proxy.ts:4-22`) only handles `MAINTENANCE_MODE`; it does no tenant or auth logic.
- **Business identity** comes from environment variables (`NEXT_PUBLIC_BUSINESS_NAME`, `NEXT_PUBLIC_SITE_URL`, phone/whatsapp — see `ENV.md:16-25`) plus the singleton `business_config` row.
- **Admin auth** = Supabase Auth session cookie → `getAuthUser()` (`lib/supabase-server.ts:51-56`, validated with `getUser()`), then a membership check against `admin_users`:
  - Admin layout: `app/(admin)/admin/(protected)/layout.tsx:12-17`
  - API routes: `requireAdmin()` in `lib/auth.ts:14-19`

> **Schema drift flagged:** both the layout (`layout.tsx:15`) and `requireAdmin` (`lib/auth.ts:16`) query `admin_users` with `.eq('user_id', user.id)`, and `requireAdmin` selects `id, email` (`lib/auth.ts:15`). But the committed schema defines `admin_users (id, role, full_name, created_at)` with `id` = the auth user id and **no `user_id` and no `email` column** (`schema.sql:84-89`), and `admin-seed.sql` inserts `(id, full_name)`. A database built solely from the committed migrations would have **broken admin auth** (query on a non-existent column). The live DB must have these columns added out-of-band. This is a provisioning landmine for any new deployment built from the repo.

### 2c. lib/supabase.ts dual-export pattern — **NOT present (good)**

The known past vulnerability (anon + service-role exported from one importable file) **has been remediated.** The clients are split into three files:
- `lib/supabase.ts` — anon client only (`lib/supabase.ts:21`), safe for client/shared import.
- `lib/supabase-admin.ts` — service-role client, guarded by `import 'server-only'` at the top (`lib/supabase-admin.ts:1`), so importing it from a client component is a build error.
- `lib/supabase-server.ts` — SSR anon client (cookie-bound), no service-role key.

This matches recent commit `ce30e0f` ("separate supabaseAdmin into server-only guarded lib/supabase-admin.ts"). I found **no path where the service-role key or admin client can reach client-side code.** The service-role key is only ever read server-side (`SUPABASE_SERVICE_ROLE_KEY`, not `NEXT_PUBLIC_`).

### 2d. Database-layer vs application-layer isolation

For the **current** single-tenant model, isolation between *businesses* is at the **infrastructure layer** (separate Supabase project per customer) — strong, by construction.

Within a database, privileged access relies on **application code using the service role** (which bypasses RLS) rather than RLS scoping. There is no tenant `WHERE` clause anywhere because there is no tenant. **This is the core structural risk for going multi-tenant:** if you ever consolidate customers into a shared database to enable self-serve, *nothing* in the schema or queries scopes data by tenant. Service-role queries with no tenant filter would return every customer's rows. RLS could not save you either, because there is no tenant column for a policy to key on.

---

## 3. Onboarding Flow

### What actually happens when a "new customer signs up" today

**There is no self-serve signup. No account, tenant, database, or deployment is created by any code path.** The only customer-facing intake is a lead form.

1. Prospect fills the 6-step form at `/onboarding` (`app/(landing)/onboarding/OnboardingForm.tsx`).
2. `POST /api/onboarding/submit` (`app/api/onboarding/submit/route.ts:56-90`) validates with Zod, **inserts one row into `client_leads` with `status: 'new'`**, and fires notification emails to the admin. That is the entire automated effect.
3. Separately, `/pricing` → `POST /api/billing/create-checkout` (`app/api/billing/create-checkout/route.ts`) opens a Stripe Checkout subscription session. It carries **no account, no tenant reference, no `client_reference_id`, no metadata** linking the payment to a provisioned customer. On success it redirects to `/admin?checkout=success` — i.e., it assumes the admin/tenant *already exists*.

### Manual steps required to onboard a new customer (the pain point)

Provisioning is essentially 100% manual. To stand up a new customer today you must:

1. Read the new `client_leads` row (Monday pipeline review per `CLAUDE.md`).
2. Create a **new Supabase project** for the customer.
3. Run `supabase/schema.sql` + **all** migrations `02`–`15` against it.
4. Run `supabase/policies.sql`.
5. Create storage buckets `car-photos` and `documents` **and** their storage policies — these are only **commented instructions** in `policies.sql:43-50`, not executed.
6. Create the admin's auth user by hand in the Supabase dashboard (`admin-seed.sql:1-3` instructs this).
7. Run `admin-seed.sql` with that email to grant admin — **and** reconcile the `admin_users` `user_id`/`email` schema drift noted in §2b, or admin login will be broken.
8. Populate the `business_config` singleton (branding, location, policies, slug) via `/admin/settings` or SQL.
9. Seed cars / sample data (separate `seed.sql` / `demo-seed.sql`).
10. Create a **new Vercel project/deployment** for the customer.
11. Set ~12+ environment variables in Vercel (Supabase URL / anon / **service-role** key, site URL, business name/phone/whatsapp, Resend key, n8n webhook + secret, admin email, health secret, plus Stripe secret + webhook secret + 6 price IDs — see `ENV.md` and `create-checkout/route.ts:31-38`).
12. Configure Stripe products/prices and register the webhook endpoint + secret.
13. Point the customer's domain / DNS.
14. Only then can the customer subscribe via `/pricing`; the webhook fills the pre-seeded single `subscriptions` row.

### Billing wired into signup?

**No.** Stripe checkout is decoupled from provisioning. Creating an account does **not** create a Stripe customer; paying does **not** create a tenant or admin. The webhook (`app/api/billing/webhook/route.ts:39-50`) updates the single global subscription row by matching the first row with a null `stripe_subscription_id` — a pattern that only works because there is exactly one tenant per database.

### Seed / config data automation

Partially automated *within a fresh DB*, but only if migrations are run manually:
- `business_config` default row — inserted by migration (`03_business_config.sql:48`).
- `subscriptions` trial row — inserted by migration (`04_subscriptions.sql:15`).
- Admin user — **manual** (`admin-seed.sql`).
- Cars / sample data — **manual** seed scripts.
- Storage buckets/policies — **manual** (commented only).
There is **no roles system** beyond a single `admin_users.role` text field defaulting to `'admin'`.

---

## 4. Deployment Model

**One isolated stack per customer: one Vercel deployment + one Supabase project.** Nothing is shared across customers at runtime.

### Evidence
- `CLAUDE.md`: *"Single-tenant per Vercel deployment (one business = one deploy)."*
- Business identity is injected via **per-deployment env vars** (`NEXT_PUBLIC_BUSINESS_NAME`, `NEXT_PUBLIC_SITE_URL`, etc. — `ENV.md:16-25`; defaults in `lib/config.ts:40-77`). Supabase URL / keys are also per-deployment env vars — i.e., a different Supabase project per customer.
- Singleton `business_config` and single `subscriptions` row only make sense one-business-per-DB.
- `vercel.json:1-28` defines six crons (weekly-report, reset-demo, review-emails, document-expiry, cold-email-followup, dunning) — these run **per deployment**, reinforcing one-deploy-per-customer.
- Reference deployment: `https://costasol.vercel.app` (CostaSol Car Rent), per `CLAUDE.md`.

---

## 5. Prioritized Gaps & Risks for a Secure, Self-Serve, Multi-Tenant SaaS

### P0 — Security (fix regardless of multi-tenancy direction)
1. **Permissive chat RLS leaks PII** (`14_chat.sql:34-35`). `anon` can read all conversations/messages via the public key. Scope by `session_id` or remove anon SELECT entirely (route reads through the service role). *Highest current risk.*
2. **RLS disabled on `business_config`, `subscriptions`, `referrals`.** Enable RLS with deny-by-default (no anon policy). Currently safe only by convention.
3. **`admin_users` schema drift** (`lib/auth.ts:15-16`, `layout.tsx:15` vs `schema.sql:84-89`). Code expects `user_id` and `email` columns the migrations don't create. A fresh deployment from the repo has broken admin auth. Reconcile the migration with the code before any automated provisioning — self-serve provisioning that runs these migrations will produce locked-out admins.

### P0 — Blocking for self-serve (the onboarding pain point)
4. **No self-serve signup whatsoever.** `/onboarding` only writes a `client_leads` row + emails you. Every one of the ~14 provisioning steps in §3 is manual. This is the single biggest scalability blocker.
5. **Billing is disconnected from provisioning.** Checkout creates no tenant, no Stripe-customer↔account link, no `client_reference_id`/metadata. A self-serve flow needs: signup → create tenant → create Stripe customer → subscription → automated seed, as one transaction.
6. **Provisioning is infrastructure-heavy (new Supabase project + new Vercel deploy per customer).** Deployment-per-tenant cannot scale to self-serve without either (a) full automation (Terraform/Supabase Management API + Vercel API + automated migrations + env injection + DNS), or (b) a shift to shared multi-tenancy. Decide this first — it dictates everything else.

### P1 — Architectural (required if consolidating into shared multi-tenancy)
7. **No tenant concept in the schema.** No `tenant_id`/`org_id` on `cars`, `bookings`, `customers`, or any operational table. Shared multi-tenancy requires adding a tenant key to every tenant-scoped table + backfill + composite indexes/uniqueness (e.g. `cars.slug`, `cars.license_plate`, `customers.email`, `bookings.booking_code` are globally unique today and would need to become per-tenant).
8. **No database-layer tenant isolation.** Privileged access relies on the service role bypassing RLS with no tenant `WHERE` clause. In a shared DB this returns all tenants' data. Need RLS policies keyed on a tenant claim (e.g. JWT `app_metadata.tenant_id` / `auth.jwt()`), and the service role usage audited so it always filters by tenant.
9. **No tenant resolution per request.** No subdomain/header/JWT-claim routing exists (`proxy.ts` does maintenance only). Shared multi-tenancy needs a tenant-resolution layer in middleware + a tenant-aware Supabase client.
10. **Singletons block multi-tenancy.** `business_config` singleton index (`03:32`) and the single `subscriptions` row + webhook `.is(... null)` matching (`webhook:50`) must become per-tenant rows keyed by tenant + Stripe customer/subscription id.
11. **`no_overlap` exclusion constraint is global** (`schema.sql:75-79`). In a shared DB it must include `tenant_id` (or it's naturally per-tenant via the `car_id` FK, but verify) to avoid cross-tenant booking conflicts.

### P2 — Operational
12. **No roles/permissions model** beyond a single `admin_users.role` text field. Multi-tenant + team seats will need real RBAC.
13. **Storage bucket policies are manual/commented** (`policies.sql:43-50`) and documents are PII — ensure private buckets + signed URLs are provisioned automatically and scoped per tenant.
14. **Per-deployment crons** (`vercel.json`) become per-tenant background jobs in a shared model — needs a tenant-iterating scheduler.

---

## Summary

| Dimension | Current state |
|---|---|
| **Tenancy model** | None in schema. One business = one database = one deployment. |
| **Isolation method** | Infrastructure-level (separate Supabase project per customer). No tenant column, no DB-layer tenant RLS. Privileged access = service-role bypass. |
| **Tenant resolution** | None. Identity = env vars + singleton `business_config`; auth = Supabase session + `admin_users` membership. |
| **Service-role exposure** | Remediated — split clients, `server-only` guard on `supabase-admin.ts`. No leak found. |
| **Onboarding** | Lead form → `client_leads` row + email. ~14 manual provisioning steps. No account/tenant/Stripe-customer created automatically. |
| **Billing↔signup** | Decoupled. Checkout assumes tenant already exists; fills one global subscription row. |
| **Deployment** | One Vercel deploy + one Supabase project per customer. |
| **Top security issue** | `anon`-readable chat PII via `USING (true)` RLS (`14_chat.sql:34-35`). |

**Strategic takeaway:** The codebase is a well-built *single-tenant* app, not a multi-tenant SaaS. Going self-serve requires an explicit fork in the road — **(A)** fully automate the deployment-per-tenant pipeline, or **(B)** re-architect into shared multi-tenancy (add `tenant_id` everywhere + tenant-scoped RLS + tenant resolution). Either way, fix the P0 security items first, since the chat-PII leak and RLS-disabled tables are live today and become far worse under any shared model.
