# SMS Notifications Setup Guide

This guide walks through enabling the SMS Notifications add-on via Twilio.

## Prerequisites

- RentalOS Growth or Pro subscription
- A Twilio account (twilio.com)

## Step 1 — Create a Twilio account

1. Go to twilio.com and sign up for an account
2. Verify your phone number and email address
3. Complete identity verification (required for production use)

## Step 2 — Get a Twilio phone number

1. In the Twilio Console, go to Phone Numbers → Manage → Buy a number
2. Choose a number in your country or a toll-free number
3. Enable "SMS" capability on the number

## Step 3 — Get your credentials

From the Twilio Console dashboard:

- **Account SID**: shown on the dashboard homepage
- **Auth Token**: shown on the dashboard homepage (click to reveal)
- **Phone number**: your purchased Twilio number in E.164 format (e.g. +34600123456)

## Step 4 — Set environment variables

Add to your Vercel project (Settings → Environment Variables):

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+34600123456
```

Redeploy after adding the variables.

## Step 5 — Activate the add-on

In your RentalOS admin panel, go to Admin → Billing → Add-ons.
The SMS Notifications add-on should now show as "Available".
Click "Add to plan" to activate.

## What customers receive

- **Inquiry confirmation**: "Your booking request for [Vehicle] on [Date] has been received. We'll confirm within 24 hours."
- **Booking confirmed**: "Your [Vehicle] booking is confirmed for [Date]. Pickup at [Location]."
- **Pickup reminder**: Sent 24 hours before pickup.

Messages are sent from your Twilio number and appear as coming from your business.

## Estimated costs (Twilio pricing)

These are approximate rates. Check twilio.com/sms/pricing for current rates.

| Country | Cost per SMS |
|---------|-------------|
| Spain | €0.07 |
| UK | £0.04 |
| UAE | $0.09 |
| USA | $0.0079 |
| Germany | €0.09 |
| France | €0.07 |

At 100 bookings/month with 3 SMS per booking, expect approximately €20–30/month in Twilio charges
(plus the €19/month add-on fee).

## Testing

To test manually, use the Twilio Console → Messaging → Try it out → Send an SMS.

To test from your system, temporarily enable debug logging by setting `TWILIO_DEBUG=true`
in your environment variables and checking Vercel function logs.

## Troubleshooting

**Messages not sending:**
- Verify all three env vars are set correctly in Vercel
- Check that the phone number is in E.164 format (+country_code number)
- Review Twilio Console → Monitor → Logs → Messaging for error details

**Trial account limitations:**
Twilio trial accounts can only send to verified numbers. Upgrade to a paid account
before going live with customers.
