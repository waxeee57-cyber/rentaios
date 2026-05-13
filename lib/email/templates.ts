import { formatDate, formatDateRange, formatPriceDecimals, TZ } from '@/lib/formatters'
import { formatInTimeZone } from 'date-fns-tz'
import { parseISO } from 'date-fns'

const BRAND_GOLD = '#C8A96B'
const BRAND_DARK = '#FFFFFF'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'
const _bn = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? ''
const BUSINESS_NAME = _bn && !_bn.startsWith('http') ? _bn : 'RentalOS'
const BUSINESS_EMAIL = process.env.ADMIN_EMAIL ?? 'info@domrol.com'

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

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
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0"
      style="max-width:560px;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">

      <tr>
        <td style="background:${BRAND_DARK};padding:28px 36px;border-bottom:3px solid ${BRAND_GOLD};">
          <p style="margin:0 0 4px;font-size:10px;letter-spacing:4px;text-transform:uppercase;
            color:${BRAND_GOLD};font-family:Arial,sans-serif;font-weight:700;">${BUSINESS_NAME.toUpperCase()}</p>
          <p style="margin:0;font-size:11px;color:#666;font-family:Arial,sans-serif;letter-spacing:0.5px;">
            Rental Booking Service</p>
        </td>
      </tr>

      <tr>
        <td style="background:#ffffff;padding:36px 36px 28px;">
          ${content}
        </td>
      </tr>

      <tr>
        <td style="background:#f4f4f5;padding:20px 36px;border-top:1px solid #e5e7eb;text-align:center;">
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

const divider = `<div style="border-top:1px solid #e5e7eb;margin:24px 0;"></div>`

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
    ${esc(address)} — set the transfer fee before confirming.
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
  const name = esc(firstName(data.customerName))
  const waLink = getWhatsAppLink()
  const dailyRate = data.days > 0 ? data.totalEur / data.days : data.totalEur

  const content = `
<h1 style="margin:0 0 16px;font-size:22px;color:#1a1a1a;font-weight:700;
  font-family:Arial,sans-serif;">Hey ${name},</h1>
<p style="margin:0;font-size:15px;color:#1a1a1a;line-height:1.65;font-family:Arial,sans-serif;">
  We've received your request for the <strong>${esc(data.carLabel)}</strong> and we'll
  be in touch personally to confirm — usually within the hour during business hours.
</p>

${divider}

${section('Your request')}
<table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
  ${row('Vehicle', esc(data.carLabel))}
  ${row('Dates', formatDateRange(data.startAt, data.endAt))}
  ${row('Duration', `${data.days} day${data.days !== 1 ? 's' : ''}`)}
  ${row('Pickup', esc(data.pickupLocation))}
  ${row('Pickup time', esc(data.pickupTime))}
  ${data.transferRequested && data.transferAddress ? row('Delivery to', esc(data.transferAddress)) : ''}
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
    ? `<a href="${custWaUrl}" style="color:${BRAND_GOLD};text-decoration:none;">${esc(data.customerName)}</a>`
    : esc(data.customerName)

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
  ${row('Email', `<a href="mailto:${esc(data.customerEmail)}" style="color:${BRAND_GOLD};text-decoration:none;">${esc(data.customerEmail)}</a>`)}
  ${data.customerPhone ? row('Phone', `<a href="tel:${esc(data.customerPhone)}" style="color:${BRAND_GOLD};text-decoration:none;">${esc(data.customerPhone)}</a>`) : ''}
  ${data.customerCountry ? row('Country', esc(data.customerCountry)) : ''}
</table>

${section('Booking')}
<table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 16px;">
  ${row('Vehicle', esc(data.carLabel))}
  ${row('Dates', formatDateRange(data.startAt, data.endAt))}
  ${row('Pickup', `${esc(data.pickupLocation)} · ${esc(data.pickupTime)}`)}
  ${row('Total', formatPriceDecimals(data.totalEur))}
  ${row('Deposit', formatPriceDecimals(data.depositEur))}
</table>

${isTransfer ? transferWarning(data.transferAddress!) : ''}

${data.customerMessage ? `
${divider}
${section('Their message')}
<p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.65;font-style:italic;font-family:Arial,sans-serif;">&ldquo;${esc(data.customerMessage)}&rdquo;</p>
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
  const name = esc(firstName(data.customerName))
  const waLink = getWhatsAppLink()

  const content = `
<h1 style="margin:0 0 16px;font-size:22px;color:#1a1a1a;font-weight:700;
  font-family:Arial,sans-serif;">Great news, ${name}.</h1>
<p style="margin:0;font-size:15px;color:#1a1a1a;line-height:1.65;font-family:Arial,sans-serif;">
  Your reservation for the <strong>${esc(data.carLabel)}</strong> is confirmed. We're looking
  forward to seeing you on ${formatDate(data.startAt)}.
</p>

${divider}

${section('Your pickup')}
<table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
  ${row('Date', formatDate(data.startAt))}
  ${row('Time', esc(data.pickupTime))}
  ${row('Location', esc(data.pickupLocation))}
  ${data.transferRequested && data.transferAddress
    ? row('Delivery', `We'll come to ${esc(data.transferAddress)}`)
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
  ${row('Vehicle', esc(data.carLabel))}
  ${row('Customer', esc(data.customerName))}
  ${row('Email', `<a href="mailto:${esc(data.customerEmail)}" style="color:${BRAND_GOLD};text-decoration:none;">${esc(data.customerEmail)}</a>`)}
  ${row('Pickup', formatDate(data.startAt))}
  ${row('Time', esc(data.pickupTime))}
  ${row('Location', esc(data.pickupLocation))}
  ${row('Return', formatDate(data.endAt))}
