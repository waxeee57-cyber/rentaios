import type { Metadata } from 'next'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import { formatPrice } from '@/lib/formatters'
import { TrackEventOnMount } from '@/components/TrackEventOnMount'
import { DemoTabs } from '@/app/(demo)/DemoTabs'
import { DemoConversionBar } from './DemoConversionBar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Demo Fleet',
  description: 'Explore the RentalOS demo. See how the fleet browsing and booking experience works.',
  robots: { index: false },
}

type CarPhoto = { url: string; alt: string }

type DemoCar = {
  id: string
  slug: string
  brand: string
  model: string
  year: number
  category: string
  daily_price_eur: number
  deposit_eur: number
  photos: CarPhoto[]
  features: string[]
}

type FleetResult =
  | { ok: true; cars: DemoCar[] }
  | { ok: false; cars: [] }

async function getDemoCars(): Promise<FleetResult> {
  try {
    const { data, error } = await supabaseAdmin
      .from('cars')
      .select('id, slug, brand, model, year, category, daily_price_eur, deposit_eur, photos, features')
      .eq('is_demo', true)
      .eq('status', 'available')
    if (error) {
      console.error('[demo fleet] supabase error:', error.message)
      return { ok: false, cars: [] }
    }
    return { ok: true, cars: (data ?? []) as DemoCar[] }
  } catch (e) {
    console.error('[demo fleet] unexpected error:', e instanceof Error ? e.message : String(e))
    return { ok: false, cars: [] }
  }
}

export default async function DemoFleetPage() {
  const result = await getDemoCars()

  return (
    <>
    <div className="mx-auto max-w-5xl px-6 py-16">
      <TrackEventOnMount event="demo_view" />
      <DemoTabs active="fleet" />
      <div className="mb-12">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-3">Demo fleet</p>
        <h1 className="font-display text-4xl font-bold text-gray-900 tracking-tight">Sample vehicles</h1>
        <p className="font-sans text-sm text-muted mt-3">
          This is how your fleet page looks. Your vehicles, your branding.
        </p>
      </div>

      {!result.ok ? (
        <div className="rounded-md border border-border bg-white shadow-sm p-12 text-center">
          <p className="font-sans text-sm text-gray-900 mb-2">Demo is loading…</p>
          <p className="font-sans text-xs text-muted mb-6">
            The demo fleet initialises daily. Check back in a moment or start your free trial now.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center min-h-[44px] rounded-md bg-gold px-8 font-sans text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Start free trial
          </Link>
        </div>
      ) : result.cars.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-12 text-center">
          <p className="font-sans text-sm text-muted mb-2">Demo vehicles are being seeded.</p>
          <p className="font-sans text-xs text-muted/60 mb-6">
            The fleet resets daily. Try again shortly or explore pricing to get started.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center min-h-[44px] rounded-md bg-gold px-8 font-sans text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Start free trial
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.cars.map(car => {
            const photos = Array.isArray(car.photos) ? car.photos : []
            const thumb = photos[0]
            return (
              <Link
                key={car.id}
                href={`/demo/fleet/${car.slug}`}
                className="group block rounded-md border border-border bg-white shadow-sm overflow-hidden
                  hover:border-gold/20 transition-colors"
              >
                {/* Photo */}
                <div className="aspect-[4/3] bg-surface overflow-hidden">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb.url}
                      alt={thumb.alt || `${car.brand} ${car.model}`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-sans text-xs text-muted/40">{car.brand}</span>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-5">
                  <p className="font-display text-lg font-bold text-gray-900">{car.brand} {car.model}</p>
                  <p className="font-sans text-xs text-muted mt-0.5 mb-4">{car.year} · {car.category}</p>
                  <div className="flex items-center justify-between">
                    <p className="font-sans text-sm text-gray-900">{formatPrice(car.daily_price_eur)}<span className="text-muted text-xs ml-1">/day</span></p>
                    <span className="font-sans text-xs text-gold group-hover:underline underline-offset-4">View details →</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <div className="mt-16 border-t border-border pt-12 text-center">
        <p className="font-sans text-sm text-muted mb-6">
          Ready to run your own fleet like this?
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/onboarding" className="inline-flex items-center min-h-[44px] rounded-md bg-gold px-8 font-sans text-sm font-medium text-white hover:opacity-90 transition-opacity">
            Get this for your business →
          </Link>
          <Link href="/demo/admin" className="inline-flex items-center min-h-[44px] rounded-md border border-border px-8 font-sans text-sm text-muted hover:border-gold/30 hover:text-gray-900 transition-colors">
            View admin panel →
          </Link>
        </div>
      </div>

    </div>
    <DemoConversionBar />
    </>
  )
}
