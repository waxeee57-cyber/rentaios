import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

const PRICE_IDS: Record<string, string | undefined> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID,
  pro: process.env.STRIPE_PRO_PRICE_ID,
}

export async function POST(req: NextRequest) {
  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Billing not configured' }, { status: 400 })
  }

  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { plan } = await req.json() as { plan: 'starter' | 'pro' }
  const priceId = PRICE_IDS[plan]
  if (!priceId) {
    return NextResponse.json({ error: `No price ID configured for plan: ${plan}` }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(STRIPE_SECRET_KEY)

  // Look up existing customer
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id')
    .single()

  let customerId = subscription?.stripe_customer_id ?? undefined

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: auth.user.email,
      metadata: { user_id: auth.user.id },
    })
    customerId = customer.id

    await supabaseAdmin
      .from('subscriptions')
      .update({ stripe_customer_id: customerId })
      .eq('stripe_customer_id' as string, customerId)
      .is('stripe_customer_id', null)

    // Upsert approach: find the row and update it
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .single()

    if (sub?.id) {
      await supabaseAdmin
        .from('subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('id', sub.id)
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/admin/billing?success=true`,
    cancel_url: `${siteUrl}/admin/billing`,
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: session.url })
}
