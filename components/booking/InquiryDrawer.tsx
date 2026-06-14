'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, MessageCircle, MapPin } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, addDays, differenceInCalendarDays, parseISO } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { type DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRangePicker } from './DateRangePicker'
import { CostBreakdown } from './CostBreakdown'
import { formatDate, formatPriceDecimals, TZ } from '@/lib/formatters'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { PICKUP_LOCATIONS } from '@/lib/locations'

const PICKUP_TIMES = Array.from({ length: 29 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8
  const min = (i % 2) * 30
  return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
})

const COUNTRIES = [
  'Magyarország', 'Románia', 'Szerbia', 'Szlovákia', 'Ausztria', 'Németország',
  'Horvátország', 'Szlovénia', 'Ukrajna', 'Egyéb',
]

const schema = z.object({
  full_name:          z.string().min(2, 'Név megadása kötelező'),
  email:              z.string().email('Érvényes e-mail szükséges'),
  phone:              z.string().min(5, 'Telefonszám megadása kötelező'),
  country:            z.string().min(1, 'Ország megadása kötelező'),
  pickup_location:    z.string().min(1, 'Átvételi hely megadása kötelező'),
  pickup_time:        z.string().min(1, 'Időpont megadása kötelező'),
  message:            z.string().optional(),
  transfer_requested: z.boolean(),
  transfer_address:   z.string().optional(),
}).refine(
  (d) => !d.transfer_requested || (d.transfer_address ?? '').trim().length > 0,
  { message: 'Kiszállítási cím megadása kötelező', path: ['transfer_address'] }
)

type FormData = z.infer<typeof schema>

interface InquiryDrawerProps {
  open: boolean
  onClose: () => void
  car: {
    slug: string
    brand: string
    model: string
    daily_price_eur: number
    deposit_eur: number
  }
  startDate: string
  endDate: string
  days: number
  pickupLocation: string
  // Multi-location (additive): when true, the pickup dropdown lists telephelyek
  // and the booking is saved with pickup/dropoff location FKs.
  multiLocation?: boolean
  locations?: Array<{ id: string; name: string }>
  locationId?: string
}

