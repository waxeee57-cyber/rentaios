import { formatDate, formatDateRange, formatPriceDecimals, TZ } from '@/lib/formatters'
import { formatInTimeZone } from 'date-fns-tz'
import { parseISO } from 'date-fns'

const BRAND_GOLD = '#C8A96B'
const BRAND_DARK = '#0F0F10'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'
const BUSINESS_NAME = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? 'RentalOS'
const BUSINESS_EMAIL = process.env.ADMIN_EMAIL ?? 'hello@rentaios.com'

function firstName(fullName: string): string {
  return fullName.trim().split(' ')[0] || fullName
}

export function shortDate(isoStr: string): string {
  return formatInTimeZone(parseISO(isoStr), TZ, 'EEE d MMM')
}

function getWhatsAppLink(): string | null {
  const num = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP
  if (!num || num.replace(/\D/g, '').startsWith('36')) return null
  return `https://wa.me/${num}`
}

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f0ede8;font-family:Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede8;">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0"
      style="max-width:560px;border-radius:8px;overflow:hidden;border:1px solid #e0dbd0;">

      <tr>
        <td style="background:${BRAND_DARK};padding:28px 36px;border-bottom:3px solid ${BRAND_GOLD};">
          <p style="margin:0 0 4px;font-size:10px;letter-spacing:4px;text-transform:uppercase;
            color:${BRAND_GOLD};font-family:Arial,sans-serif;font-weight:700;">${BUSINESS_NAME.toUpperCase()}</p>
          <p style="margin:0;font-size:11px;color:#666;font-family:Arial,sans-serif;letter-spacing:0.5px;">
            Luxury Rental Service</p>
        </td>
      </tr>

      <tr>
        <td style="background:#ffffff;padding:36px 36px 28px;">
          ${content}
        </td>
      </tr>

      <tr>
        <td style="background:#f8f5f0;padding:20px 36px;border-top:1px solid #ede8e0;text-align:center;">
          <p style="margin:0 0 6px;font-size:12px;color:#aaa;font-family:Arial,sans-serif;">
            ${BUSINESS_NAME}
          </p>
          <p style="margin:0;font-size:12px;font-family:Arial,sans-serif;">
            <a href="mailto:${BUSINESS_EMAIL}"
              style="color:${BRAND_GOLD};text-decoration:none;">${BUSINESS_EMAIL}</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`
}

function btn(text: string, href: string): string {
  return `
<table cellpadding="0" cellspacing="0" style="margin:28px 0 4px;">
  <tr>
    <td style="background:${BRAND_GOLD};border-radius:4px;">
      <a href="${href}" style="display:block;padding:14px 32px;color:${BRAND_DARK};
        font-size:12px;font-weight:700;text-decoration:none;letter-spacing:2px;
        text-transform:uppercase;font-family:Arial,sans-serif;">${text}</a>
    </td>
  </tr>
</table>`
}

const divider = `<div style="border-top:1px solid #f0ece4;margin:24px 0;"></div>`

function section(label: string): string {
  return `<p style="margin:0 0 12px;font-size:10px;letter-spacing:2px;text-transform:uppercase;
    color:${BRAND_GOLD};font-family:Arial,sans-serif;font-weight:700;">${label}</p>`
}

function row(label: string, value: string): string {
  return `
<tr>
  <td style="padding:6px 0;font-size:13px;color:#888;
    font-family:Arial,sans-serif;width:130px;vertical-align:top;">${label}</td>
  <td style="padding:6px 0;font-size:13px;color:#1a1a1a;
    font-weight:600;font-family:Arial,sans-serif;vertical-align:top;">${value}</td>
</tr>`
}

function transferWarning(address: string): string {
  return `
<div style="background:#fdf3e3;border-left:3px solid ${BRAND_GOLD};
  padding:12px 16px;margin:16px 0;border-radius:0 4px 4px 0;">
  <p style="margin:0;font-size:13px;color:#7a5c0a;font-family:Arial,sans-serif;font-weight:600;">
    ⚠ Custom delivery requested
  </p>
  <p style="margin:4px 0 0;font-size:13px;color:#7a5c0a;font-family:Arial,sans-serif;">
    ${address} — set the transfer fee before confirming.
  </p>
</div>`
}

// ─── TEMPLATE 1: Customer inquiry confirmation ────────────────────────────────

