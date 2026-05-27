import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // Rate limit: 10 requests per IP per minute
  const ip = getClientIp(req)
  if (!rateLimit(ip, 10, 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      { status: 429 }
    )
  }

  const body = await req.json()
  const { code, email } = body

  if (!code || !email || typeof code !== 'string' || typeof email !== 'string') {
    return NextResponse.json({ error: 'Code and email required.' }, { status: 400 })
  }

  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select(`
      id, booking_code, status, status_history,
      pickup_location, dropoff_location,
      start_at, end_at, days, total_eur, deposit_eur,
      customer_message, created_at, updated_at,
      transfer_requested, transfer_address, transfer_fee_eur,
      car_id,
      customer_id
    `)
    .eq('booking_code', code.toUpperCase())
    .single()

  if (!booking) {
    // Return 404 (not 403) so callers cannot distinguish "code doesn't exist"
    // from "code exists but wrong email" â€” prevents oracle enumeration.
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
  }

  // Verify email matches customer
  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('email, full_name, phone, country')
    .eq('id', booking.customer_id)
    .single()

  if (!customer || customer.email.toLowerCase() !== email.toLowerCase()) {
    // Unified 404 â€” same status as "booking not found" to prevent oracle attacks
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
  }

  // Get car info
  const { data: car } = await supabaseAdmin
    .from('cars')
    .select('brand, model, year, slug, photos')
    .eq('id', booking.car_id)
    .single()

  // Return sanitized record (no admin_notes, no internal UUIDs)
  return NextResponse.json({
    booking_code: booking.booking_code,
    status: booking.status,
    pickup_location: booking.pickup_location,
    dropoff_location: booking.dropoff_location,
    start_at: booking.start_at,
    end_at: booking.end_at,
    days: booking.days,
    total_eur: booking.total_eur,
    deposit_eur: booking.deposit_eur,
    customer_message: booking.customer_message,
    created_at: booking.created_at,
    transfer_requested: booking.transfer_requested,
    transfer_address: booking.transfer_address,
    transfer_fee_eur: booking.transfer_fee_eur,
    customer: {
      full_name: customer.full_name,
    },
    car: car
      ? { brand: car.brand, model: car.model, year: car.year, slug: car.slug, photos: car.photos }
      : null,
  })
}
