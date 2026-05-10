import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

type Plan = 'starter' | 'growth' | 'pro'
type Cadence = 'monthly' | 'annual'

const MONTHLY_PRICE_IDS: Record<Plan, string | undefined> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID,
  growth: process.env.STRIPE_GROWTH_PRICE_ID,
  pro: process.env.STRIPE_PRO_PRICE_ID,
}

const ANNUAL_PRICE_IDS: Record<Plan, string | undefined> = {
  starter: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID,
  growth: process.env.STRIPE_GROWTH_ANNUAL_PRICE_ID,
  pro: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
}

const VALID_PLANS: Plan[] = ['starter', 'growth', 'pro']

export async function POST(req: NextRequest) {
  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Billing not configured' }, { status: 400 })
  }

  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  let body: { plan?: unknown; cadence?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const plan = body.plan as Plan
  const cadence: Cadence = body.cadence === 'annual' ? 'annual' : 'monthly'

  if (!VALID_PLANS.includes(plan)) {
    return NextResponse.json({ error: `Invalid plan: ${plan}` }, { status: 400 })
  }

  const priceId = cadence === 'annual' ? ANNUAL_PRICE_IDS[plan] : MONTHLY_PRICE_IDS[plan]
  if (!priceId) {
    return NextResponse.json({ error: `No price ID configured for ${plan} ${cadence}` }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(STRIPE_SECRET_KEY)

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('id, stripe_customer_id')
    .single()

  let customerId = subscription?.stripe_customer_id ?? undefined

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: auth.user.email,
      metadata: { user_id: auth.user.id },
    })
    customerId = customer.id

    if (subscription?.id) {
      await supabaseAdmin
        .from('subscriptions')
        .update({ stripe_customer_id: customerId })
        .eq('id', subscription.id)
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