export function inquiryConfirmationEmail(data: {
  customerName: string
  customerEmail: string
  carLabel: string
  startAt: string
  endAt: string
  days: number
  pickupLocation: string
  pickupTime: string
  totalEur: number
  depositEur: number
  bookingCode: string
  transferRequested?: boolean
  transferAddress?: string
}): string {
  const name = firstName(data.customerName)
  const waLink = getWhatsAppLink()
  const dailyRate = data.days > 0 ? data.totalEur / data.days : data.totalEur

  const content = `
<h1 style="margin:0 0 16px;font-size:22px;color:#1a1a1a;font-weight:700;
  font-family:Arial,sans-serif;">Hey ${name},</h1>
<p style="margin:0;font-size:15px;color:#1a1a1a;line-height:1.65;font-family:Arial,sans-serif;">
  We've received your request for the <strong>${data.carLabel}</strong> and we'll
  be in touch personally to confirm — usually within the hour during business hours.
</p>

${divider}

${section('Your request')}
<table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
  ${row('Vehicle', data.carLabel)}
  ${row('Dates', formatDateRange(data.startAt, data.endAt))}
  ${row('Duration', `${data.days} day${data.days !== 1 ? 's' : ''}`)}
  ${row('Pickup', data.pickupLocation)}
  ${row('Pickup time', data.pickupTime)}
  ${data.transferRequested && data.transferAddress ? row('Delivery to', data.transferAddress) : ''}
</table>

${section('Estimated cost')}
<table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 16px;">
  ${row('Daily rate', formatPriceDecimals(dailyRate))}
  ${row('Total', formatPriceDecimals(data.totalEur))}
  ${row('Deposit at pickup', `${formatPriceDecimals(data.depositEur)} (refundable)`)}
  ${data.transferRequested ? row('Transfer fee', 'To be confirmed') : ''}
  ${row('Payment', 'In person at pickup')}
</table>

${divider}

<p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.65;font-family:Arial,sans-serif;">
  In the meantime, you can track your reservation here:
</p>
${btn('View My Reservation', `${SITE_URL}/booking/${data.bookingCode}?email=${encodeURIComponent(data.customerEmail)}`)}

<p style="margin:28px 0 0;font-size:14px;color:#888;line-height:1.65;font-family:Arial,sans-serif;">
  Got a question? Just reply to this email${waLink
    ? ` or <a href="${waLink}" style="color:${BRAND_GOLD};text-decoration:none;">message us on WhatsApp</a>`
    : ''} — we're happy to help.
</p>
<p style="margin:16px 0 0;font-size:14px;color:#1a1a1a;font-family:Arial,sans-serif;">
  The ${BUSINESS_NAME} Team
</p>`

  return layout(content)
}

// ─── TEMPLATE 2: Admin new inquiry alert ──────────────────────────────────────

export function inquiryAdminAlertEmail(data: {
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerCountry?: string
  carLabel: string
  startAt: string
  endAt: string
  days: number
  pickupLocation: string
  pickupTime: string
  totalEur: number
  depositEur: number
  bookingCode: string
  customerMessage?: string
  transferRequested?: boolean
  transferAddress?: string
}): string {
  const adminUrl = `${SITE_URL}/admin/bookings`
  const isTransfer = data.transferRequested && data.transferAddress

  const custPhone = data.customerPhone?.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '')
  const custWaUrl = custPhone
    ? `https://wa.me/${custPhone}?text=${encodeURIComponent(`Hi ${firstName(data.customerName)},`)}`
    : null
  const nameDisplay = custWaUrl
    ? `<a href="${custWaUrl}" style="color:${BRAND_GOLD};text-decoration:none;">${data.customerName}</a>`
    : data.customerName

  const content = `
<p style="margin:0 0 6px;font-size:16px;color:#1a1a1a;font-weight:600;font-family:Arial,sans-serif;">
  New reservation request.</p>
<p style="margin:0;font-size:13px;color:#888;font-family:Arial,sans-serif;">
  Reference: <strong style="color:#1a1a1a;">${data.bookingCode}</strong>
</p>

${divider}

${section('Customer')}
<table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
  ${row('Name', nameDisplay)}
  ${row('Email', `<a href="mailto:${data.customerEmail}" style="color:${BRAND_GOLD};text-decoration:none;">${data.customerEmail}</a>`)}
  ${data.customerPhone ? row('Phone', `<a href="tel:${data.customerPhone}" style="color:${BRAND_GOLD};text-decoration:none;">${data.customerPhone}</a>`) : ''}
  ${data.customerCountry ? row('Country', data.customerCountry) : ''}
</table>

${section('Booking')}
<table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 16px;">
  ${row('Vehicle', data.carLabel)}
  ${row('Dates', formatDateRange(data.startAt, data.endAt))}
  ${row('Pickup', `${data.pickupLocation} · ${data.pickupTime}`)}
  ${row('Total', formatPriceDecimals(data.totalEur))}
  ${row('Deposit', formatPriceDecimals(data.depositEur))}
</table>

${isTransfer ? transferWarning(data.transferAddress!) : ''}

${data.customerMessage ? `
${divider}
${section('Their message')}
<p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.65;font-style:italic;font-family:Arial,sans-serif;">"${data.customerMessage}"</p>
` : ''}

${divider}

${btn('Open Admin Panel', adminUrl)}`

  return layout(content)
}

// ─── TEMPLATE 3: Customer booking confirmed ───────────────────────────────────

