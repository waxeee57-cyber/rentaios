import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ addon_key: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { addon_key } = await params

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('id, stripe_subscription_id')
    .single()

  if (!subscription?.id) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
  }

  const { data: addonRow } = await supabaseAdmin
    .from('subscription_addons')
    .select('id, stripe_subscription_item_id')
    .eq('subscription_id', subscription.id)
    .eq('addon_key', addon_key)
    .eq('status', 'active')
    .maybeSingle()

  if (!addonRow) {
    return NextResponse.json({ error: 'Add-on not found' }, { status: 404 })
  }

  if (addonRow.stripe_subscription_item_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
      await stripe.subscriptionItems.del(addonRow.stripe_subscription_item_id)
    } catch {
      // Non-fatal
    }
  }

  const { error } = await supabaseAdmin
    .from('subscription_addons')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', addonRow.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
