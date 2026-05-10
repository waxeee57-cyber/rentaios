# n8n Setup Guide for RentalOS

Automate lead nurturing, client monitoring, and churn detection without writing code.

---

## Account Setup

1. Sign up at [n8n.io](https://n8n.io) or self-host via Docker
2. In your n8n instance, go to **Settings → Community nodes** and install `n8n-nodes-supabase` if you want direct DB access (optional — the HTTP Request node works fine with Supabase REST API)
3. Add credentials:
   - **Supabase**: project URL + service role key
   - **Resend** (or SMTP): for sending emails outside the main app
   - **HTTP Header Auth**: `Authorization: Bearer {CRON_SECRET}` for triggering RentalOS cron endpoints

---

## Workflow 1 — Cold Email Campaign Monitor

Monitors outreach reply rates and alerts you when engagement drops.

**Trigger**: Schedule — every Monday 08:00

**Steps**:
1. HTTP Request → `GET {SITE_URL}/api/admin/outreach` with admin cookie or API key
2. Code node — calculate reply rate from response
3. IF node — reply rate < 5%
4. Send alert email: "Reply rate is {rate}% — consider updating your email template"

**Alternative**: Query Supabase directly
```
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status IN ('replied','converted')) as replied
FROM cold_email_leads
WHERE email_sent_at > NOW() - INTERVAL '30 days'
```

---

## Workflow 2 — Reply Detection & Auto Follow-up Pause

When a lead replies (status changes to `replied`), pause any pending follow-ups.

**Trigger**: Supabase Webhook or Schedule (poll every hour)

**Supabase webhook setup**:
1. In Supabase dashboard → Database → Webhooks → Create webhook
2. Table: `cold_email_leads`, Event: `UPDATE`
3. URL: your n8n webhook URL

**Steps**:
1. Webhook node — receives payload
2. IF node — `new.status === 'replied'` AND `old.status !== 'replied'`
3. Send Slack/email alert: "Lead replied: {company_name} ({email})"
4. Optional: Create task in Notion/Linear for follow-up

---

## Workflow 3 — Ad Performance Monitor

Track your marketing spend vs. sign-up rate.

**Trigger**: Schedule — every Sunday 20:00

**Steps**:
1. HTTP Request → Google Ads or Meta Ads API for weekly spend
2. Supabase query — count new signups this week:
   ```sql
   SELECT COUNT(*) FROM subscriptions WHERE created_at > NOW() - INTERVAL '7 days'
   ```
3. Code node — calculate cost per acquisition (CPA)
4. IF node — CPA > €150 (adjust threshold)
5. Email alert: "Weekly CPA: €{cpa} — {signups} signups for €{spend} spend"

---

## Workflow 4 — Done-for-You SLA Check

Alert if a client_lead has been in `in_progress` status for more than 3 days without an update.

**Trigger**: Schedule — daily 09:00

**Steps**:
1. Supabase query:
   ```sql
   SELECT id, business_name, contact_email, updated_at
   FROM client_leads
   WHERE status = 'in_progress'
     AND updated_at < NOW() - INTERVAL '3 days'
   ```
2. IF node — results.length > 0
3. Loop over stale leads
4. Send alert: "{business_name} setup has had no update in {days} days"

**Target**: Every done-for-you client should be live within 48 hours — use this to enforce that SLA.

---

## Workflow 5 — Churn Risk Detection

Flag subscribers showing signs of disengagement before they cancel.

**Trigger**: Schedule — every Monday 08:30

**Churn signals to query**:
```sql
-- Subscribers who haven't had a booking in 30 days
SELECT s.id, bc.business_name
FROM subscriptions s
JOIN business_config bc ON true
WHERE s.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.created_at > NOW() - INTERVAL '30 days'
  )
  AND s.created_at < NOW() - INTERVAL '14 days'
```

**Steps**:
1. Run query above
2. IF node — results not empty
3. Send internal alert: "{business_name} — no bookings in 30 days, churn risk"
4. Optional: Trigger a check-in email via `/api/admin/outreach` or Resend directly

---

## Workflow 6 — Weekly Business Report (Supplement)

Extends the built-in Monday report with additional metrics.

**Trigger**: Schedule — Monday 08:50 (after the built-in report at 09:00 CET)

**Supabase queries**:
```sql
-- New leads this week
SELECT COUNT(*) FROM cold_email_leads WHERE created_at > NOW() - INTERVAL '7 days';

-- Template sales this week  
SELECT COUNT(*), SUM(sale_price) FROM template_sales WHERE created_at > NOW() - INTERVAL '7 days';

-- Active subscriptions
SELECT COUNT(*), plan FROM subscriptions WHERE status = 'active' GROUP BY plan;
```

**Steps**:
1. Run all queries in parallel
2. Code node — format into HTML table
3. Send to admin email: "Weekly metrics supplement"

---

## Environment Variables Needed in n8n

Set these as n8n credentials or environment variables:

| Variable | Value | Used in |
|----------|-------|---------|
| `SUPABASE_URL` | `https://cgbthkoqncgvlgzetlum.supabase.co` | All Supabase nodes |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase dashboard → Settings → API | All Supabase nodes |
| `SITE_URL` | Your Vercel deployment URL | HTTP Request nodes |
| `CRON_SECRET` | Same value as in Vercel env | Triggering cron endpoints |
| `ADMIN_EMAIL` | Your admin email address | Alert email destinations |
| `RESEND_API_KEY` | From resend.com dashboard | Email sending nodes |

---

## Tips

- Use n8n's **Error Workflow** feature to catch failures and alert you via email
- Store workflow execution logs for at least 30 days (n8n cloud does this automatically)
- Test workflows with n8n's **Execute once** button before activating
- For Supabase REST API calls, use the URL format: `{SUPABASE_URL}/rest/v1/{table}` with header `apikey: {SERVICE_ROLE_KEY}` and `Authorization: Bearer {SERVICE_ROLE_KEY}`
