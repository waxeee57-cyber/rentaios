import type { Metadata } from 'next'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import { formatPrice } from '@/lib/formatters'
import { TrackEventOnMount } from '@/components/TrackEventOnMount'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Demo Fleet — RentalOS',
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

async function getDemoCars(): Promise<DemoCar[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('cars')
      .select('id, slug, brand, model, year, category, daily_price_eur, deposit_eur, photos, features')
      .eq('is_demo', true)
      .eq('status', 'available')
    if (error) return []
    return (data ?? []) as DemoCar[]
  } catch {
    return []
  }
}

export default async function DemoFleetPage() {
  const cars = await getDemoCars()

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <TrackEventOnMount event="demo_view" />
      <div className="mb-12">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-3">Demo fleet</p>
        <h1 className="font-display text-4xl font-light text-white tracking-tight">Sample vehicles</h1>
        <p className="font-sans text-sm text-muted mt-3">
          This is how your fleet page looks. Your vehicles, your branding.
        </p>
      </div>

      {cars.length === 0 ? (
        <div className="rounded-md border border-dashed border-white/10 p-12 text-center">
          <p className="font-sans text-sm text-muted mb-2">Demo data not seeded yet.</p>
          <p className="font-sans text-xs text-muted/60">
            Run <code className="font-mono text-gold">supabase/migrations/07_demo_mode.sql</code> then <code className="font-mono text-gold">supabase/demo-seed.sql</code>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map(car => {
            const photos = Array.isArray(car.photos) ? car.photos : []
            const thumb = photos[0]
            return (
              <Link
                key={car.id}
                href={`/demo/fleet/${car.slug}`}
                className="group block rounded-md border border-white/5 bg-white/[0.02] overflow-hidden
                  hover:border-gold/20 transition-colors"
              >
                {/* Photo */}
                <div className="aspect-[4/3] bg-graphite/40 overflow-hidden">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb.url}
                      alt={thumb.alt || `${car.brand} ${car.model}`}
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
                  <p className="font-display text-lg font-light text-white">{car.brand} {car.model}</p>
                  <p className="font-sans text-xs text-muted mt-0.5 mb-4">{car.year} · {car.category}</p>
                  <div className="flex items-center justify-between">
                    <p className="font-sans text-sm text-white">{formatPrice(car.daily_price_eur)}<span className="text-muted text-xs ml-1">/day</span></p>
                    <span className="font-sans text-xs text-gold group-hover:underline underline-offset-4">View details →</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <div className="mt-16 border-t border-white/5 pt-12 text-center">
        <p className="font-sans text-sm text-muted mb-6">
          Ready to run your own fleet like this?
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/pricing" className="inline-flex items-center min-h-[44px] rounded-md bg-gold px-8 font-sans text-sm font-medium text-black hover:opacity-90 transition-opacity">
            Start free trial
          </Link>
          <Link href="/sell" className="inline-flex items-center min-h-[44px] rounded-md border border-white/10 px-8 font-sans text-sm text-white hover:border-gold/30 transition-colors">
            Buy the template
          </Link>
        </div>
      </div>
    </div>
  )
}
