'use client'

import { useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { format, differenceInCalendarDays } from 'date-fns'
import { type DateRange } from 'react-day-picker'
import { Users, Zap, Fuel, Gauge, User, IdCard, AlertTriangle, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { DateRangePicker } from '@/components/booking/DateRangePicker'
import { CostBreakdown } from '@/components/booking/CostBreakdown'
import { MobileStickyCTA } from '@/components/booking/MobileStickyCTA'

const InquiryDrawer = dynamic(
  () => import('@/components/booking/InquiryDrawer').then((m) => m.InquiryDrawer),
  { ssr: false, loading: () => null }
)
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatPrice } from '@/lib/formatters'
import { buildCarInquiryLink } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { PICKUP_LOCATIONS, DEFAULT_PICKUP, categoryLabel } from '@/lib/locations'

interface Car {
  id: string
  slug: string
  brand: string
  model: string
  year: number
  category: string
  daily_price_eur: number
  deposit_eur: number
  mileage_included_per_day: number
  extra_km_price_eur: number
  min_driver_age: number
  min_license_years: number
  transmission: string
  fuel: string
  seats: number
  description: string
  photos: Array<{ url: string; alt: string }>
  features: string[]
}

interface CarDetailClientProps {
  car: Car
  initialStart?: string
  initialEnd?: string
  initialPickup?: string
  initialAvailable: boolean
}

export function CarDetailClient({
  car,
  initialStart,
  initialEnd,
  initialPickup,
  initialAvailable,
}: CarDetailClientProps) {
  const router = useRouter()

  const [range, setRange] = useState<DateRange | undefined>(
    initialStart && initialEnd
      ? { from: new Date(initialStart), to: new Date(initialEnd) }
      : undefined
  )
  const [pickup, setPickup] = useState(initialPickup ?? DEFAULT_PICKUP)
  const [photoIdx, setPhotoIdx] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isAvailable, setIsAvailable] = useState(initialAvailable)
  const [checking, setChecking] = useState(false)

  const days = range?.from && range?.to
    ? differenceInCalendarDays(range.to, range.from)
    : 0

  const startStr = range?.from ? format(range.from, 'yyyy-MM-dd') : ''
  const endStr = range?.to ? format(range.to, 'yyyy-MM-dd') : ''

  const checkAvailability = useCallback(async (start: string, end: string) => {
    setChecking(true)
    try {
      const res = await fetch(`/api/cars/${car.slug}/availability?start=${start}&end=${end}`)
      const data = await res.json()
      setIsAvailable(data.available)
    } catch {
      setIsAvailable(true)
    } finally {
      setChecking(false)
    }
  }, [car.slug])

  const handleRangeChange = (r: DateRange | undefined) => {
    setRange(r)
    if (r?.from && r?.to) {
      const s = format(r.from, 'yyyy-MM-dd')
      const e = format(r.to, 'yyyy-MM-dd')
      checkAvailability(s, e)
      const params = new URLSearchParams({ start: s, end: e, pickup })
      router.replace(`/fleet/${car.slug}?${params.toString()}`, { scroll: false })
    }
  }

  const whatsappHref = buildCarInquiryLink({
    carLabel: `${car.brand} ${car.model} ${car.year}`,
    startDate: startStr,
    endDate: endStr,
    pickupLocation: pickup,
    totalFormatted: days > 0 ? formatPrice(car.daily_price_eur * days) : 'TBD',
  })

  const photos = car.photos ?? []
  const currentPhoto = photos[photoIdx]

  const canReserve = days > 0 && isAvailable && !checking

  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setPhotoIdx(prev => (prev + 1) % photos.length)
      } else {
        setPhotoIdx(prev => (prev - 1 + photos.length) % photos.length)
      }
    }
  }

  return (
    <>
      <div className="min-h-screen bg-black pb-24 md:pb-0">
        {/* Gallery */}
        <div
          className="relative h-[50vh] min-h-[320px] max-h-[520px] bg-graphite gallery-3d"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {currentPhoto ? (
            <Image
              src={currentPhoto.url}
              alt={currentPhoto.alt}
              fill
              className="object-cover gallery-3d-img"
              style={{ objectPosition: 'center 65%' }}
              priority
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-muted font-sans text-sm">No photo</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Previous arrow */}
          {photos.length > 1 && (
            <button
              onClick={() => setPhotoIdx(prev => (prev - 1 + photos.length) % photos.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 hidden md:flex
                items-center justify-center w-10 h-10 rounded-md
                bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Next arrow */}
          {photos.length > 1 && (
            <button
              onClick={() => setPhotoIdx(prev => (prev + 1) % photos.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex
                items-center justify-center w-10 h-10 rounded-md
                bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* Image counter */}
          {photos.length > 1 && (
            <div
              aria-live="polite"
              aria-atomic="true"
              className="absolute top-3 right-3 bg-black/60 text-white
                font-sans text-xs px-2.5 py-1 rounded-sm z-10 tabular-nums"
            >
              {photoIdx + 1} / {photos.length}
            </div>
          )}

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto scrollbar-none">
              {photos.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIdx(i)}
                  aria-label={`View photo ${i + 1} of ${photos.length}${p.alt ? `: ${p.alt}` : ''}`}
                  className={cn(
                    'h-12 w-16 overflow-hidden rounded-sm border-2 transition-all shrink-0',
                    i === photoIdx ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                >
                  <Image src={p.url} alt="" width={64} height={48} className="object-cover h-full w-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
            {/* Left — info */}
            <div className="space-y-10">
              {/* Title */}
              <div>
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-2">{categoryLabel(car.category)}</p>
                <h1 className="font-display text-5xl font-light text-white tracking-tight">
                  {car.brand} {car.model}
                </h1>
                <p className="font-sans text-sm text-muted mt-1">{car.year}</p>
              </div>

              {/* Description */}
              {car.description && (
                <p className="font-sans text-base leading-relaxed text-muted max-w-2xl">
                  {car.description}
                </p>
              )}

              {/* Specs */}
              <div>
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-4">Műszaki adatok</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { icon: Zap, label: 'Váltó', value: car.transmission },
                    { icon: Fuel, label: 'Üzemanyag', value: car.fuel },
                    { icon: Users, label: 'Férőhely', value: String(car.seats) },
                    { icon: Gauge, label: 'Napi km-keret', value: `${car.mileage_included_per_day} km` },
                    { icon: User, label: 'Min. életkor', value: `${car.min_driver_age} év` },
                    { icon: IdCard, label: 'Jogosítvány', value: `${car.min_license_years} év` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-md border border-border bg-graphite p-4">
                      <p className="text-[10px] font-sans uppercase tracking-[0.15em] text-muted mb-1">{label}</p>
                      <p className="font-sans text-sm font-medium text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              {car.features?.length > 0 && (
                <div>
                  <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-4">Felszereltség</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {car.features.map((f: string) => (
                      <div key={f} className="flex items-center gap-2.5">
                        <span className="h-1 w-1 rounded-full bg-gold shrink-0" />
                        <span className="font-sans text-sm text-muted">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right — sticky price block (desktop) */}
            <div className="hidden lg:block">
              <div className="sticky top-24 rounded-lg border border-border bg-graphite p-6 space-y-5">
                {/* Price */}
                <div>
                  <p className="font-sans text-2xl font-medium text-gold">
                    {formatPrice(car.daily_price_eur)}
                    <span className="text-base font-normal text-muted ml-1">/ nap</span>
                  </p>
                </div>

                {/* Date picker */}
                <div className="space-y-1.5" role="group" aria-labelledby="label-dates">
                  <p id="label-dates" className="text-[10px] font-sans uppercase tracking-[0.15em] text-muted">Időpont</p>
                  <DateRangePicker
                    value={range}
                    onChange={handleRangeChange}
                    placeholder="Válasszon dátumot"
                    maxDays={14}
                  />
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label htmlFor="pickup-select" className="text-[10px] font-sans uppercase tracking-[0.15em] text-muted">Átvétel helye</label>
                  <Select value={pickup} onValueChange={setPickup}>
                    <SelectTrigger id="pickup-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PICKUP_LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Availability banner */}
                {days > 0 && !isAvailable && (
                  <div className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger/10 px-3 py-3">
                    <AlertTriangle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                    <p className="font-sans text-xs text-danger">
                      Ezekre a napokra nem elérhető. Válasszon másik időpontot, vagy írjon nekünk.
                    </p>
                  </div>
                )}

                {/* Cost breakdown */}
                {days > 0 && isAvailable && (
                  <CostBreakdown
                    dailyRate={car.daily_price_eur}
                    days={days}
                    depositEur={car.deposit_eur}
                  />
                )}

                {/* CTAs */}
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => setDrawerOpen(true)}
                    disabled={checking}
                  >
                    {checking ? 'Ellenőrzés...' : 'Foglalom ezt az autót'}
                  </Button>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex h-12 items-center justify-center gap-2 rounded-md px-4',
                      'bg-whatsapp text-white text-xs font-sans font-medium uppercase tracking-widest',
                      'hover:opacity-90 transition-opacity shrink-0'
                    )}
                  >
                    <MessageCircle className="h-4 w-4 fill-white stroke-none" />
                    WhatsApp
                  </a>
                </div>

                <p className="text-center text-[11px] font-sans text-muted">
                  A foglalásokat személyesen visszaigazoljuk. Fizetés átvételkor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <MobileStickyCTA
        carLabel={`${car.brand} ${car.model}`}
        dailyRate={car.daily_price_eur}
        days={days || undefined}
        whatsappHref={whatsappHref}
        onReserve={() => setDrawerOpen(true)}
        isAvailable={canReserve || days === 0}
      />

      {/* Inquiry drawer */}
      {drawerOpen && (
        <InquiryDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          car={{
            slug: car.slug,
            brand: car.brand,
            model: car.model,
            daily_price_eur: car.daily_price_eur,
            deposit_eur: car.deposit_eur,
          }}
          startDate={startStr}
          endDate={endStr}
          days={days}
          pickupLocation={pickup}
        />
      )}
    </>
  )
}
