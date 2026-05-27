import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { formatPrice } from '@/lib/formatters'
import { DemoInquiryForm } from './DemoInquiryForm'

export const dynamic = 'force-dynamic'

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
  description: string | null
}

async function getDemoCar(slug: string): Promise<DemoCar | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('cars')
      .select('id, slug, brand, model, year, category, daily_price_eur, deposit_eur, photos, features, description')
      .eq('slug', slug)
      .eq('is_demo', true)
      .single()
    if (error) return null
    return (data as DemoCar | null) ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const car = await getDemoCar(slug)
  if (!car) return { title: 'Demo Vehicle' }
  return {
    title: `Demo: ${car.brand} ${car.model}`,
    robots: { index: false },
  }
}

export default async function DemoCarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const car = await getDemoCar(slug)
  if (!car) notFound()

  const photos = Array.isArray(car.photos) ? car.photos : []
  const features = Array.isArray(car.features) ? car.features as string[] : []

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* Back */}
      <Link href="/demo/fleet" className="inline-flex items-center gap-1.5 font-sans text-xs text-muted hover:text-gray-900 transition-colors mb-10">
        â† Back to demo fleet
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Photos */}
        <div>
          <div className="aspect-[4/3] rounded-md overflow-hidden bg-surface mb-3">
            {photos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos[0].url} alt={photos[0].alt || `${car.brand} ${car.model}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-sans text-xs text-muted/40">{car.brand}</span>
              </div>
            )}
          </div>
          {photos.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.slice(1, 4).map((photo, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <div key={i} className="aspect-[4/3] rounded-md overflow-hidden bg-surface">
                  <img src={photo.url} alt={photo.alt || ''} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-2">{car.year} Â· {car.category}</p>
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">{car.brand} {car.model}</h1>
          <p className="font-sans text-2xl text-gray-900 mb-1">{formatPrice(car.daily_price_eur)}<span className="text-muted text-sm ml-1">/day</span></p>
          <p className="font-sans text-xs text-muted mb-8">Deposit: {formatPrice(car.deposit_eur)} (refundable)</p>

          {car.description && (
            <p className="font-sans text-sm text-muted leading-relaxed mb-8">{car.description}</p>
          )}

          {features.length > 0 && (
            <div className="mb-8">
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Features</p>
              <div className="flex flex-wrap gap-2">
                {features.map((f, i) => (
                  <span key={i} className="rounded-sm border border-border px-3 py-1 font-sans text-xs text-muted">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          <DemoInquiryForm carName={`${car.brand} ${car.model}`} />
        </div>
      </div>
    </div>
  )
}
