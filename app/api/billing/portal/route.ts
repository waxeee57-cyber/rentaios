import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Billing not configured' }, { status: 400 })
  }

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id')
    .single()

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(STRIPE_SECRET_KEY)

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${siteUrl}/admin/billing`,
  })

  return NextResponse.json({ url: session.url })
}
