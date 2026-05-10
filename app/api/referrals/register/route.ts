import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { sendEmail, ADMIN_EMAIL } from '@/lib/resend'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!rateLimit(ip, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const email = parsed.data.email

  // Check for existing referral
  const { data: existing } = await supabaseAdmin
    .from('referrals')
    .select('referrer_code')
    .eq('referrer_email', email)
    .limit(1)
    .single()

  let code: string

  if (existing?.referrer_code) {
    code = existing.referrer_code
  } else {
    const { data: created, error } = await supabaseAdmin
      .from('referrals')
      .insert({ referrer_email: email })
      .select('referrer_code')
      .single()

    if (error || !created) {
      return NextResponse.json({ error: 'Failed to create referral' }, { status: 500 })
    }
    code = created.referrer_code
  }

  const link = `${SITE_URL}/r/${code}`

  // Send email with link (fire-and-forget)
  sendEmail({
    to: email,
    subject: 'Your RentalOS referral link',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
        <p style="font-size:13px;color:#888;margin:0 0 24px;">RentalOS referral program</p>
        <p style="font-size:15px;color:#1a1a1a;margin:0 0 12px;font-weight:600;">Your referral link is ready.</p>
        <p style="font-size:14px;color:#555;margin:0 0 24px;line-height:1.65;">
          Share this link with any rental business owner. When they subscribe, you both get one month free.
        </p>
        <div style="background:#f5f5f5;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
          <a href="${link}" style="color:#C8A96B;font-family:monospace;font-size:14px;word-break:break-all;">${link}</a>
        </div>
        <p style="font-size:12px;color:#aaa;margin:0;">Reply to this email if you have any questions.</p>
      </div>
    `,
    replyTo: ADMIN_EMAIL,
  }).catch(console.error)

  return NextResponse.json({ success: true, link, code })
}