</table>

<p style="margin:0;font-size:13px;color:#888;font-family:Arial,sans-serif;">
  Confirmation email sent to ${esc(data.customerEmail)}.
</p>

${divider}

${btn('Open Admin Panel', adminUrl)}`

  return layout(content)
}

// ─── TEMPLATE 6: Onboarding — client receipt ─────────────────────────────────

export function onboardingClientEmail(data: {
  contactName: string
  businessName: string
  businessType: string
  leadId: string
}): string {
  const name = esc(firstName(data.contactName))
  const adminEmail = BUSINESS_EMAIL

  const content = `
<h1 style="margin:0 0 16px;font-size:22px;color:#1a1a1a;font-weight:700;
  font-family:Arial,sans-serif;">Hi ${name},</h1>
<p style="margin:0;font-size:15px;color:#1a1a1a;line-height:1.65;font-family:Arial,sans-serif;">
  We've received everything we need to set up your
  <strong>${esc(data.businessType)}</strong> booking system for
  <strong>${esc(data.businessName)}</strong>.
</p>

${divider}

<p style="margin:0 0 12px;font-size:14px;color:#1a1a1a;line-height:1.65;font-family:Arial,sans-serif;">
  Here's what happens next:
</p>
<ol style="margin:0 0 20px;padding:0 0 0 20px;font-size:14px;color:#1a1a1a;line-height:2;font-family:Arial,sans-serif;">
  <li>We set up your Supabase database and configure your system</li>
  <li>We connect your domain (if provided) and configure email</li>
  <li>We run a test booking end-to-end</li>
  <li>We send you your admin login details</li>
</ol>

<p style="margin:0 0 20px;font-size:14px;color:#888;line-height:1.65;font-family:Arial,sans-serif;">
  Expect your system within 48 hours. We'll email you the moment it's live.
  Reference: <strong style="color:#1a1a1a;">${data.leadId}</strong>
</p>

${divider}

<p style="margin:0;font-size:14px;color:#888;line-height:1.65;font-family:Arial,sans-serif;">
  Questions? Reply to this email or contact us at
  <a href="mailto:${adminEmail}" style="color:${BRAND_GOLD};text-decoration:none;">${adminEmail}</a>.
</p>
<p style="margin:16px 0 0;font-size:14px;color:#1a1a1a;font-family:Arial,sans-serif;">
  The ${BUSINESS_NAME} Team
