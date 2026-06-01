import { formatInTimeZone } from 'date-fns-tz'

export const TZ = 'Europe/Madrid'

export const formatPrice = (amount: number, currency = 'EUR') =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(amount)

export const formatPriceDecimals = (amount: number, currency = 'EUR') =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency', currency,
  }).format(amount)

export const formatDate = (utc: string | Date) =>
  formatInTimeZone(utc, TZ, 'd MMM yyyy')

export const formatDateTime = (utc: string | Date) =>
  formatInTimeZone(utc, TZ, 'd MMM yyyy, HH:mm')

export const formatTime = (utc: string | Date) =>
  formatInTimeZone(utc, TZ, 'HH:mm')

export const formatDateRange = (startUtc: string, endUtc: string) =>
  `${formatDate(startUtc)} → ${formatDate(endUtc)}`

// Display labels for known vehicle body types / categories. Anything not in
// the map falls back to Title Case (e.g. "sport" -> "Sport"). This keeps the
// admin/fleet display consistent (so "suv" renders "SUV", not "Suv").
const CATEGORY_LABELS: Record<string, string> = {
  suv: 'SUV',
  mpv: 'MPV',
  '4x4': '4x4',
  ev: 'EV',
}

export const formatCategory = (value: string | null | undefined): string => {
  if (!value) return ''
  const key = value.trim().toLowerCase()
  if (key in CATEGORY_LABELS) return CATEGORY_LABELS[key]
  return key.replace(/\b\w/g, (c) => c.toUpperCase())
}

const titleCase = (value: string | null | undefined): string => {
  if (!value) return ''
  return value.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

// Joins vehicle spec segments with " · ", dropping any empty/missing value so a
// missing field never leaves a dangling "· ·" separator on a card.
export const formatSpecLine = (parts: Array<string | number | null | undefined>): string =>
  parts
    .map((p) => (p == null ? '' : String(p).trim()))
    .filter((p) => p.length > 0)
    .join(' · ')

// Convenience for the standard category · transmission · fuel line.
export const formatVehicleSpecs = (car: {
  category?: string | null
  transmission?: string | null
  fuel?: string | null
}): string =>
  formatSpecLine([formatCategory(car.category), titleCase(car.transmission), titleCase(car.fuel)])

export const isFutureOrToday = (date: Date): boolean => {
  const todayMadrid = formatInTimeZone(new Date(), TZ, 'yyyy-MM-dd')
  const candidate   = formatInTimeZone(date, TZ, 'yyyy-MM-dd')
  return candidate >= todayMadrid
}
