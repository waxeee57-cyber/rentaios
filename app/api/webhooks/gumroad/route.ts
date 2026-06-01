import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendEmail, ADMIN_EMAIL } from '@/lib/resend'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'
const GUMROAD_SELLER_ID = process.env.GUMROAD_SELLER_ID

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!rateLimit(ip, 20, 3_600_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // Gumroad sends application/x-www-form-urlencoded
  const text = await req.text()
  const params = new URLSearchParams(text)

  const sellerId = params.get('seller_id')
  const saleId = params.get('sale_id')
  const buyerEmail = params.get('email') ?? params.get('buyer_email')
  const buyerName = params.get('buyer_name') ?? params.get('full_name')
  const priceStr = params.get('price') // cents

  // Validate seller — graceful if not configured (dev mode)
  if (GUMROAD_SELLER_ID && sellerId !== GUMROAD_SELLER_ID) {
    console.error('[Gumroad] seller_id mismatch:', sellerId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!GUMROAD_SELLER_ID) {
    console.warn('[Gumroad] GUMROAD_SELLER_ID not set — accepting without seller validation')
  }

  if (!buyerEmail || !saleId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Idempotency: skip if already processed
  if (saleId) {
    const { data: existing } = await supabaseAdmin
      .from('template_sales')
      .select('id')
      .eq('gumroad_sale_id', saleId)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ success: true, duplicate: true })
    }
  }

  const amountEur = priceStr ? Math.round(parseInt(priceStr, 10)) / 100 : null
  const firstName = buyerName ? buyerName.split(' ')[0] : 'there'
  const senderName = process.env.RESEND_FROM_NAME ?? 'RentalOS'

  // Insert sale record
  const { error: insertError } = await supabaseAdmin
    .from('template_sales')
    .insert({
      gumroad_sale_id: saleId,
      buyer_email: buyerEmail,
      buyer_name: buyerName ?? null,
      amount_eur: amountEur,
      licence_type: 'single_deployment',
    })

  if (insertError) {
    console.error('[Gumroad] Insert error:', insertError.message)
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
  }

  // Welcome email
  const welcomeHtml = `
    <div style="font-family: DM Sans, sans-serif; max-width: 600px; color: #e5e5e5; background: #141415; padding: 32px; border-radius: 8px;">
      <p style="font-size: 15px; line-height: 1.7;">Hi ${firstName},</p>
      <p style="font-size: 15px; line-height: 1.7;">
        Thank you for purchasing RentalOS.
      </p>
      <p style="font-size: 15px; line-height: 1.7;">
        Your download is available in your Gumroad library.
      </p>
      <p style="font-size: 14px; font-weight: 600; margin-top: 24px; color: #C8A96B;">What to do next:</p>
      <ol style="font-size: 14px; line-height: 2; color: #a3a3a3; padding-left: 20px;">
        <li>Download the ZIP from your Gumroad library</li>
        <li>Follow the setup guide: <a href="${SITE_URL}/docs" style="color: #C8A96B;">${SITE_URL}/docs</a></li>
        <li>Questions? Reply to this email — 30-day support included</li>
      </ol>
      <p style="font-size: 14px; color: #a3a3a3; line-height: 1.7;">
        Deploy time: about 1–2 hours following the guide.
      </p>
      <p style="font-size: 14px; color: #a3a3a3; margin-top: 32px;">
        ${senderName}<br/>
        RentalOS
      </p>
    </div>
  `

  await sendEmail({
    to: buyerEmail,
    subject: 'Your RentalOS template — setup guide inside',
    html: welcomeHtml,
    replyTo: ADMIN_EMAIL,
  })

  // Mark welcome email sent
  await supabaseAdmin
    .from('template_sales')
    .update({ welcome_email_sent: true })
    .eq('gumroad_sale_id', saleId)

  // Alert admin
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `New template sale — ${buyerEmail}`,
    html: `<p>New Gumroad sale: <strong>${buyerName ?? buyerEmail}</strong> (${buyerEmail}) — €${amountEur ?? '?'}</p>`,
  })

  console.log('[Gumroad] Processed sale:', saleId)
  return NextResponse.json({ success: true })
}