</p>`

  return layout(content)
}

// ─── TEMPLATE 7: Onboarding — admin alert ────────────────────────────────────

type OnboardingData = {
  leadId: string
  businessName: string
  contactName: string
  contactEmail: string
  businessType: string
  businessTypeCustom?: string
  businessCity: string
  businessCountry: string
  currentBookingMethod?: string
  monthlyBookingsEstimate?: string
  vehicleCount?: number
  domainName?: string
  preferredLanguage: string
  logoUrl?: string
  brandColor: string
  tagline?: string
  deliveryLocation?: string
  deliveryRadius: string
  minDriverAge: number
  minLicenseYears: number
  maxRentalDays: number
  cancellationPolicy: string
  notes?: string
  referralSource?: string
}

export function onboardingAdminEmail(data: OnboardingData): string {
  const checklist = [
    'Payment confirmed',
    'Supabase project created',
    'Domain configured',
    'Business config set',
    'Fleet data entered',
    'Test booking done',
    'Login credentials sent',
    'Client signed off',
  ]

  const checkboxStyle = `display:inline-block;width:14px;height:14px;border:2px solid #ccc;
    border-radius:2px;margin-right:8px;vertical-align:middle;`

  const checklist_html = checklist
    .map(item => `<li style="padding:6px 0;font-size:13px;color:#1a1a1a;font-family:Arial,sans-serif;
      list-style:none;"><span style="${checkboxStyle}"></span>${item}</li>`)
    .join('')

  const businessTypeDisplay = data.businessType === 'other'
    ? `Other: ${esc(data.businessTypeCustom ?? '')}`
    : esc(data.businessType)

  const content = `
<p style="margin:0 0 6px;font-size:16px;color:#1a1a1a;font-weight:600;font-family:Arial,sans-serif;">
  New setup request.</p>
<p style="margin:0;font-size:13px;color:#888;font-family:Arial,sans-serif;">
  Reference: <strong style="color:#1a1a1a;">${data.leadId}</strong>
</p>

${divider}

${section('Business')}
<table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
  ${row('Business', esc(data.businessName))}
  ${row('Contact', esc(data.contactName))}
  ${row('Email', `<a href="mailto:${esc(data.contactEmail)}" style="color:${BRAND_GOLD};text-decoration:none;">${esc(data.contactEmail)}</a>`)}
  ${row('Type', businessTypeDisplay)}
  ${row('Location', `${esc(data.businessCity)}, ${esc(data.businessCountry)}`)}
</table>

${section('Current situation')}
<table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
  ${row('Books now via', esc(data.currentBookingMethod ?? '—'))}
  ${row('Monthly bookings', esc(data.monthlyBookingsEstimate ?? '—'))}
  ${row('Fleet size', data.vehicleCount ? `${data.vehicleCount} units` : '—')}
</table>

${section('System setup')}
<table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
  ${row('Domain', esc(data.domainName ?? 'Not provided'))}
  ${row('Language', esc(data.preferredLanguage))}
  ${row('Logo URL', data.logoUrl ? `<a href="${esc(data.logoUrl)}" style="color:${BRAND_GOLD};text-decoration:none;">View</a>` : 'Not provided')}
  ${row('Brand color', `<span style="background:${esc(data.brandColor)};padding:2px 8px;border-radius:2px;font-size:11px;">${esc(data.brandColor)}</span>`)}
  ${row('Tagline', esc(data.tagline ?? 'None'))}
</table>

${section('Service rules')}
<table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
  ${row('Delivery base', esc(data.deliveryLocation ?? '—'))}
  ${row('Delivery radius', esc(data.deliveryRadius))}
  ${row('Min driver age', `${data.minDriverAge}`)}
  ${row('Min licence', `${data.minLicenseYears} year${data.minLicenseYears !== 1 ? 's' : ''}`)}
  ${row('Max rental', `${data.maxRentalDays} days`)}
  ${row('Cancellation', esc(data.cancellationPolicy))}
</table>

${data.notes ? `
${section('Notes from client')}
<p style="margin:0 0 20px;font-size:14px;color:#1a1a1a;line-height:1.65;
  font-style:italic;font-family:Arial,sans-serif;">&ldquo;${esc(data.notes)}&rdquo;</p>
` : ''}

${row('Heard via', esc(data.referralSource ?? '—'))}

${divider}

${section('Deployment checklist')}
<ul style="margin:0 0 20px;padding:0;">
  ${checklist_html}
</ul>`

  return layout(content)
}

// ─── TEMPLATE 8: Weekly business report ──────────────────────────────────────

