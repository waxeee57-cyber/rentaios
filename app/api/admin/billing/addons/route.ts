import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { z } from 'zod'

const VALID_ADDON_KEYS = ['sms_notifications', 'deposit_hold', 'multi_language'] as const
const schema = z.object({
  addon_key: z.enum(VALID_ADDON_KEYS),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!rateLimit(ip, 10, 3_600_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid addon_key' }, { status: 400 })
  }

  const { addon_key } = parsed.data

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('id, stripe_subscription_id')
    .single()

  if (!subscription?.id) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
  }

  const { data: existing } = await supabaseAdmin
    .from('subscription_addons')
    .select('id')
    .eq('subscription_id', subscription.id)
    .eq('addon_key', addon_key)
    .eq('status', 'active')
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Add-on already active' }, { status: 409 })
  }

  let stripeItemId: string | null = null
  if (process.env.STRIPE_SECRET_KEY && subscription.stripe_subscription_id) {
    const ADDON_PRICE_MAP: Record<string, string | undefined> = {
      sms_notifications: process.env.STRIPE_SMS_ADDON_PRICE_ID,
      deposit_hold: process.env.STRIPE_DEPOSIT_ADDON_PRICE_ID,
    }
    const priceId = ADDON_PRICE_MAP[addon_key]
    if (priceId) {
      try {
        const Stripe = (await import('stripe')).default
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        const item = await stripe.subscriptionItems.create({
          subscription: subscription.stripe_subscription_id,
          price: priceId,
          quantity: 1,
        })
        stripeItemId = item.id
      } catch {
        // Stripe not critical â€” record the addon anyway
      }
    }
  }

  const { data: addon, error } = await supabaseAdmin
    .from('subscription_addons')
    .insert({
      subscription_id: subscription.id,
      addon_key,
      stripe_subscription_item_id: stripeItemId,
      status: 'active',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, addon })
}