export function bookingConfirmedEmail(data: {
  customerName: string
  customerEmail: string
  carLabel: string
  startAt: string
  endAt: string
  days: number
  pickupLocation: string
  pickupTime: string
  totalEur: number
  depositEur: number
  bookingCode: string
  transferRequested?: boolean
  transferAddress?: string
  transferFeeEur?: number | null
}): string {
  const name = firstName(data.customerName)
  const waLink = getWhatsAppLink()

  const content = `
<h1 style="margin:0 0 16px;font-size:22px;color:#1a1a1a;font-weight:700;
  font-family:Arial,sans-serif;">Great news, ${name}.</h1>
<p style="margin:0;font-size:15px;color:#1a1a1a;line-height:1.65;font-family:Arial,sans-serif;">
  Your reservation for the <strong>${data.carLabel}</strong> is confirmed. We're looking
  forward to seeing you on ${formatDate(data.startAt)}.
</p>

${divider}

${section('Your pickup')}
<table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
  ${row('Date', formatDate(data.startAt))}
  ${row('Time', data.pickupTime)}
  ${row('Location', data.pickupLocation)}
  ${data.transferRequested && data.transferAddress
    ? row('Delivery', `We'll come to ${data.transferAddress}`)
    : ''}
</table>

${section('What to bring')}
<ul style="margin:0 0 20px;padding:0 0 0 18px;font-size:14px;color:#1a1a1a;
  line-height:1.9;font-family:Arial,sans-serif;">
  <li>Valid driving licence</li>
  <li>Passport or national ID</li>
  <li>Payment for balance and deposit (in person at pickup)</li>
</ul>

${section('Payment at pickup')}
<table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 16px;">
  ${row('Balance due', formatPriceDecimals(data.totalEur))}
  ${data.transferRequested
    ? row('Transfer fee', data.transferFeeEur != null
        ? formatPriceDecimals(data.transferFeeEur)
        : 'As agreed')
    : ''}
  ${row('Refundable deposit', formatPriceDecimals(data.depositEur))}
  ${row('Return date', formatDate(data.endAt))}
</table>

${divider}

${btn('View My Reservation', `${SITE_URL}/booking/${data.bookingCode}?email=${encodeURIComponent(data.customerEmail)}`)}

<p style="margin:28px 0 0;font-size:14px;color:#888;line-height:1.65;font-family:Arial,sans-serif;">
  Any questions before pickup? Just reply to this email${waLink
    ? ` or <a href="${waLink}" style="color:${BRAND_GOLD};text-decoration:none;">message us on WhatsApp</a>`
    : ''} — we'll get back to you straight away.
</p>
<p style="margin:16px 0 0;font-size:14px;color:#1a1a1a;font-family:Arial,sans-serif;">
  The ${BUSINESS_NAME} Team
</p>`

  return layout(content)
}

// ─── TEMPLATE 4: Admin booking confirmed alert ────────────────────────────────

export function bookingConfirmedAdminEmail(data: {
  customerName: string
  customerEmail: string
  carLabel: string
  startAt: string
  endAt: string
  pickupLocation: string
  pickupTime: string
  bookingCode: string
}): string {
  const adminUrl = `${SITE_URL}/admin/bookings`

  const content = `
<p style="margin:0 0 6px;font-size:16px;color:#1a1a1a;font-weight:600;font-family:Arial,sans-serif;">
  Booking confirmed.</p>
<p style="margin:0;font-size:13px;color:#888;font-family:Arial,sans-serif;">
  Reference: <strong style="color:#1a1a1a;">${data.bookingCode}</strong>
</p>

${divider}

<table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 16px;">
  ${row('Vehicle', data.carLabel)}
  ${row('Customer', data.customerName)}
  ${row('Email', `<a href="mailto:${data.customerEmail}" style="color:${BRAND_GOLD};text-decoration:none;">${data.customerEmail}</a>`)}
  ${row('Pickup', formatDate(data.startAt))}
  ${row('Time', data.pickupTime)}
  ${row('Location', data.pickupLocation)}
  ${row('Return', formatDate(data.endAt))}
</table>

<p style="margin:0;font-size:13px;color:#888;font-family:Arial,sans-serif;">
  Confirmation email sent to ${data.customerEmail}.
</p>

${divider}

${btn('Open Admin Panel', adminUrl)}`

  return layout(content)
}

// ─── TEMPLATE 5: Customer cancellation ───────────────────────────────────────

export function bookingCancelledEmail(data: {
  customerName: string
  carLabel: string
  startAt: string
  endAt: string
  bookingCode: string
}): string {
  const name = firstName(data.customerName)

  const content = `
<h1 style="margin:0 0 16px;font-size:22px;color:#1a1a1a;font-weight:700;
  font-family:Arial,sans-serif;">Hi ${name},</h1>
<p style="margin:0;font-size:15px;color:#1a1a1a;line-height:1.65;font-family:Arial,sans-serif;">
  Your reservation for the <strong>${data.carLabel}</strong> (${data.bookingCode}) has
  been cancelled.
</p>

${divider}

<p style="margin:0 0 20px;font-size:14px;color:#888;line-height:1.65;font-family:Arial,sans-serif;">
  If you'd like to make a new reservation or have any questions, we're here to help.
</p>

${btn('Get in Touch', `mailto:${BUSINESS_EMAIL}`)}

<p style="margin:28px 0 0;font-size:14px;color:#1a1a1a;font-family:Arial,sans-serif;">
  The ${BUSINESS_NAME} Team
</p>`

  return layout(content)
}
