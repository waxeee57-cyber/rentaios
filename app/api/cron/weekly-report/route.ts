import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendWeeklyReport } from '@/lib/email/send'
import { ADMIN_EMAIL } from '@/lib/resend'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const weekStart = sevenDaysAgo.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
  const weekEnd = now.toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
  const dateRange = `${weekStart} – ${weekEnd}`

  const [inquiriesRes, confirmedRes, revenueRes, pickupsRes] = await Promise.all([
    supabaseAdmin
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString()),

    supabaseAdmin
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'confirmed')
      .gte('updated_at', sevenDaysAgo.toISOString()),

    supabaseAdmin
      .from('bookings')
      .select('total_eur')
      .in('status', ['confirmed', 'picked_up', 'returned', 'completed'])
      .gte('updated_at', sevenDaysAgo.toISOString()),

    supabaseAdmin
      .from('bookings')
      .select('booking_code, start_at, pickup_location, car:cars(brand, model), customer:customers(full_name)')
      .eq('status', 'confirmed')
      .gte('start_at', now.toISOString())
      .lte('start_at', sevenDaysAhead.toISOString())
      .order('start_at'),
  ])

  const revenueWeek = (revenueRes.data ?? []).reduce(
    (sum: number, b: { total_eur: number }) => sum + (b.total_eur ?? 0),
    0
  )

  const upcomingPickups = (pickupsRes.data ?? []).map((b) => {
    const car = Array.isArray(b.car) ? b.car[0] : b.car
    const customer = Array.isArray(b.customer) ? b.customer[0] : b.customer
    return {
      carLabel: car ? `${car.brand} ${car.model}` : 'Vehicle',
      customerFirstName: ((customer as { full_name?: string } | null)?.full_name ?? 'Customer').split(' ')[0],
      startAt: String(b.start_at),
      pickupTime: null as string | null,
    }
  })

  await sendWeeklyReport({
    dateRange,
    inquiriesCount: inquiriesRes.count ?? 0,
    confirmedCount: confirmedRes.count ?? 0,
    revenueWeek,
    upcomingPickups,
    adminUrl: `${SITE_URL}/admin`,
    adminEmail: ADMIN_EMAIL,
  })

  return NextResponse.json({ success: true, dateRange })
}
