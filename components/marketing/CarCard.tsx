import Image from 'next/image'
import Link from 'next/link'
import { Users, Zap, Fuel } from 'lucide-react'
import { formatPrice, formatPriceDecimals } from '@/lib/formatters'
import { categoryLabel } from '@/lib/locations'
import { differenceInCalendarDays } from 'date-fns'

interface Car {
  slug: string
  brand: string
  model: string
  year: number
  category: string
  daily_price_eur: number
  transmission: string
  fuel: string
  seats: number
  photos: Array<{ url: string; alt: string }>
}

interface CarCardProps {
  car: Car
  startDate?: string
  endDate?: string
  pickupLocation?: string
  location?: string
  priority?: boolean
}

export function CarCard({ car, startDate, endDate, pickupLocation, location, priority = false }: CarCardProps) {
  const hasDates = !!(startDate && endDate)
  const days = hasDates
    ? differenceInCalendarDays(new Date(endDate), new Date(startDate))
    : 0
  const total = days * car.daily_price_eur

  const searchParams = new URLSearchParams()
  if (startDate) searchParams.set('start', startDate)
  if (endDate) searchParams.set('end', endDate)
  if (pickupLocation) searchParams.set('pickup', pickupLocation)
  if (location) searchParams.set('location', location)
  const href = `/fleet/${car.slug}${searchParams.size ? `?${searchParams.toString()}` : ''}`

  const photo = car.photos?.[0]

  return (
    <Link href={href} className="group block">
      <div className="rounded-lg border border-border bg-white shadow-sm overflow-hidden card-3d">
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-black">
          {photo ? (
            <Image
              src={photo.url}
              alt={photo.alt}
              fill
              className="object-cover img-zoom"
              style={{ objectPosition: 'center 65%' }}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-graphite">
              <span className="text-muted text-sm font-sans">No photo</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Category chip */}
          <div className="absolute top-3 left-3">
            <span className="rounded-sm bg-black/70 px-2 py-1 text-[10px] font-sans uppercase tracking-[0.15em] text-muted backdrop-blur-sm">
              {categoryLabel(car.category)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl font-medium text-gray-900 tracking-tight">
                {car.brand} {car.model}
              </h3>
              <p className="font-sans text-xs text-muted mt-0.5">{car.year}</p>
            </div>

            {/* Price */}
            <div className="text-right shrink-0">
              {hasDates ? (
                <>
                  <p className="font-sans text-lg font-medium text-gold tabular-nums">
                    {formatPriceDecimals(total)}
                  </p>
                  <p className="font-sans text-xs text-muted mt-0.5">
                    {days} nap
                  </p>
                </>
              ) : (
                <>
                  <p className="font-sans text-base font-medium text-gold">
                    {formatPrice(car.daily_price_eur)}
                  </p>
                  <p className="font-sans text-xs text-muted mt-0.5">/ nap</p>
                </>
              )}
            </div>
          </div>

          <p className="font-sans text-[11px] text-muted mt-2.5">
            Biztosítással · Belföldi autópályadíj az árban · Rejtett költségek nélkül
          </p>

          {/* Specs */}
          <div className="mt-4 flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs font-sans text-muted">
              <Zap className="h-3.5 w-3.5 text-gold/60" />
              {car.transmission}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-sans text-muted">
              <Fuel className="h-3.5 w-3.5 text-gold/60" />
              {car.fuel}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-sans text-muted">
              <Users className="h-3.5 w-3.5 text-gold/60" />
              {car.seats}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