export function InquiryDrawer({
  open,
  onClose,
  car,
  startDate,
  endDate,
  pickupLocation,
  multiLocation = false,
  locations = [],
  locationId,
}: InquiryDrawerProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [errorCount, setErrorCount] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Date state — initialised from props, editable inside the drawer
  const todayStr = formatInTimeZone(new Date(), TZ, 'yyyy-MM-dd')
  const [drawerStart, setDrawerStart] = useState(startDate)
  const [drawerEnd, setDrawerEnd] = useState(endDate)
  const [drawerRange, setDrawerRange] = useState<DateRange | undefined>(
    startDate && endDate
      ? { from: parseISO(startDate), to: parseISO(endDate) }
      : undefined
  )

  const drawerDays =
    drawerStart && drawerEnd
      ? Math.max(0, differenceInCalendarDays(parseISO(drawerEnd), parseISO(drawerStart)))
      : 0

  const minEndStr = drawerStart
    ? format(addDays(parseISO(drawerStart), 1), 'yyyy-MM-dd')
    : todayStr
  const maxEndStr = drawerStart
    ? format(addDays(parseISO(drawerStart), 14), 'yyyy-MM-dd')
    : ''

  const handleMobileStartChange = (val: string) => {
    setDrawerStart(val)
    // Clear end if it falls outside the new valid range
    if (drawerEnd && val) {
      const diff = differenceInCalendarDays(parseISO(drawerEnd), parseISO(val))
      if (diff <= 0 || diff > 14) setDrawerEnd('')
    }
  }

  const handleDesktopRangeChange = (r: DateRange | undefined) => {
    setDrawerRange(r)
    setDrawerStart(r?.from ? format(r.from, 'yyyy-MM-dd') : '')
    setDrawerEnd(r?.to ? format(r.to, 'yyyy-MM-dd') : '')
  }

  const useLocations = multiLocation && locations.length > 0
  const locName = (id: string): string => locations.find((l) => l.id === id)?.name ?? ''
  const initialLoc = locationId && locations.some((l) => l.id === locationId) ? locationId : (locations[0]?.id ?? '')
  const [selectedLoc, setSelectedLoc] = useState(initialLoc)

  const defaultPickup = useLocations
    ? locName(initialLoc)
    : (PICKUP_LOCATIONS.includes(pickupLocation) ? pickupLocation : PICKUP_LOCATIONS[0])

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      pickup_location: defaultPickup,
      transfer_requested: false,
    },
  })

  const transferRequested = watch('transfer_requested')

  const onSubmit = async (data: FormData) => {
    if (!drawerStart || !drawerEnd || drawerDays <= 0) {
      setErrorMsg('Kérjük, válassza ki az átvétel és a visszahozás dátumát.')
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/inquiries/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          car_slug: car.slug,
          start_date: drawerStart,
          end_date: drawerEnd,
          // Only sent when multi-location is on; the API stores the FKs and the
          // text pickup_location stays the telephely name (back-compat).
          ...(useLocations && selectedLoc ? { pickup_location_id: selectedLoc, dropoff_location_id: selectedLoc } : {}),
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setErrorCount((c) => c + 1)
        setErrorMsg(json.error ?? 'Hiba történt. Kérjük, próbálja újra.')
        setSubmitting(false)
        return
      }

      onClose()
      router.push(`/booking/${json.booking_code}?email=${encodeURIComponent(data.email)}`)
    } catch {
      setErrorCount((c) => c + 1)
      setErrorMsg('Kapcsolati hiba. Kérjük, próbálja újra.')
      setSubmitting(false)
    }
  }

  if (!open) return null

  const headerSubtitle = drawerStart && drawerEnd
    ? `${formatDate(drawerStart)} → ${formatDate(drawerEnd)} · ${transferRequested ? 'Egyedi kiszállítás' : pickupLocation}`
    : `Válasszon dátumot · ${transferRequested ? 'Egyedi kiszállítás' : pickupLocation}`

  const waMessage = `Üdv, szeretném igényelni a(z) ${car.brand} ${car.model} autót${drawerStart ? `, ${formatDate(drawerStart)} – ${drawerEnd ? formatDate(drawerEnd) : '...'}` : ''}.`

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-drawer-title"
        className={cn(
          'fixed z-50 bg-graphite border-l border-border flex flex-col',
          'bottom-0 inset-x-0 rounded-t-lg max-h-[90vh] md:inset-x-auto md:right-0 md:top-0 md:bottom-0 md:w-[480px] md:rounded-none',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5 shrink-0">
          <div>
            <h2 id="inquiry-drawer-title" className="font-display text-xl font-medium text-white">
              Foglalás: {car.brand} {car.model}
            </h2>
            <p className="mt-0.5 font-sans text-xs text-muted">
              {headerSubtitle}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center text-muted hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Date selection — mobile: native inputs, desktop: calendar picker */}
          <div className="space-y-2">
            <p className="text-[10px] font-sans uppercase tracking-[0.15em] text-muted">Időpont</p>

            {/* Mobile */}
            <div className="md:hidden space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="start-date-mobile">Átvétel dátuma</Label>
                <input
                  id="start-date-mobile"
                  type="date"
                  value={drawerStart}
                  min={todayStr}
                  onChange={(e) => handleMobileStartChange(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className="w-full h-12 rounded-md border border-border bg-black px-4
                    text-white font-sans text-sm
                    focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-date-mobile">Visszahozás dátuma</Label>
                <input
                  id="end-date-mobile"
                  type="date"
                  value={drawerEnd}
                  min={minEndStr}
                  max={maxEndStr || undefined}
                  disabled={!drawerStart}
                  onChange={(e) => setDrawerEnd(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className={cn(
                    'w-full h-12 rounded-md border border-border bg-black px-4',
                    'text-white font-sans text-sm',
                    'focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold',
                    !drawerStart && 'opacity-40 cursor-not-allowed'
                  )}
                />
              </div>
              {drawerStart && drawerEnd && drawerDays > 0 && (
                <p className="text-xs font-sans text-gold">
                  {drawerDays} nap · {formatPriceDecimals(drawerDays * car.daily_price_eur)} becsült összesen
                </p>
              )}
            </div>

            {/* Desktop */}
            <div className="hidden md:block">
              <DateRangePicker
                value={drawerRange}
                onChange={handleDesktopRangeChange}
                maxDays={14}
              />
            </div>
          </div>

          {/* Cost reference */}
          <div className="space-y-2">
            <p className="text-[10px] font-sans uppercase tracking-[0.15em] text-muted">Árajánlat</p>
            {drawerDays > 0 ? (
              <CostBreakdown
                dailyRate={car.daily_price_eur}
                days={drawerDays}
                depositEur={car.deposit_eur}
                transferRequested={transferRequested}
              />
            ) : (
              <div className="rounded-md border border-border bg-black/40 px-4 py-3">
                <p className="font-sans text-sm text-muted">Válasszon dátumot az ár megtekintéséhez</p>
              </div>
            )}
          </div>

          {/* Form */}
          <form id="inquiry-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Teljes név</Label>
              <Input
                id="full_name"
                placeholder="A személyi okmány szerint"
                {...register('full_name')}
              />
              {errors.full_name && (
                <p className="text-xs font-sans text-danger">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs font-sans text-danger">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefon (országkóddal)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+36 30 123 4567"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-xs font-sans text-danger">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Lakóhely országa</Label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Válasszon országot" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.country && (
                <p className="text-xs font-sans text-danger">{errors.country.message}</p>
              )}
            </div>

            {/* Pickup location — hidden when transfer is on */}
            {!transferRequested && (
              <div className="space-y-1.5">
                <Label>{useLocations ? 'Telephely' : 'Átvétel helye'}</Label>
                {useLocations ? (
                  <Select
                    value={selectedLoc}
                    onValueChange={(v) => { setSelectedLoc(v); setValue('pickup_location', locName(v)) }}
                  >
                    <SelectTrigger>
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gold shrink-0" />
                        <SelectValue placeholder="Válasszon telephelyet" />
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Controller
                    name="pickup_location"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value ?? ''} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gold shrink-0" />
                            <SelectValue placeholder="Válasszon helyet" />
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {PICKUP_LOCATIONS.map((loc) => (
                            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {errors.pickup_location && (
                  <p className="text-xs font-sans text-danger">{errors.pickup_location.message}</p>
                )}
              </div>
            )}

            {/* Transfer toggle */}
            <div className="rounded-md border border-border bg-black/30 px-4 py-3 space-y-3">
              <Controller
                name="transfer_requested"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center justify-between cursor-pointer select-none gap-4">
                    <div>
                      <p className="font-sans text-sm text-white">Kiszállítás megadott címre</p>
                      <p className="font-sans text-xs text-muted mt-0.5">
                        Kiszállítási díj kerülhet felszámításra. A pontos összeget a foglalás
                        véglegesítése előtt visszaigazoljuk.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={field.value}
                      onClick={() => field.onChange(!field.value)}
                      className={cn(
                        'relative shrink-0 h-6 w-11 rounded-full transition-colors duration-200',
                        field.value ? 'bg-gold' : 'bg-border'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200',
                          field.value ? 'translate-x-5' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </label>
                )}
              />

              {transferRequested && (
                <div className="space-y-1.5">
                  <Input
                    placeholder="Adja meg a pontos kiszállítási címet"
                    {...register('transfer_address')}
                  />
                  {errors.transfer_address && (
                    <p className="text-xs font-sans text-danger">{errors.transfer_address.message}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Átvétel időpontja</Label>
              <Controller
                name="pickup_time"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Válasszon időpontot" />
                    </SelectTrigger>
                    <SelectContent>
                      {PICKUP_TIMES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.pickup_time && (
                <p className="text-xs font-sans text-danger">{errors.pickup_time.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message">Egyéb megjegyzés (nem kötelező)</Label>
              <Textarea
                id="message"
                placeholder="Különleges kérések, kérdések, preferált elérhetőség..."
                {...register('message')}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 shrink-0 space-y-3">
          {errorMsg && (
            <p className="text-xs font-sans text-danger">{errorMsg}</p>
          )}

          {errorCount >= 2 && (
            <a
              href={buildWhatsAppLink(waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-sans text-whatsapp"
            >
              <MessageCircle className="h-4 w-4" />
              Nem sikerült? Írjon nekünk WhatsApp-on
            </a>
          )}

          <Button
            type="submit"
            form="inquiry-form"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? 'Küldés...' : 'Foglalás elküldése'}
          </Button>

          <p className="text-center text-[11px] font-sans text-muted">
            A foglalásokat személyesen visszaigazoljuk. Fizetés átvételkor.
          </p>
        </div>
      </div>
    </>
  )
}
