import { formatInTimeZone } from 'date-fns-tz'

export const TZ = 'Europe/Madrid'

// Per-deploy white-label currency (matches the NEXT_PUBLIC_BUSINESS_* convention).
// Defaults to EUR so existing deployments (e.g. CostaSol) are unaffected.
const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_CURRENCY_CODE || 'EUR'

// Pick a locale whose native currency rendering matches the currency.
// hu-HU renders HUF as "15 000 Ft"; en-IE renders EUR as "€89".
const localeForCurrency = (currency: string): string =>
  currency === 'HUF' ? 'hu-HU' : 'en-IE'

export const formatPrice = (amount: number, currency = DEFAULT_CURRENCY) =>
  new Intl.NumberFormat(localeForCurrency(currency), {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(amount)

export const formatPriceDecimals = (amount: number, currency = DEFAULT_CURRENCY) =>
  new Intl.NumberFormat(localeForCurrency(currency), {
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

export const isFutureOrToday = (date: Date): boolean => {
  const todayMadrid = formatInTimeZone(new Date(), TZ, 'yyyy-MM-dd')
  const candidate   = formatInTimeZone(date, TZ, 'yyyy-MM-dd')
  return candidate >= todayMadrid
}
