import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getBusinessConfig } from '@/lib/config'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
  const location = searchParams.get('location')

  if (!start || !end) {
    return NextResponse.json({ error: 'start and end required' }, { status: 400 })
  }

  // `location` is only present when multi-location is on. Select location_id only
  // in that case so the query stays identical on un-migrated single-location DBs.
  const carColumns = location ? 'id, location_id' : 'id'
  const { data: car } = await supabaseAdmin
    .from('cars')
    .select(carColumns)
    .eq('slug', slug)
    .single<{ id: string; location_id?: string | null }>()

  if (!car) {
    return NextResponse.json({ error: 'Car not found' }, { status: 404 })
  }

  // If a telephely is selected, a car pinned to another location is not available there.
  if (location && UUID_RE.test(location)) {
    const config = await getBusinessConfig()
    if (config.multi_location_enabled === true && car.location_id && car.location_id !== location) {
      return NextResponse.json({ available: false })
    }
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
