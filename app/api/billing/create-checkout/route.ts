import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!rateLimit(`checkout:${ip}`, 30, 3_600_000)) {
    return NextResponse.json({ error: 'Too many requests. Try again shortly.' }, { status: 429 })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  let body: { priceId?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const priceId = body.priceId
  if (typeof priceId !== 'string') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const validPriceIds = [
    process.env.STRIPE_STARTER_PRICE_ID,
    process.env.STRIPE_GROWTH_PRICE_ID,
    process.env.STRIPE_PRO_PRICE_ID,
    process.env.STRIPE_STARTER_ANNUAL_PRICE_ID,
    process.env.STRIPE_GROWTH_ANNUAL_PRICE_ID,
    process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
  ].filter((id): id is string => typeof id === 'string')

  if (!validPriceIds.includes(priceId)) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rentalos.domrol.com'

  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
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
    return NextResponse.json({ error: 'Unable to start checkout. Please try again.' }, { status: 502 })
  }

  if (!session.url) {
    return NextResponse.json({ error: 'No checkout URL returned. Please try again.' }, { status: 502 })
  }

  return NextResponse.json({ url: session.url })
}
