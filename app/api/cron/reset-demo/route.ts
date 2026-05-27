import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Delete all demo data
  const [bookingsDel, carsDel] = await Promise.all([
    supabaseAdmin.from('bookings').delete().eq('is_demo', true),
    supabaseAdmin.from('cars').delete().eq('is_demo', true),
  ])

  if (bookingsDel.error || carsDel.error) {
    console.error('[Demo reset] Delete failed:', bookingsDel.error ?? carsDel.error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }

  // Re-seed demo cars
  const { data: cars, error: carsError } = await supabaseAdmin
    .from('cars')
    .insert([
      {
        slug: 'demo-ferrari-488',
        brand: 'Ferrari', model: '488 Spider', year: 2024, category: 'sport',
        daily_price_eur: 850, deposit_eur: 10000, status: 'available', is_demo: true,
        features: ['V8 Twin-Turbo', 'Convertible', '7-speed DCT', 'Launch Control', 'Carbon ceramic brakes'],
        description: 'The Ferrari 488 Spider combines a 3.9-litre twin-turbo V8 with the purest open-top driving experience. 670 hp, 0-100 in 3.0 seconds.',
      },
      {
        slug: 'demo-bentley-bentayga',
        brand: 'Bentley', model: 'Bentayga', year: 2024, category: 'suv',
        daily_price_eur: 650, deposit_eur: 8000, status: 'available', is_demo: true,
        features: ['4.0L V8 Biturbo', 'AWD', 'Air suspension', 'Naim audio', 'Mulliner interior'],
        description: 'The Bentley Bentayga defines the luxury SUV. Effortless performance with hand-crafted British craftsmanship.',
      },
      {
        slug: 'demo-porsche-911',
        brand: 'Porsche', model: '911 Carrera', year: 2024, category: 'sport',
        daily_price_eur: 480, deposit_eur: 6000, status: 'available', is_demo: true,
        features: ['3.0L Flat-6 Turbo', 'PDK 8-speed', 'Sport Chrono', 'PASM suspension', 'Bose sound'],
        description: 'The Porsche 911 Carrera â€” the icon that set the benchmark for sports cars. 385 hp, rear-wheel drive.',
      },
    ])
    .select('id, slug')

  if (carsError || !cars) {
    console.error('[Demo reset] Cars insert failed:', carsError)
    return NextResponse.json({ error: 'Cars seed failed' }, { status: 500 })
  }

  // Ensure demo customers exist
  await supabaseAdmin
    .from('customers')
    .upsert([
      { id: '00000000-0000-0000-0000-000000000001', email: 'demo-james@example.com', phone: '+44 7700 000001', full_name: 'James Harrington', country: 'United Kingdom' },
      { id: '00000000-0000-0000-0000-000000000002', email: 'demo-sofia@example.com', phone: '+34 600 000002', full_name: 'Sofia Andersen', country: 'Denmark' },
      { id: '00000000-0000-0000-0000-000000000003', email: 'demo-marco@example.com', phone: '+39 347 000003', full_name: 'Marco Bianchi', country: 'Italy' },
    ], { onConflict: 'id' })

  const ferrari = cars.find(c => c.slug === 'demo-ferrari-488')?.id
  const bentley = cars.find(c => c.slug === 'demo-bentley-bentayga')?.id
  const porsche = cars.find(c => c.slug === 'demo-porsche-911')?.id

  if (!ferrari || !bentley || !porsche) {
    return NextResponse.json({ error: 'Car IDs missing after seed' }, { status: 500 })
  }

  const c1 = '00000000-0000-0000-0000-000000000001'
  const c2 = '00000000-0000-0000-0000-000000000002'
  const c3 = '00000000-0000-0000-0000-000000000003'

  const now = new Date()
  const day = (offset: number) => new Date(now.getTime() + offset * 86400000).toISOString()

  const { error: bookingsError } = await supabaseAdmin.from('bookings').insert([
    { booking_code: 'DEMO-001', car_id: ferrari, customer_id: c1, pickup_location: 'Marbella', dropoff_location: 'Marbella', start_at: day(3), end_at: day(6), days: 3, total_eur: 2550, deposit_eur: 10000, status: 'inquiry', is_demo: true, source: 'web' },
    { booking_code: 'DEMO-002', car_id: bentley, customer_id: c2, pickup_location: 'MĂˇlaga Airport', dropoff_location: 'Marbella', start_at: day(1), end_at: day(5), days: 4, total_eur: 2600, deposit_eur: 8000, status: 'confirmed', is_demo: true, source: 'web' },
    { booking_code: 'DEMO-003', car_id: porsche, customer_id: c3, pickup_location: 'Puerto BanĂşs', dropoff_location: 'Puerto BanĂşs', start_at: day(-2), end_at: day(3), days: 5, total_eur: 2400, deposit_eur: 6000, status: 'picked_up', is_demo: true, source: 'web' },
    { booking_code: 'DEMO-004', car_id: ferrari, customer_id: c2, pickup_location: 'Estepona', dropoff_location: 'Estepona', start_at: day(-10), end_at: day(-7), days: 3, total_eur: 2550, deposit_eur: 10000, status: 'completed', is_demo: true, source: 'web' },
    { booking_code: 'DEMO-005', car_id: bentley, customer_id: c1, pickup_location: 'Marbella', dropoff_location: 'Marbella', start_at: day(-8), end_at: day(-5), days: 3, total_eur: 1950, deposit_eur: 8000, status: 'cancelled', is_demo: true, source: 'web' },
  ])

  if (bookingsError) {
    console.error('[Demo reset] Bookings insert failed:', bookingsError)
    return NextResponse.json({ error: 'Bookings seed failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true, reset: new Date().toISOString() })
}
