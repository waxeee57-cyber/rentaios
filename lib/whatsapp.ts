const WA_BASE = 'https://wa.me/'

function isPlaceholderNumber(num: string): boolean {
  const clean = num.replace(/\D/g, '')
  return clean.startsWith('36') || clean === '36206246278'
}

function getNumber(): string {
  const num = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP ?? ''
  if (!num || isPlaceholderNumber(num)) return ''
  return num
}

export function isWhatsAppConfigured(): boolean {
  return getNumber() !== ''
}

export function buildWhatsAppLink(message?: string): string {
  const num = getNumber()
  if (!num) return '#'
  if (!message) return `${WA_BASE}${num}`
  return `${WA_BASE}${num}?text=${encodeURIComponent(message)}`
}

export function buildCarInquiryLink(opts: {
  carLabel: string
  startDate: string
  endDate: string
  pickupLocation: string
  totalFormatted: string
}): string {
  const hasDates = opts.startDate && opts.endDate
  const msg = hasDates
    ? `Hi, I'm interested in the ${opts.carLabel} from ${opts.startDate} to ${opts.endDate}, picking up at ${opts.pickupLocation}. Estimated total: ${opts.totalFormatted}.`
    : `Hi, I'm interested in the ${opts.carLabel}. I'd like to discuss availability and pricing.`
  return buildWhatsAppLink(msg)
}

export function buildBookingLink(opts: {
  customerName: string
  bookingCode: string
}): string {
  const msg = `Hi ${opts.customerName}, this is regarding your reservation ${opts.bookingCode}.`
  return buildWhatsAppLink(msg)
}

export function buildStatusPageLink(opts: {
  bookingCode: string
}): string {
  const msg = `Hi, I'm following up on my reservation ${opts.bookingCode}.`
  return buildWhatsAppLink(msg)
}
