import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { sendEmail, getAdminEmail } from '@/lib/resend'

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  message: z.string().max(500).optional().default(''),
  car: z.string().max(100).optional().default('a vehicle'),
})

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const allowed = rateLimit(`demo-inquiry:${ip}`, 5, 3_600_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check your input and try again.' }, { status: 422 })
  }

  const { name, email, message, car } = parsed.data
  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeMessage = escapeHtml(message)
  const safeCar = escapeHtml(car)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'

  const adminEmail = await getAdminEmail()

  await sendEmail({
    to: adminEmail,
    subject: `Demo inquiry — ${safeName} interested in ${safeCar}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;">
        <p style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#C8A96B;margin:0 0 16px;">RentalOS — Demo Inquiry</p>
        <h2 style="font-size:20px;font-weight:400;color:#111;margin:0 0 16px;">New demo inquiry</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#444;">
          <tr><td style="padding:6px 0;color:#888;width:80px;">Name</td><td style="padding:6px 0;">${safeName}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Email</td><td style="padding:6px 0;">${safeEmail}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Vehicle</td><td style="padding:6px 0;">${safeCar}</td></tr>
          ${safeMessage ? `<tr><td style="padding:6px 0;color:#888;vertical-align:top;">Message</td><td style="padding:6px 0;">${safeMessage}</td></tr>` : ''}
        </table>
        <p style="font-size:12px;color:#999;margin-top:24px;">Submitted via the RentalOS demo. No booking was created.</p>
      </div>
    `,
  })

  await sendEmail({
    to: email,
    replyTo: adminEmail,
    subject: `Your inquiry about the ${safeCar}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;">
        <p style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#C8A96B;margin:0 0 16px;">RentalOS</p>
        <h2 style="font-size:20px;font-weight:400;color:#111;margin:0 0 16px;">Thanks, ${safeName}.</h2>
        <p style="font-size:14px;color:#444;line-height:1.6;">
          We received your inquiry about the <strong>${safeCar}</strong>.
        </p>
        <p style="font-size:14px;color:#444;line-height:1.6;margin-top:12px;">
          This was a demo submission — no real booking was created.
          If you&apos;d like a system like this running for your own rental business,
          we can have it live in 48 hours.
        </p>
        <a href="${siteUrl}/onboarding"
           style="display:inline-block;margin-top:24px;padding:12px 28px;background:#C8A96B;color:#fff;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">
          Get this for my business →
        </a>
        <p style="font-size:12px;color:#999;margin-top:24px;">
          Questions? Reply to this email or visit <a href="${siteUrl}/pricing" style="color:#C8A96B;">${siteUrl}/pricing</a>
        </p>
      </div>
    `,
  })

  return NextResponse.json({ success: true })
}
