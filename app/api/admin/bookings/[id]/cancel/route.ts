import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { sendCancellationEmail } from '@/lib/email/send'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params
  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('*, car:cars(brand,model,year), customer:customers(full_name,email)')
    .eq('id', id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (booking.status === 'completed' || booking.status === 'cancelled') {
    return NextResponse.json({ error: 'Cannot cancel a completed or already cancelled booking' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const newHistory = [...(booking.status_history ?? []), { status: 'cancelled', at: now, by: auth.user.email }]

  const { error } = await supabaseAdmin.from('bookings').update({ status: 'cancelled', status_history: newHistory, updated_at: now }).eq('id', id)
  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  sendCancellationEmail({
    customerName: booking.customer.full_name,
    customerEmail: booking.customer.email,
    carLabel: `${booking.car.brand} ${booking.car.model} ${booking.car.year}`,
    startAt: booking.start_at,
    endAt: booking.end_at,
    bookingCode: booking.booking_code,
  }).catch((err) => console.error('[Email] sendCancellationEmail threw:', err))

  return NextResponse.json({ ok: true })
}
