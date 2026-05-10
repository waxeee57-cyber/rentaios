import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { sendConfirmationEmails } from '@/lib/email/send'
import { formatTime } from '@/lib/formatters'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params

  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('*, car:cars(brand,model,year,daily_price_eur,deposit_eur), customer:customers(full_name,email,phone)')
    .eq('id', id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  if (booking.status !== 'inquiry') return NextResponse.json({ error: 'Booking is not in inquiry status' }, { status: 400 })

  // Overlap check
  const { data: conflicts } = await supabaseAdmin
    .from('bookings')
    .select('booking_code')
    .eq('car_id', booking.car_id)
    .in('status', ['confirmed', 'picked_up', 'returned'])
    .neq('id', id)
    .lt('start_at', booking.end_at)
    .gt('end_at', booking.start_at)
    .limit(1)

  if (conflicts && conflicts.length > 0) {
    return NextResponse.json({
      error: `This car is already booked for overlapping dates (${conflicts[0].booking_code}). Resolve that booking first or change dates with the customer.`,
      conflicting_booking_code: conflicts[0].booking_code,
    }, { status: 409 })
  }

  const now = new Date().toISOString()
  const newHistory = [
    ...(booking.status_history ?? []),
    { status: 'confirmed', at: now, by: auth.user.email },
  ]

  const { error } = await supabaseAdmin
    .from('bookings')
    .update({ status: 'confirmed', status_history: newHistory, updated_at: now })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  // Fire-and-forget confirmation email notifications
  sendConfirmationEmails({
    customerName: booking.customer.full_name,
    customerEmail: booking.customer.email,
    carLabel: `${booking.car.brand} ${booking.car.model} ${booking.car.year}`,
    startAt: booking.start_at,
    endAt: booking.end_at,
    days: booking.days,
    pickupLocation: booking.pickup_location,
    pickupTime: booking.pickup_time ?? formatTime(booking.start_at),
    totalEur: booking.total_eur,
    depositEur: booking.deposit_eur,
    bookingCode: booking.booking_code,
    transferRequested: booking.transfer_requested,
    transferAddress: booking.transfer_address ?? undefined,
    transferFeeEur: booking.transfer_fee_eur ?? null,
  }).catch((err) => console.error('[Email] sendConfirmationEmails threw:', err))

  return NextResponse.json({ ok: true })
}
