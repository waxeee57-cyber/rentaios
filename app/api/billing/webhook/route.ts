import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

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
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as import('stripe').Stripe.Invoice
      const subRef = invoice.parent?.subscription_details?.subscription
      const subId = subRef ? (typeof subRef === 'string' ? subRef : subRef.id) : null
      if (subId) {
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', subId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}

function resolvePlan(priceId: string | undefined): 'starter' | 'pro' | 'white_glove' {
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return 'starter'
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro'
  return 'starter'
}

function mapStatus(stripeStatus: string): 'active' | 'past_due' | 'cancelled' | 'trialing' {
  if (stripeStatus === 'trialing') return 'trialing'
  if (stripeStatus === 'past_due' || stripeStatus === 'unpaid') return 'past_due'
  if (stripeStatus === 'canceled' || stripeStatus === 'incomplete_expired') return 'cancelled'
  return 'active'
}
