import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail, ADMIN_EMAIL } from '@/lib/resend'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Single-tenant: one subscription row per installation
  const { data: subs } = await supabaseAdmin
    .from('subscriptions')
    .select('id, status, past_due_since, access_locked, dunning_email_1_sent, dunning_email_2_sent, dunning_email_3_sent')
    .eq('status', 'past_due')

  let processed = 0

  for (const sub of subs ?? []) {
    const since = sub.past_due_since ? new Date(sub.past_due_since) : new Date()
    const daysPastDue = Math.floor((Date.now() - since.getTime()) / 86_400_000)

    const portalUrl = `${SITE_URL}/admin/billing`

    if (daysPastDue >= 7 && !sub.dunning_email_3_sent) {
      // Lock account
      await supabaseAdmin
        .from('subscriptions')
        .update({ access_locked: true, dunning_email_3_sent: true })
        .eq('id', sub.id)

      await sendEmail({
        to: ADMIN_EMAIL,
        subject: 'Your RentalOS account has been suspended',
        html: `
          <p>Your RentalOS subscription has been suspended due to a failed payment.</p>
          <p>Your data is safe and will be kept for 30 days.</p>
          <p><a href="${portalUrl}">Reactivate your account →</a></p>
        `,
      })
      processed++

    } else if (daysPastDue >= 3 && !sub.dunning_email_2_sent) {
      await supabaseAdmin
        .from('subscriptions')
        .update({ dunning_email_2_sent: true })
        .eq('id', sub.id)

      await sendEmail({
        to: ADMIN_EMAIL,
        subject: 'Your RentalOS access will be suspended soon',
        html: `
          <p>Your subscription payment is still outstanding.</p>
          <p>Access will be suspended in ${7 - daysPastDue} day${7 - daysPastDue === 1 ? '' : 's'} if not resolved.</p>
          <p><a href="${portalUrl}">Update payment method →</a></p>
        `,
      })
      processed++

    } else if (daysPastDue >= 1 && !sub.dunning_email_1_sent) {
      await supabaseAdmin
        .from('subscriptions')
        .update({ dunning_email_1_sent: true })
        .eq('id', sub.id)

      await sendEmail({
        to: ADMIN_EMAIL,
        subject: 'Payment issue with your RentalOS subscription',
        html: `
          <p>We had trouble processing your last payment.</p>
          <p>Please update your payment method to keep your account active.</p>
          <p><a href="${portalUrl}">Update payment method →</a></p>
        `,
      })
      processed++
    }
  }

  console.log('[dunning] done:', { processed })
  return NextResponse.json({ processed })
}
