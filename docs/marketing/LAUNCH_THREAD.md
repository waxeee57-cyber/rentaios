# X/Twitter Launch Thread

Post as a single thread. Each tweet is numbered. Keep each under 280 characters.
Replace [GUMROAD_LINK] with your actual Gumroad product URL before posting.

---

**Tweet 1 — Hook**

I spent 6 weeks building a luxury car rental booking system for a real business in Marbella.

Booking logic, admin panel, email notifications, mobile-first ops — the whole thing.

Here's what I actually learned. 🧵

---

**Tweet 2 — The real problem**

The hard part wasn't the customer-facing site.

It was the admin panel.

The person managing bookings is standing in a car park, on a phone, in 35-degree heat, trying to confirm a reservation in 30 seconds.

That changed every design decision I made.

---

**Tweet 3 — Database first**

I almost shipped with application-level overlap checking.

Then I found btree_gist. Postgres exclusion constraints can enforce that no two confirmed bookings share the same car + overlapping dates — at the DB level.

No race conditions. No double-bookings. It just works.

---

**Tweet 4 — The booking flow**

Inquiry → Admin confirmation → Pickup → Return → Complete

That's 5 states. Each has different actions, different emails, different UI.

I spent more time on state transitions than anything else. Get this wrong and the whole product breaks down.

---

**Tweet 5 — Resend over everything**

I tried 3 email services. Resend won because:
- API that actually makes sense
- React Email for templates (but I ended up using raw HTML for control)
- Generous free tier

Zero deliverability issues in production.

---

**Tweet 6 — What I got wrong**

I built the customer-facing fleet page first. Spent 2 weeks on it.

The client barely cared.

They cared about: Can I see all today's pickups at a glance? Can I upload a photo of the driving licence at pickup? Can I add a note to a booking from my phone?

Build the admin panel first.

---

**Tweet 7 — Rate limiting**

Got scraped twice during development. Once by a competitor, once by a bot testing for SQL injection.

Added sliding window rate limiting (IP-based) to all public API routes. 10 minutes to implement. Saved the project twice.

---

**Tweet 8 — The SEO thing**

JSON-LD structured data for LocalBusiness and FAQPage.

Dynamic sitemap at /sitemap.xml.

Not exciting. But it's what gets the site to rank for "luxury car rental [city]" without paid ads.

Takes 4 hours to set up. Keeps paying for years.

---

**Tweet 9 — The product**

I turned this into a template.

Full Next.js 15 + Supabase codebase. Admin panel included. Email system included. Booking logic included.

Deploy it in a day. MIT license, use it however you want.

→ [GUMROAD_LINK]

€299 — or I'll set it up for you for €499.

---

**Tweet 10 — Follow**

I'm building this in public.

Next: SaaS subscriptions, white-label config, AI-assisted booking summaries.

Follow if you want to see how a solo dev turns a client project into a product.

---

**Posting tips:**
- Post Tweet 1 first, then reply to it with each subsequent tweet
- Schedule for Tuesday–Thursday, 9–11am GMT or 6–9pm GMT (peak engagement)
- Pin Tweet 1 after the thread is live
- Reply to every comment in the first 2 hours (algorithm boost)