export function weeklyReportEmail(data: {
  dateRange: string
  inquiriesCount: number
  confirmedCount: number
  revenueWeek: number
  upcomingPickups: Array<{
    carLabel: string
    customerFirstName: string
    startAt: string
    pickupTime: string | null
  }>
  adminUrl: string
}): string {
  const pickupRows = data.upcomingPickups.length > 0
    ? data.upcomingPickups.map(p => {
        const date = new Date(p.startAt).toLocaleDateString('en-GB', {
          weekday: 'short', day: 'numeric', month: 'short',
        })
        return `<tr>
          <td style="padding:6px 0;font-size:13px;color:#1a1a1a;font-family:Arial,sans-serif;
            width:50%;vertical-align:top;">${esc(p.carLabel)}</td>
          <td style="padding:6px 0;font-size:13px;color:#888;font-family:Arial,sans-serif;
            width:25%;vertical-align:top;">${esc(p.customerFirstName)}</td>
          <td style="padding:6px 0;font-size:13px;color:#888;font-family:Arial,sans-serif;
            width:25%;vertical-align:top;">${date}${p.pickupTime ? ` · ${esc(p.pickupTime)}` : ''}</td>
        </tr>`
      }).join('')
    : `<tr><td colspan="3" style="padding:6px 0;font-size:13px;color:#aaa;font-family:Arial,sans-serif;">
        No pickups scheduled this week.</td></tr>`

  const content = `
<p style="margin:0 0 4px;font-size:13px;color:#888;font-family:Arial,sans-serif;">Good morning.</p>
<p style="margin:0 0 24px;font-size:15px;color:#1a1a1a;font-family:Arial,sans-serif;font-weight:600;">
  Here's your summary for the week.</p>

${divider}

${section('This week — ' + data.dateRange)}
<table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
  ${row('New inquiries', `${data.inquiriesCount}`)}
  ${row('Confirmed bookings', `${data.confirmedCount}`)}
  ${row('Revenue', formatPriceDecimals(data.revenueWeek))}
</table>

${divider}

${section('Upcoming pickups')}
<table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;">
  <thead>
    <tr>
      <th style="text-align:left;padding:4px 0;font-size:10px;letter-spacing:1.5px;
        text-transform:uppercase;color:#aaa;font-family:Arial,sans-serif;font-weight:400;">Vehicle</th>
      <th style="text-align:left;padding:4px 0;font-size:10px;letter-spacing:1.5px;
        text-transform:uppercase;color:#aaa;font-family:Arial,sans-serif;font-weight:400;">Customer</th>
      <th style="text-align:left;padding:4px 0;font-size:10px;letter-spacing:1.5px;
        text-transform:uppercase;color:#aaa;font-family:Arial,sans-serif;font-weight:400;">Date</th>
    </tr>
  </thead>
  <tbody>
    ${pickupRows}
  </tbody>
</table>

${divider}

${btn('Open admin panel', data.adminUrl)}

<p style="margin:28px 0 0;font-size:12px;color:#aaa;font-family:Arial,sans-serif;">
  ${BUSINESS_NAME} · Your automated booking system
</p>`

  return layout(content)
}

// ─── TEMPLATE 9: Review request ──────────────────────────────────────────────

export function reviewRequestEmail(data: {
  firstName: string
  carLabel: string
  businessName: string
  reviewUrl: string
  unsubscribeUrl: string
}): string {
  const content = `
<h1 style="margin:0 0 16px;font-size:22px;color:#1a1a1a;font-weight:700;
  font-family:Arial,sans-serif;">Hi ${esc(data.firstName)},</h1>
<p style="margin:0 0 20px;font-size:15px;color:#1a1a1a;line-height:1.65;font-family:Arial,sans-serif;">
  Thank you for choosing ${esc(data.businessName)}.
</p>
<p style="margin:0 0 28px;font-size:15px;color:#1a1a1a;line-height:1.65;font-family:Arial,sans-serif;">
  If you have a moment, we'd love to hear about your experience with the
  <strong>${esc(data.carLabel)}</strong>. It takes 30 seconds:
</p>

${btn('Share your experience', data.reviewUrl)}

<p style="margin:28px 0 0;font-size:13px;color:#888;line-height:1.65;font-family:Arial,sans-serif;">
  Your feedback genuinely helps us and helps other travellers make the right choice.
</p>
<p style="margin:16px 0 0;font-size:14px;color:#1a1a1a;font-family:Arial,sans-serif;">
  The ${esc(data.businessName)} Team
</p>

${divider}

<p style="margin:0;font-size:11px;color:#aaa;line-height:1.65;font-family:Arial,sans-serif;">
  You're receiving this because you recently completed a rental with ${esc(data.businessName)}.
  <a href="${data.unsubscribeUrl}" style="color:#aaa;text-decoration:underline;">Unsubscribe</a>
</p>`

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
  const name = esc(firstName(data.customerName))

  const content = `
<h1 style="margin:0 0 16px;font-size:22px;color:#1a1a1a;font-weight:700;
  font-family:Arial,sans-serif;">Hi ${name},</h1>
<p style="margin:0;font-size:15px;color:#1a1a1a;line-height:1.65;font-family:Arial,sans-serif;">
  Your reservation for the <strong>${esc(data.carLabel)}</strong> (${data.bookingCode}) has
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
