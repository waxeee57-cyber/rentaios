export const revalidate = 60

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import { getBusinessConfig, getActiveLocations, type Location } from '@/lib/config'
import { FleetGrid } from '@/components/marketing/FleetGrid'
import { FleetFilters } from '@/components/marketing/FleetFilters'

export const metadata: Metadata = {
  title: 'Autóink',
  description: 'Böngéssze autóflottánkat Szegeden. Belföldi autópályadíj az árban, akár áfa nélkül.',
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface PageProps {
  searchParams: Promise<{ start?: string; end?: string; pickup?: string; category?: string; location?: string }>
}

async function getAvailableCars(startDate?: string, endDate?: string, category?: string, locationId?: string) {
  let query = supabaseAdmin
    .from('cars')
    .select('id, slug, brand, model, year, category, daily_price_eur, deposit_eur, transmission, fuel, seats, photos')
    .eq('status', 'available')
    .eq('is_demo', false)
    .order('daily_price_eur', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  // Multi-location filter (only reached when the flag is ON, i.e. DB is migrated):
  // show cars at the selected location OR with no location (available everywhere).
  if (locationId && UUID_RE.test(locationId)) {
    query = query.or(`location_id.eq.${locationId},location_id.is.null`)
  }

  const { data: allCars } = await query
  if (!allCars) return []

  if (startDate && endDate) {
    const startUtc = new Date(startDate).toISOString()
    const endUtc = new Date(endDate).toISOString()

    const { data: blockedRows } = await supabaseAdmin
      .from('bookings')
      .select('car_id')
      .in('status', ['confirmed', 'picked_up', 'returned'])
      .lt('start_at', endUtc)
      .gt('end_at', startUtc)

    const blockedIds = new Set((blockedRows ?? []).map((b: { car_id: string }) => b.car_id))

    return allCars.filter((car: { id: string; slug: string; brand: string; model: string; year: number; category: string; daily_price_eur: number; deposit_eur: number; transmission: string; fuel: string; seats: number; photos: Array<{url: string; alt: string}> }) => !blockedIds.has(car.id))
  }

  return allCars
}

function FleetGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-lg border border-border bg-white shadow-sm overflow-hidden animate-pulse">
          <div className="aspect-[16/9] bg-gray-100" />
          <div className="p-6 space-y-3">
            <div className="h-7 w-48 rounded bg-gray-100" />
            <div className="h-4 w-16 rounded bg-gray-100" />
            <div className="mt-4 flex gap-4">
              <div className="h-4 w-20 rounded bg-gray-100" />
              <div className="h-4 w-20 rounded bg-gray-100" />
              <div className="h-4 w-12 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

async function AvailableCarsGrid({ start, end, pickup, category, location }: { start?: string; end?: string; pickup?: string; category?: string; location?: string }) {
  const cars = await getAvailableCars(start, end, category, location)
  return (
    <>
      {start && end && (
        <p className="mb-6 font-sans text-sm text-muted">
          {cars.length === 0
            ? 'Nincs szabad autó ezekre a napokra.'
            : `${cars.length} szabad autó`}
        </p>
      )}
      <FleetGrid
        cars={cars}
        startDate={start}
        endDate={end}
        pickupLocation={pickup}
        location={location}
        emptyMessage="Nincs szabad autó ezekre a napokra. Próbáljon másik időpontot, vagy írjon nekünk WhatsApp-on."
      />
    </>
  )
}

async function getAllCarsForSchema() {
  const { data } = await supabaseAdmin
    .from('cars')
    .select('slug, brand, model, year')
    .neq('status', 'hidden')
    .order('daily_price_eur', { ascending: false })
  return data ?? []
}

export default async function FleetPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { start, end, pickup, category, location } = params

  // Multi-location is additive + flag-gated. When OFF (default / un-migrated tenant)
  // nothing below changes the existing single-location behaviour.
  const config = await getBusinessConfig()
  const multiLocation = config.multi_location_enabled === true
  const locations: Location[] = multiLocation ? await getActiveLocations() : []
  const selectedLocation = multiLocation && location && UUID_RE.test(location) ? location : undefined

  const schemaCars = await getAllCarsForSchema()
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Rental Fleet',
    description: 'Available vehicles for hire.',
    numberOfItems: schemaCars.length,
    itemListElement: schemaCars.map((car, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${car.brand} ${car.model} ${car.year}`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/fleet/${car.slug}`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="border-b border-border bg-white pt-12 pb-8 md:pt-16 md:pb-10">
        <div className="mx-auto max-w-7xl px-6">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-2">Autóink</p>
          <h1 className="font-display text-4xl font-bold text-gray-900 tracking-tight md:text-5xl">
            {start && end ? 'Szabad autók' : 'Autóink Szegeden'}
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border bg-white sticky top-16 z-30">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <Suspense>
            <FleetFilters
              initialStart={start}
              initialEnd={end}
              initialPickup={pickup}
              initialCategory={category}
              locations={multiLocation ? locations.map((l) => ({ id: l.id, name: l.name })) : undefined}
              initialLocation={selectedLocation}
            />
          </Suspense>
        </div>
      </div>

      {/* Grid with skeleton fallback */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <Suspense fallback={<FleetGridSkeleton />}>
          <AvailableCarsGrid start={start} end={end} pickup={pickup} category={category} location={selectedLocation} />
        </Suspense>
      </div>
    </div>
    </>
  )
}
