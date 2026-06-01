import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendEmail, ADMIN_EMAIL } from '@/lib/resend'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'

export async function POST(req: NextRequest) {
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ received: true })
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(STRIPE_SECRET_KEY)

  let event: import('stripe').Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Idempotency: Stripe redelivers events (at-least-once). Record the event id
  // before doing any side-effect (DB write, email). A duplicate delivery hits
  // the primary-key conflict and short-circuits, so emails never double-send.
  // Degrades gracefully if migration 19 (stripe_events) has not been applied:
  // an undefined_table error (42P01) just means "no dedup yet", so we proceed.
  const { error: ledgerErr } = await supabaseAdmin
    .from('stripe_events')
    .insert({ event_id: event.id, type: event.type })
  if (ledgerErr) {
    if (ledgerErr.code === '23505') {
      return NextResponse.json({ received: true, duplicate: true })
    }
    if (ledgerErr.code !== '42P01') {
      console.error('[billing/webhook] event ledger insert failed', ledgerErr.code)
    }
    // 42P01 (table missing pre-migration-19): proceed without dedup.
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as import('stripe').Stripe.Checkout.Session
      if (session.mode !== 'subscription') break
      const stripeSubscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      )
      const plan = resolvePlan(stripeSubscription.items.data[0]?.price?.id)
      await supabaseAdmin
        .from('subscriptions')
        .update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: stripeSubscription.id,
          plan,
          status: stripeSubscription.status === 'trialing' ? 'trialing' : 'active',
          current_period_end: stripeSubscription.items.data[0]?.current_period_end
            ? new Date(stripeSubscription.items.data[0].current_period_end * 1000).toISOString()
            : null,
        })
        .is('stripe_subscription_id', null)

      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `New subscriber — ${plan} plan`,
        html: `<p>A new subscription has started: <strong>${plan}</strong>.<br>Customer: ${session.customer_email ?? session.customer}</p>`,
      })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as import('stripe').Stripe.Subscription
      const plan = resolvePlan(sub.items.data[0]?.price?.id)
      const status = mapStatus(sub.status)
      await supabaseAdmin
        .from('subscriptions')
        .update({
          plan,
          status,
          current_period_end: sub.items.data[0]?.current_period_end
            ? new Date(sub.items.data[0].current_period_end * 1000).toISOString()
            : null,
        })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as import('stripe').Stripe.Subscription
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('stripe_subscription_id', sub.id)

      await sendEmail({
        to: ADMIN_EMAIL,
        subject: 'Your RentalOS subscription has been cancelled',
        html: `
          <p>Your RentalOS subscription has been cancelled.</p>
          <p>Your data will be kept for 30 days. You can reactivate anytime.</p>
          <p><a href="${SITE_URL}/pricing">Reactivate your account →</a></p>
          <p style="color:#888; font-size:12px; margin-top:24px;">
            Why did you cancel? Reply with a number:<br>
            1. Too expensive<br>
            2. Didn't use it enough<br>
            3. Missing a feature<br>
            4. Switching to another tool
          </p>
        `,
      })
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as import('stripe').Stripe.Invoice
      const subRef = invoice.parent?.subscription_details?.subscription
      const subId = subRef ? (typeof subRef === 'string' ? subRef : subRef.id) : null
      if (subId) {
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'past_due', past_due_since: new Date().toISOString() })
          .eq('stripe_subscription_id', subId)
      }
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as import('stripe').Stripe.Invoice
      const subRef = invoice.parent?.subscription_details?.subscription
      const subId = subRef ? (typeof subRef === 'string' ? subRef : subRef.id) : null
      if (!subId) break

      // Fetch subscription to get new period end
      const stripeSub = await stripe.subscriptions.retrieve(subId)
      const periodEnd = stripeSub.items.data[0]?.current_period_end
        ? new Date(stripeSub.items.data[0].current_period_end * 1000).toISOString()
        : null

      // Update subscription and reset dunning state
      await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_end: periodEnd,
          access_locked: false,
          past_due_since: null,
          dunning_email_1_sent: false,
          dunning_email_2_sent: false,
          dunning_email_3_sent: false,
        })
        .eq('stripe_subscription_id', subId)

      // Send receipt
      const amountFormatted = invoice.amount_paid
        ? `€${(invoice.amount_paid / 100).toFixed(2)}`
        : ''
      const invoiceUrl = invoice.hosted_invoice_url

      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `Your RentalOS receipt${amountFormatted ? ` — ${amountFormatted}` : ''}`,
        html: `
          <p>Thank you — your payment has been processed.</p>
          ${amountFormatted ? `<p>Amount: <strong>${amountFormatted}</strong></p>` : ''}
          ${invoiceUrl ? `<p><a href="${invoiceUrl}">View invoice →</a></p>` : ''}
        `,
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}

function resolvePlan(priceId: string | undefined): 'starter' | 'growth' | 'pro' | 'white_glove' {
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return 'starter'
  if (priceId === process.env.STRIPE_STARTER_ANNUAL_PRICE_ID) return 'starter'
  if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) return 'growth'
  if (priceId === process.env.STRIPE_GROWTH_ANNUAL_PRICE_ID) return 'growth'
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro'
  if (priceId === process.env.STRIPE_PRO_ANNUAL_PRICE_ID) return 'pro'
  return 'starter'
}

function mapStatus(stripeStatus: string): 'active' | 'past_due' | 'cancelled' | 'trialing' {
  if (stripeStatus === 'trialing') return 'trialing'
  if (stripeStatus === 'past_due' || stripeStatus === 'unpaid') return 'past_due'
  if (stripeStatus === 'canceled' || stripeStatus === 'incomplete_expired') return 'cancelled'
  return 'active'
}
