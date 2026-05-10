import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendReviewRequest } from '@/lib/email/send'

const CRON_SECRET = process.env.CRON_SECRET
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: configRow } = await supabaseAdmin
    .from('business_config')
    .select('google_review_url, review_email_enabled, business_name')
    .single()

  if (!configRow?.google_review_url) {
    return NextResponse.json({ skipped: 'no review URL configured' })
  }

  if (configRow.review_email_enabled === false) {
    return NextResponse.json({ skipped: 'review emails disabled' })
  }

  const { data: bookings } = await supabaseAdmin
    .from('bookings')
    .select(`
      id,
      updated_at,
      car:cars(brand, model),
      customer:customers(full_name, email)
    `)
    .eq('status', 'completed')
    .eq('review_email_sent', false)
    .lt('updated_at', new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString())
    .gt('updated_at', new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString())

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  let sentCount = 0

  for (const booking of bookings) {
    const car = Array.isArray(booking.car) ? booking.car[0] : booking.car
    const customer = Array.isArray(booking.customer) ? booking.customer[0] : booking.customer

    if (!customer?.email || !customer?.full_name) continue

    const carLabel = car ? `${car.brand} ${car.model}` : 'your rental'

    await sendReviewRequest({
      customerEmail: customer.email,
      customerName: customer.full_name,
      carLabel,
      businessName: configRow.business_name ?? 'RentalOS',
      reviewUrl: configRow.google_review_url,
      siteUrl: SITE_URL,
      bookingId: booking.id,
    }).catch(() => null)

    await supabaseAdmin
      .from('bookings')
      .update({ review_email_sent: true })
      .eq('id', booking.id)

    sentCount++
  }

  return NextResponse.json({ sent: sentCount })
}
