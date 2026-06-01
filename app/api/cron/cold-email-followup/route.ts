import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendEmail, ADMIN_EMAIL } from '@/lib/resend'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const UNSUBSCRIBE_LINE = `\n\n—\nIf you'd prefer not to hear from us, reply with 'unsubscribe' and I'll remove you immediately.`

async function generateFollowUp(
  seq: 1 | 2,
  firstName: string,
  businessType: string,
  location: string,
): Promise<string> {
  const senderName = process.env.RESEND_FROM_NAME ?? 'RentalOS'

  if (!ANTHROPIC_API_KEY) {
    if (seq === 1) {
      return `Hi ${firstName},\n\nJust following up on my note about managing ${businessType} bookings more efficiently.\n\nDid you have a chance to look at it?\n\n${senderName}\nRentalOS${UNSUBSCRIBE_LINE}`
    }
    return `Hi ${firstName},\n\nThis is the last email I'll send on this.\n\nIf you ever want to take a look, the demo is at ${SITE_URL}/demo — no signup required, always available.\n\n${senderName}\nRentalOS${UNSUBSCRIBE_LINE}`
  }

  const prompt = seq === 1
    ? `Write a 2-sentence cold email follow-up to ${firstName} who runs a ${businessType} business in ${location}.\nThe previous email was about RentalOS — a system that replaces WhatsApp bookings with an automated booking flow.\nReference the previous email briefly. Ask if they had a chance to look at it. No pressure.\nSign off: '${senderName}\\nRentalOS'\nDO NOT include a subject line.`
    : `Write a 3-sentence final cold email to ${firstName} who runs a ${businessType} business in ${location}.\nThis is the last email you'll send them about RentalOS.\nSay this is the last email. Leave the door open warmly. Mention the live demo at ${SITE_URL}/demo.\nKeep it warm, not bitter or guilt-tripping.\nSign off: '${senderName}\\nRentalOS'\nDO NOT include a subject line.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const json = await res.json()
    const text = (json?.content?.[0]?.text ?? '').trim()
    return text ? text + UNSUBSCRIBE_LINE : ''
  } catch {
    return ''
  }
}

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString()

  let followup1Sent = 0
  let followup2Sent = 0

  // Follow-up 1: contacted 4+ days ago, no follow-up yet
  const { data: fu1Leads } = await supabaseAdmin
    .from('cold_email_leads')
    .select('id, email, first_name, company_name, business_type, location, subject')
    .eq('status', 'contacted')
    .is('follow_up_1_sent_at', null)
    .lt('email_sent_at', fourDaysAgo)

  for (const lead of fu1Leads ?? []) {
    const firstName = lead.first_name ?? 'there'
    const body = await generateFollowUp(1, firstName, lead.business_type ?? 'rental', lead.location ?? 'your area')
    if (!body) continue

    const subject = `Re: ${lead.subject ?? 'Your bookings'}`
    await sendEmail({ to: lead.email, subject, html: body.replace(/\n/g, '<br>'), replyTo: ADMIN_EMAIL })

    await supabaseAdmin
      .from('cold_email_leads')
      .update({ status: 'follow_up_1', follow_up_1_sent_at: now.toISOString(), updated_at: now.toISOString() })
      .eq('id', lead.id)

    followup1Sent++
  }

  // Follow-up 2 (final): follow_up_1 sent 4+ days ago, no follow-up 2 yet
  const { data: fu2Leads } = await supabaseAdmin
    .from('cold_email_leads')
    .select('id, email, first_name, company_name, business_type, location, subject')
    .eq('status', 'follow_up_1')
    .is('follow_up_2_sent_at', null)
    .lt('follow_up_1_sent_at', fourDaysAgo)

  for (const lead of fu2Leads ?? []) {
    const firstName = lead.first_name ?? 'there'
    const body = await generateFollowUp(2, firstName, lead.business_type ?? 'rental', lead.location ?? 'your area')
    if (!body) continue

    const subject = `Re: ${lead.subject ?? 'Your bookings'}`
    await sendEmail({ to: lead.email, subject, html: body.replace(/\n/g, '<br>'), replyTo: ADMIN_EMAIL })

    await supabaseAdmin
      .from('cold_email_leads')
      .update({ status: 'follow_up_2', follow_up_2_sent_at: now.toISOString(), updated_at: now.toISOString() })
      .eq('id', lead.id)

    followup2Sent++
  }

  console.log('[cold-email-followup] done:', { followup1Sent, followup2Sent })
  return NextResponse.json({ followup1_sent: followup1Sent, followup2_sent: followup2Sent })
}
