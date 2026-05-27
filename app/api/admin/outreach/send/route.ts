import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/auth'
import { sendEmail, ADMIN_EMAIL } from '@/lib/resend'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { z } from 'zod'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const leadSchema = z.object({
  email: z.string().email(),
  first_name: z.string().optional(),
  company_name: z.string().optional(),
  business_type: z.string().optional(),
  location: z.string().optional(),
})

const bodySchema = z.object({
  leads: z.array(leadSchema).min(1).max(100),
})

const UNSUBSCRIBE_LINE = `\n\nâ€”\nIf you'd prefer not to hear from us, reply with 'unsubscribe' and I'll remove you immediately.`

async function generateEmail(
  firstName: string,
  companyName: string,
  businessType: string,
  location: string,
): Promise<{ subject: string; body: string }> {
  const senderName = process.env.RESEND_FROM_NAME ?? 'RentalOS'

  if (!ANTHROPIC_API_KEY) {
    return {
      subject: `Your ${businessType} bookings â€” quick question`,
      body: `Hi ${firstName},\n\nRunning a ${businessType} business in ${location} usually means juggling bookings across WhatsApp, messages, and spreadsheets â€” and things fall through the cracks.\n\nRentalOS replaces that with a proper booking system: inquiries captured automatically, confirmations sent instantly, everything tracked in one admin panel.\n\nWould you have 10 minutes to take a look? There's a live demo at ${SITE_URL}/demo â€” no signup needed.\n\n${senderName}\nRentalOS${UNSUBSCRIBE_LINE}`,
    }
  }

  const [bodyRes, subjectRes] = await Promise.all([
    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `Write a short, personal cold email to ${firstName} who runs ${companyName}, a ${businessType} business in ${location}.\n\nYou are writing on behalf of RentalOS â€” a booking management system that helps rental businesses replace WhatsApp and spreadsheets with a proper automated system.\n\nRules:\n- Exactly 4-5 sentences total\n- First sentence: specific observation about their business type or location\n- Second sentence: one specific pain point they likely have\n- Third sentence: what RentalOS does (one line, no features list)\n- Fourth sentence: soft CTA â€” ask if they have 10 minutes\n- Optional fifth: mention the live demo at ${SITE_URL}/demo\n- DO NOT include a subject line\n- DO NOT use: 'I hope this finds you well', 'I wanted to reach out', 'synergy', 'revolutionary'\n- Tone: direct, peer-to-peer, as if from another business owner\n- Sign off: '${senderName}\\nRentalOS'\n\nBusiness: ${companyName}\nType: ${businessType}\nLocation: ${location}\nFirst name: ${firstName}`,
        }],
      }),
    }),
    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 50,
        messages: [{
          role: 'user',
          content: `Write ONE cold email subject line for ${firstName} at ${companyName} (${businessType} in ${location}).\n\nRules:\n- Max 7 words\n- Sounds human-written, not marketing\n- References their situation or location\n- No: 'Quick question', 'Following up', clickbait caps\n- Examples: 'Your Ibiza fleet and bookings', 'Managing ${location} rentals on WhatsApp?'\n- Return ONLY the subject line, nothing else`,
        }],
      }),
    }),
  ])

  const [bodyJson, subjectJson] = await Promise.all([bodyRes.json(), subjectRes.json()])

  const emailBody = (bodyJson?.content?.[0]?.text ?? '').trim()
  const emailSubject = (subjectJson?.content?.[0]?.text ?? '').trim().replace(/^["']|["']$/g, '')

  return {
    subject: emailSubject || `Your ${businessType} bookings â€” quick question`,
    body: emailBody
      ? emailBody + UNSUBSCRIBE_LINE
      : `Hi ${firstName},\n\nWould you have 10 minutes to look at how RentalOS handles bookings for ${businessType} businesses in ${location}?\n\nDemo: ${SITE_URL}/demo\n\n${senderName}\nRentalOS${UNSUBSCRIBE_LINE}`,
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  // 5 send requests per hour â€” prevents accidental spam blast
  const ip = getClientIp(req)
  if (!rateLimit(`outreach_send:${ip}`, 5, 3_600_000)) {
    return NextResponse.json({ error: 'Rate limit: max 5 send requests per hour' }, { status: 429 })
  }

  const raw = await req.json()
  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
  }

  const { leads } = parsed.data
  let sent = 0
  let skipped = 0
  const errors: string[] = []

  for (const lead of leads) {
    // Skip generic inbox addresses
    const localPart = lead.email.split('@')[0].toLowerCase()
    if (['info', 'contact', 'hello', 'admin', 'support', 'sales', 'enquiries'].includes(localPart)) {
      skipped++
      continue
    }

    // Dedup check
    const { data: existing } = await supabaseAdmin
      .from('cold_email_leads')
      .select('id')
      .eq('email', lead.email)
      .maybeSingle()
    if (existing) { skipped++; continue }

    const firstName = lead.first_name || 'there'
    const companyName = lead.company_name || 'your company'
    const businessType = lead.business_type || 'rental'
    const location = lead.location || 'your area'

    let subject = ''
    let body = ''

    try {
      const generated = await generateEmail(firstName, companyName, businessType, location)
      subject = generated.subject
      body = generated.body
    } catch (err) {
      errors.push(`${lead.email}: email generation failed`)
      continue
    }

    // Send via Resend
    const emailResult = await sendEmail({
      to: lead.email,
      subject,
      html: body.replace(/\n/g, '<br>'),
      replyTo: ADMIN_EMAIL,
    })

    // Insert tracking record regardless of send result
    const { error: dbError } = await supabaseAdmin
      .from('cold_email_leads')
      .insert({
        email: lead.email,
        first_name: lead.first_name ?? null,
        company_name: lead.company_name ?? null,
        business_type: lead.business_type ?? null,
        location: lead.location ?? null,
        status: 'contacted',
        email_sent_at: new Date().toISOString(),
        subject,
        body,
        source: 'manual',
      })

    if (dbError) {
      errors.push(`${lead.email}: db insert failed`)
    } else if (emailResult.success) {
      sent++
    } else {
      errors.push(`${lead.email}: ${emailResult.error ?? 'send failed'}`)
    }
  }

  return NextResponse.json({ sent, skipped, errors })
}
