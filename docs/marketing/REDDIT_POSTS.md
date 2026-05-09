# Reddit Launch Posts

Replace [GUMROAD_LINK] before posting. Each post is written to lead with genuine value.
Do not post all four on the same day — space them 2–3 days apart.

---

## r/indiehackers

**Title:** I built a luxury car rental booking system for a client in Marbella, then turned it into a product. Here's what happened.

**Body:**

Six weeks ago I finished a custom booking system for a luxury car rental company on the Costa del Sol. Full Next.js 15 app, Supabase backend, mobile-first admin panel, email notifications, the whole thing.

The client is happy. The system is live. And I realized I'd just spent six weeks building something that every other small luxury rental company needs — and none of them have.

**The actual problem I was solving**

They were managing their entire business through WhatsApp. Inquiries came in, got lost in chat. Deposits were tracked in a Notes app. No one knew which car was booked on which dates without scrolling through 200 messages.

The booking system solved all of that. But what surprised me was what mattered most to the client: not the public-facing site (which looks great), but the admin panel. Specifically: can I see all today's pickups in one view? Can I upload a photo of the driving licence from my phone at the pickup? Can I add notes to a booking from the car park?

That's the product. The slick customer website is marketing. The admin panel is the actual value.

**Why I turned it into a template**

After finishing the project I looked at how many car rental companies, yacht charter operators, villa agencies, and motorcycle rental businesses are running on nothing. WhatsApp groups. Spreadsheets. Email chains.

They all need the same system. Different branding, same flows.

So I cleaned up the code, wrote documentation, and listed it.

**What's in it**

- Next.js 15 App Router + TypeScript
- Supabase (auth, database, storage)
- Full booking lifecycle (inquiry → confirm → pickup → return)
- Mobile-first admin panel
- 5 email templates (Resend)
- Overlap prevention enforced at DB level (btree_gist exclusion constraint)
- Rate limiting, SEO, Vercel deploy config
- MIT license

**Revenue so far:** I listed it 3 days ago. [Will update this post with numbers as they come in.]

If you're building something for a niche and wondering whether to productize it — the answer is usually yes. The second client always wants the same thing the first one paid for.

Template is here if you want to look: [GUMROAD_LINK]

Happy to answer questions about the build, the tech decisions, or the productization process.

---

## r/nextjs

**Title:** How I handled booking overlap prevention in a Next.js 15 + Supabase car rental system

**Body:**

I recently shipped a luxury car rental booking system built on Next.js 15 and Supabase. The hardest technical problem was preventing double-bookings — here's how I solved it properly.

**The naive approach (wrong)**

Application-level checking: before confirming a booking, query the database for overlapping bookings and throw an error if any exist.

The problem: race conditions. Two admins confirm two bookings simultaneously, both checks pass, both confirmations go through, same car booked twice.

**The right approach: btree_gist exclusion constraints**

Postgres has an extension called `btree_gist` that lets you create exclusion constraints across multiple columns, including ranges. Here's the constraint I use:

```sql
ALTER TABLE bookings
ADD CONSTRAINT no_overlap
EXCLUDE USING gist (
  car_id WITH =,
  tstzrange(start_at, end_at, '[)') WITH &&
)
WHERE (status IN ('confirmed', 'picked_up', 'returned'));
```

This makes it structurally impossible for the database to have two confirmed bookings for the same car on overlapping dates. Not "very unlikely" — impossible. The constraint fires at the DB level, so even with concurrent requests, one will win and one will get a constraint violation error.

The API catches that error and returns a 409 to the admin panel.

Note: `inquiry` status is excluded from the constraint. Multiple inquiries can exist for the same dates — the first one to get confirmed wins.

**Tech stack**

- Next.js 15 App Router (no Pages Router)
- Supabase (Postgres + Auth + Storage)
- TypeScript throughout
- Resend for transactional email
- Tailwind CSS v4 (CSS variable-based theme system)
- Vercel deployment

**Other interesting decisions**

The admin panel is a mobile-first design because the person running the business uses it on their phone at pickup locations. Every tap target is ≥44px. Every action that matters has one-tap access from the bookings list.

Rate limiting on all public API routes using a sliding window algorithm (IP-based). Not optional — got scraped twice during development.

