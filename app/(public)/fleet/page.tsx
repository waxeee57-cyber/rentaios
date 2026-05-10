export const revalidate = 60

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import { FleetGrid } from '@/components/marketing/FleetGrid'
import { FleetFilters } from '@/components/marketing/FleetFilters'

export const metadata: Metadata = {
  title: 'Fleet',
  description: 'Browse our rental fleet. Hotel delivery included.',
}

interface PageProps {
  searchParams: Promise<{ start?: string; end?: string; pickup?: string; category?: string }>
}

async function getAvailableCars(startDate?: string, endDate?: string, category?: string) {
  let query = supabaseAdmin
    .from('cars')
    .select('id, slug, brand, model, year, category, daily_price_eur, deposit_eur, transmission, fuel, seats, photos')
    .eq('status', 'available')
    .order('daily_price_eur', { ascending: false })

  if (category) {
    query = query.eq('category', category)
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
        <div key={i} className="rounded-lg border border-border bg-graphite overflow-hidden animate-pulse">
          <div className="aspect-[16/9] bg-white/5" />
          <div className="p-6 space-y-3">
            <div className="h-7 w-48 rounded bg-white/5" />
            <div className="h-4 w-16 rounded bg-white/5" />
            <div className="mt-4 flex gap-4">
              <div className="h-4 w-20 rounded bg-white/5" />
              <div className="h-4 w-20 rounded bg-white/5" />
              <div className="h-4 w-12 rounded bg-white/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

async function AvailableCarsGrid({ start, end, pickup, category }: { start?: string; end?: string; pickup?: string; category?: string }) {
  const cars = await getAvailableCars(start, end, category)
  return (
    <>
      {start && end && (
        <p className="mb-6 font-sans text-sm text-muted">
          {cars.length === 0
            ? 'No cars available for these dates.'
            : `${cars.length} car${cars.length !== 1 ? 's' : ''} available`}
        </p>
      )}
      <FleetGrid
        cars={cars}
        startDate={start}
        endDate={end}
        pickupLocation={pickup}
        emptyMessage="No cars available for these dates. Try adjusting your dates or message us on WhatsApp."
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
  const { start, end, pickup, category } = params

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
    <div className="min-h-screen bg-black">
      {/* Page header */}
      <div className="border-b border-border bg-black pt-12 pb-8 md:pt-16 md:pb-10">
        <div className="mx-auto max-w-7xl px-6">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-2">Our Fleet</p>
          <h1 className="font-display text-4xl font-light text-white tracking-tight md:text-5xl">
            {start && end ? 'Available cars' : 'Our Fleet'}
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border bg-black sticky top-16 z-30">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <Suspense>
            <FleetFilters
              initialStart={start}
              initialEnd={end}
              initialPickup={pickup}
              initialCategory={category}
            />
          </Suspense>
        </div>
      </div>

      {/* Grid with skeleton fallback */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <Suspense fallback={<FleetGridSkeleton />}>
          <AvailableCarsGrid start={start} end={end} pickup={pickup} category={category} />
        </Suspense>
      </div>
    </div>
    </>
  )
}
