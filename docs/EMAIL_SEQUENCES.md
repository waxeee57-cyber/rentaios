# Email Sequences Playbook

These sequences run automatically once configured in Resend Broadcasts or a tool like n8n.
No additional code changes required. Set up once, run forever.

---

## Sequence 1 — Trial onboarding

**Trigger:** New subscription where `status = 'trialing'`
Set up in Resend → Broadcasts → Trigger: Resend API event `customer.subscription.created` with status `trialing`.

### Day 0 — Immediate

**Subject:** Your RentalOS trial has started — here's what to do first

**Body:**
```
Hi {name},

Your 14-day trial has started. Here's what to do first:

1. Add your vehicles → Admin → Fleet → Add Vehicle
2. Take a test booking → visit your public site and submit an inquiry
3. Confirm it in the admin to see the full flow

Your trial runs until {trial_end_date}.

[Open your admin panel →] {admin_url}
```

### Day 3

**Subject:** Have you added your first vehicle?

**Body:**
```
Hi {name},

Quick check-in. If you haven't added your vehicles yet, here's the fastest way:

Admin → Fleet → Add Vehicle → fill in name, price, deposit → Save.

That's it. Your fleet is live.

[Open admin panel →] {admin_url}
```

### Day 10

**Subject:** 4 days left in your trial

**Body:**
```
Hi {name},

Your trial ends in 4 days. After that, you'll need a plan to keep taking bookings.

If you upgrade now, nothing changes — your data stays, your bookings continue,
your customers see no interruption.

[Choose a plan →] {pricing_url}

Or, if you'd rather own the code: the template is €299 one-time.
[Buy the template →] {sell_url}
```

### Day 14

**Subject:** Your trial ends today

**Body:**
```
Your trial ends today. Upgrade to keep everything running.

[Choose a plan →] {pricing_url}
```

---

## Sequence 2 — Done-for-you post-delivery

**Trigger:** Manual send when `deployment_checklist.credentials_sent = true` in `/admin/clients`.

### Delivery email (send manually)

**Subject:** Your {business_name} booking system is live

**Body:**
```
Hi {name},

Your system is live. Here's everything you need:

Admin panel: {admin_url}
Email: {admin_email}
Password: {temp_password} — change this on first login

What to do next:
1. Log in and change your password
2. Add your real vehicles (replace the sample data)
3. Share your booking page with a customer to test

Reply to this email if you have any questions.

The RentalOS Team
```

### Day 7 follow-up

**Subject:** How's your first week going?

**Body:**
```
Hi {name},

Just checking in. How's your first week with the system?

If you have any questions — about the admin panel, email setup, or anything else —
reply to this email and I'll get back to you within a few hours.

If you'd like a quick 15-minute call to walk through anything together,
just reply and we'll find a time.

The RentalOS Team
```

---

## Sequence 3 — Past-due payment

**Trigger:** Stripe webhook `customer.subscription.updated` with `status = 'past_due'`.
This updates the `subscriptions` table. Trigger the email sequence from that event.

### Day 1

**Subject:** Action needed — payment failed

**Body:**
```
Hi {name},

Your last payment didn't go through. Your account is still active, but you'll
need to update your payment method to avoid interruption.

[Update payment method →] {billing_portal_url}

If you have any questions, reply to this email.
```

### Day 5

**Subject:** Your account will be suspended in 2 days

**Body:**
```
Your account will be suspended on {suspension_date} if payment is not received.

[Update payment method now →] {billing_portal_url}
```

---

## Setup in Resend

1. Go to Resend → Broadcasts → Create sequence
2. Choose trigger: API event or Webhook
3. Add each email step with the delay specified above
4. Use template variables: `{name}`, `{trial_end_date}`, `{admin_url}`, `{pricing_url}`, `{sell_url}`
5. Set sender: your configured `RESEND_FROM_EMAIL` with `RESEND_FROM_NAME`

For Day 0 in trial onboarding, trigger via the Stripe webhook handler in
`/api/billing/webhook` when `customer.subscription.created` event fires.

---

## Testing

To test manually:
```bash
curl -X POST https://api.resend.com/broadcasts/send \
  -H "Authorization: Bearer {RESEND_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com", "sequence_id": "..."}'
```

Or trigger via Resend dashboard → Broadcasts → Send test.
