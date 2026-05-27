import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateBookingCode } from '@/lib/booking-code'
import { isFutureOrToday, TZ } from '@/lib/formatters'
import { sendInquiryEmails } from '@/lib/email/send'
import { getBusinessConfig } from '@/lib/config'
import { formatInTimeZone } from 'date-fns-tz'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { z } from 'zod'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const schema = z.object({
  car_slug:           z.string(),
  start_date:         z.string(),
  end_date:           z.string(),
  pickup_location:    z.string(),
  full_name:          z.string().min(2),
  email:              z.string().email(),
  phone:              z.string().min(5),
  country:            z.string().min(1),
  // Strict HH:MM format â€” prevents invalid Date construction downstream
  pickup_time:        z.string().regex(/^\d{2}:\d{2}$/, 'pickup_time must be HH:MM'),
  message:            z.string().optional(),
  transfer_requested: z.boolean().default(false),
  transfer_address:   z.string().optional(),
})

export async function POST(req: NextRequest) {
  const config = await getBusinessConfig()
  const maxDays = config.max_rental_days ?? 14
  const minAge = config.min_driver_age ?? 21

  // Rate limit: 5 requests per IP per 15 minutes
  const ip = getClientIp(req)
  if (!rateLimit(ip, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a few minutes before trying again.' },
      { status: 429 }
    )
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 })
  }

  const { car_slug, start_date, end_date, pickup_location, full_name, email, phone, country, pickup_time, message, transfer_requested, transfer_address } = parsed.data

  // Validate dates in Madrid TZ
  const startDate = parseISO(start_date)
  const endDate = parseISO(end_date)

  if (!isFutureOrToday(startDate)) {
    return NextResponse.json({ error: 'Start date must be today or in the future.' }, { status: 400 })
  }

  const days = differenceInCalendarDays(endDate, startDate)
  if (days <= 0) {
    return NextResponse.json({ error: 'End date must be after start date.' }, { status: 400 })
  }
  if (days > maxDays) {
    return NextResponse.json({
      error: `Maximum rental duration is ${maxDays} days. For longer rentals, please contact us directly.`,
    }, { status: 400 })
  }

  void minAge // available for future age-validation step

  // Get car
  const { data: car } = await supabaseAdmin
    .from('cars')
    .select('id, brand, model, year, daily_price_eur, deposit_eur')
    .eq('slug', car_slug)
    .neq('status', 'hidden')
    .single()

  if (!car) {
    return NextResponse.json({ error: 'Car not found.' }, { status: 404 })
  }

  // Lazy cleanup of orphaned inquiry rows older than 14 days (cosmetic, fire-and-forget)
  void supabaseAdmin
    .from('bookings')
    .delete()
    .eq('status', 'inquiry')
    .lt('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())

  // Upsert customer
  const { data: customer, error: custErr } = await supabaseAdmin
    .from('customers')
    .upsert({ email, phone, full_name, country }, { onConflict: 'email' })
    .select('id')
    .single()

  if (custErr || !customer) {
    console.error('[inquiries/create] customer upsert failed', custErr?.code)
    return NextResponse.json({ error: 'Could not save customer. Please try again.' }, { status: 500 })
  }

  // Build timestamps â€” convert pickup date + time to UTC
  const pickupDateStr = formatInTimeZone(startDate, TZ, 'yyyy-MM-dd')
  const startUtc = new Date(`${pickupDateStr}T${pickup_time}:00`).toISOString()
  const endDateStr = formatInTimeZone(endDate, TZ, 'yyyy-MM-dd')
  const endUtc = new Date(`${endDateStr}T${pickup_time}:00`).toISOString()

  const total = car.daily_price_eur * days

  // Generate booking code with retry
  let booking_code = ''
  let inserted = null
  for (let attempt = 0; attempt < 3; attempt++) {
    booking_code = generateBookingCode()
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        booking_code,
        car_id: car.id,
        customer_id: customer.id,
        pickup_location: transfer_requested ? 'Custom â€” see transfer address' : pickup_location,
        dropoff_location: pickup_location,
        start_at: startUtc,
        end_at: endUtc,
        days,
        total_eur: total,
        deposit_eur: car.deposit_eur,
        customer_message: message ?? null,
        status: 'inquiry',
        status_history: [{ status: 'inquiry', at: new Date().toISOString(), by: 'system' }],
        source: 'web',
        transfer_requested,
        transfer_address: transfer_requested ? (transfer_address ?? null) : null,
      })
      .select('id')
      .single()

    if (!error) {
      inserted = data
      break
    }
    if (error.code !== '23505') { // not a unique violation
      console.error('[inquiries/create] insert failed', error)
      return NextResponse.json({ error: 'Could not create booking. Please try again.' }, { status: 500 })
    }
  }

  if (!inserted) {
    return NextResponse.json({ error: 'Could not generate booking code. Please try again.' }, { status: 500 })
  }

  // Fire-and-forget email notifications
  sendInquiryEmails({
    customerName: full_name,
    customerEmail: email,
    customerPhone: phone,
    customerCountry: country,
    carLabel: `${car.brand} ${car.model} ${car.year}`,
    startAt: startUtc,
    endAt: endUtc,
    days,
    pickupLocation: transfer_requested ? 'Custom â€” see transfer address' : pickup_location,
    pickupTime: pickup_time,
    totalEur: total,
    depositEur: car.deposit_eur,
    bookingCode: booking_code,
    customerMessage: message ?? undefined,
    transferRequested: transfer_requested,
    transferAddress: transfer_requested ? (transfer_address ?? undefined) : undefined,
  }).catch((err) => console.error('[Email] sendInquiryEmails threw:', err))

  return NextResponse.json({ booking_code })
}
