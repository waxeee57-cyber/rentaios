import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const ip = getClientIp(req)
  if (!rateLimit(ip + ':availability', 30, 3_600_000)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  const { slug } = await params
  const { searchParams } = new URL(req.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json({ error: 'start and end required' }, { status: 400 })
  }

  // Get car id from slug
  const { data: car } = await supabaseAdmin
    .from('cars')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!car) {
    return NextResponse.json({ error: 'Car not found' }, { status: 404 })
  }

  const startUtc = new Date(start).toISOString()
  const endUtc = new Date(end).toISOString()

  const { data: conflicts } = await supabaseAdmin
    .from('bookings')
    .select('id')
    .eq('car_id', car.id)
    .in('status', ['confirmed', 'picked_up', 'returned'])
    .lt('start_at', endUtc)
    .gt('end_at', startUtc)
    .limit(1)

  const available = !conflicts || conflicts.length === 0

  return NextResponse.json({ available })
}