I turned this into a template if anyone wants to look at the full implementation: [GUMROAD_LINK]

Happy to dig into any specific technical questions.

---

## r/webdev

**Title:** Architecture of a luxury rental booking system — here's what I'd do differently

**Body:**

I just finished building a full booking system for a luxury car rental company. Sharing the architecture decisions — including the ones I'd change.

**What the system does**

Customer browses a fleet of vehicles → submits an inquiry with dates and location → admin receives an alert → admin confirms or declines → if confirmed, customer gets a confirmation email → on pickup day, admin uploads documents (driving licence, passport) from their phone → marks as picked up → on return, admin inspects vehicle, adds notes → marks as returned → closes the booking.

No online payment. Payment collected at pickup. Simple model, but the booking lifecycle still has 6 status states and ~20 API routes.

**Database schema (simplified)**

```sql
-- Core tables
cars        -- fleet inventory, pricing, photos
customers   -- contact info (created on first inquiry)
bookings    -- the main table, status FSM
admin_users -- Supabase auth, managed separately

-- Key constraint
EXCLUDE USING gist (
  car_id WITH =,
  tstzrange(start_at, end_at, '[)') WITH &&
) WHERE (status IN ('confirmed', 'picked_up', 'returned'))
```

The exclusion constraint is the most important piece. It makes double-bookings impossible at the database level rather than relying on application checks.

**API structure**

All admin routes are under `/api/admin/` and require auth. Public routes are rate-limited. Booking status transitions each have their own route (`/api/admin/bookings/[id]/confirm`, `/api/admin/bookings/[id]/picked-up`, etc.) rather than a generic PATCH — this makes the intent explicit and makes it easier to add per-transition logic (emails, webhooks).

**What I'd do differently**

1. **Optimistic UI in the admin panel.** Right now every status transition waits for the API. Fine for desktop, frustrating on mobile on a patchy network. I'd add optimistic updates with rollback on error.

2. **Webhook-first design from the start.** Email sending and n8n notifications are tightly coupled to the API routes. Should have been events from day one.

3. **Typed status FSM.** The booking status transitions are enforced by the API but not by types. A proper state machine type would catch invalid transitions at compile time.

**Tech**

Next.js 15, Supabase, TypeScript, Tailwind v4, Resend, Vercel.

Turned the whole thing into a reusable template: [GUMROAD_LINK]

---

## r/digitalnomad

**Title:** Built a booking system for a car rental in Marbella while traveling. Now selling it.

**Body:**

About eight weeks ago I picked up a freelance project: build a custom booking system for a luxury car rental company on the Costa del Sol.

I was in Barcelona at the time. Did most of the work from cafés in the Gothic Quarter and a coworking space in El Born. Client was in Marbella, 800km away. We never met in person until delivery.

**How the project worked remotely**

The client was a car rental owner who managed everything through WhatsApp. He knew exactly what he wanted operationally — he just had no way to articulate it technically.

What worked: I'd ship a working prototype of each feature, screen-record a 2-minute walkthrough, send it over WhatsApp. He'd respond with voice notes. That was our entire design process. It's slow to type on a phone, but voice notes are fast — and he gave better feedback that way than in any Zoom call I've done.

What I learned: the client who says "make it simple" means "make it fast on my phone." Not fewer features. Faster interactions. Every tap in the admin panel had to feel instant because he's using it standing outside in 35-degree heat with one hand.

**The product**

The system is live. Inquiries come in through the website, he confirms them from his phone, and the booking system handles the rest. He uploads photos of driving licences at pickup directly into the admin panel.

After finishing I realised I'd built something that applies to dozens of industries — car rental, yacht charter, villa rental, motorcycle hire. They're all running on the same combination of WhatsApp and spreadsheets.

So I cleaned it up and listed it as a template: [GUMROAD_LINK]

Next.js 15, Supabase, full admin panel, email system. MIT license — build on it, resell it, whatever.

**On remote client work**

The timezone for Marbella is CET, same as Barcelona, same as most of Europe. If you're doing freelance as a digital nomad, European clients + European timezones is a much smoother experience than US clients when you're in Asia or South America.

Happy to answer questions about the project, the tech, or the remote work setup.
