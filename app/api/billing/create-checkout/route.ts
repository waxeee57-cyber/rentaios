import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!rateLimit(`checkout:${ip}`, 30, 3_600_000)) {
    return NextResponse.json({ error: 'Too many requests. Try again shortly.' }, { status: 429 })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim()
  if (!stripeKey) {
    return NextResponse.json({ error: 'Payment system is not configured yet.' }, { status: 503 })
  }
  if (!/^sk_(test|live)_/.test(stripeKey)) {
    console.error('[checkout] Invalid STRIPE_SECRET_KEY format')
    return NextResponse.json({ error: 'Payment configuration error. Contact support.' }, { status: 503 })
  }

  let body: { priceId?: unknown; plan?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Resolve priceId — accept explicit priceId or short plan name
  let cleanPriceId: string

  if (typeof body.priceId === 'string') {
    cleanPriceId = body.priceId.trim()
    const validPriceIds = [
      process.env.STRIPE_STARTER_PRICE_ID,
      process.env.STRIPE_GROWTH_PRICE_ID,
      process.env.STRIPE_PRO_PRICE_ID,
      process.env.STRIPE_STARTER_ANNUAL_PRICE_ID,
      process.env.STRIPE_GROWTH_ANNUAL_PRICE_ID,
      process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
    ].filter((id): id is string => typeof id === 'string').map((id) => id.trim())
    if (!validPriceIds.includes(cleanPriceId)) {
      return NextResponse.json({ error: 'Invalid plan selected.' }, { status: 400 })
    }
  } else if (typeof body.plan === 'string') {
    const planMap: Record<string, string | undefined> = {
      starter: process.env.STRIPE_STARTER_PRICE_ID?.trim(),
      growth:  process.env.STRIPE_GROWTH_PRICE_ID?.trim(),
      pro:     process.env.STRIPE_PRO_PRICE_ID?.trim(),
    }
    const resolved = planMap[body.plan]
    if (!resolved) {
      return NextResponse.json({ error: 'Plan not configured.' }, { status: 400 })
    }
    cleanPriceId = resolved
  } else {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://rentalos.domrol.com'

  let session: { url: string | null }
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey)
    session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: cleanPriceId, quantity: 1 }],
      success_url: `${siteUrl}/admin?checkout=success`,
      cancel_url: `${siteUrl}/pricing`,
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 14,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[checkout] stripe error:', msg)
    return NextResponse.json(
      { error: 'Unable to start checkout. Please try again.', stripeError: msg },
      { status: 502 }
    )
  }

  if (!session.url) {
    return NextResponse.json({ error: 'No checkout URL returned. Please try again.' }, { status: 502 })
  }

  return NextResponse.json({ url: session.url })
}
