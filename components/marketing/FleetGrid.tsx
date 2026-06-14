import { CarCard } from './CarCard'
import { buildWhatsAppLink, isWhatsAppConfigured } from '@/lib/whatsapp'

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

interface FleetGridProps {
  cars: Car[]
  startDate?: string
  endDate?: string
  pickupLocation?: string
  location?: string
  emptyMessage?: string
}

export function FleetGrid({ cars, startDate, endDate, pickupLocation, location, emptyMessage }: FleetGridProps) {
  if (cars.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="font-sans text-muted">
          {emptyMessage ?? 'No cars available for these dates.'}
        </p>
        {isWhatsAppConfigured() && (
          <a
            href={buildWhatsAppLink('Hi, I\'d like to discuss car availability.')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-sans text-gold underline-offset-4 hover:underline"
          >
            Message us on WhatsApp to discuss alternatives
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {cars.map((car, index) => (
        <CarCard
          key={car.slug}
          car={car}
          startDate={startDate}
          endDate={endDate}
          pickupLocation={pickupLocation}
          location={location}
          priority={index === 0}
        />
      ))}
    </div>
  )
}
