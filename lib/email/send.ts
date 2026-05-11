import { formatInTimeZone } from 'date-fns-tz'
import { parseISO } from 'date-fns'
import { sendEmail, getAdminEmail } from '@/lib/resend'
import { TZ } from '@/lib/formatters'
import {
  inquiryConfirmationEmail,
  inquiryAdminAlertEmail,
  bookingConfirmedEmail,
  bookingConfirmedAdminEmail,
  bookingCancelledEmail,
  onboardingClientEmail,
  onboardingAdminEmail,
  weeklyReportEmail,
  reviewRequestEmail,
} from '@/lib/email/templates'

function fn(fullName: string): string {
  return fullName.split(' ')[0] || fullName
}

function shortDate(isoStr: string): string {
  return formatInTimeZone(parseISO(isoStr), TZ, 'EEE d MMM')
}

export async function sendInquiryEmails(data: {
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
}) {
  console.log('[Email] sendInquiryEmails called:', data.bookingCode)
  const adminEmail = await getAdminEmail()
  const [customerResult, adminResult] = await Promise.allSettled([
    sendEmail({
      to: data.customerEmail,
      subject: `We've got your request, ${fn(data.customerName)} — ${data.bookingCode}`,
      html: inquiryConfirmationEmail(data),
      replyTo: adminEmail,
    }),
    sendEmail({
      to: adminEmail,
      subject: data.transferRequested
        ? `⚠ New request (transfer) — ${data.carLabel} · ${data.bookingCode}`
        : `New request — ${data.carLabel} · ${shortDate(data.startAt)} · ${data.bookingCode}`,
      html: inquiryAdminAlertEmail(data),
    }),
  ])

  if (customerResult.status === 'rejected') {
    console.error('[Email] Customer inquiry email failed:', customerResult.reason)
  }
  if (adminResult.status === 'rejected') {
    console.error('[Email] Admin inquiry alert failed:', adminResult.reason)
  }
}

export async function sendConfirmationEmails(data: {
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
}) {
  console.log('[Email] sendConfirmationEmails called:', data.bookingCode)
  const adminEmail = await getAdminEmail()
  const [customerResult, adminResult] = await Promise.allSettled([
    sendEmail({
      to: data.customerEmail,
      subject: `You're confirmed, ${fn(data.customerName)} — see you on ${shortDate(data.startAt)}`,
      html: bookingConfirmedEmail(data),
      replyTo: adminEmail,
    }),
    sendEmail({
      to: adminEmail,
      subject: `Confirmed — ${data.bookingCode} · ${fn(data.customerName)} · ${shortDate(data.startAt)}`,
      html: bookingConfirmedAdminEmail(data),
    }),
  ])

  if (customerResult.status === 'rejected') {
    console.error('[Email] Customer confirmation email failed:', customerResult.reason)
  }
  if (adminResult.status === 'rejected') {
    console.error('[Email] Admin confirmation alert failed:', adminResult.reason)
  }
}

export async function sendOnboardingEmails(data: {
  leadId: string
  contactName: string
  contactEmail: string
  businessName: string
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
}) {
  console.log('[Email] sendOnboardingEmails called:', data.leadId)
  const adminEmail = await getAdminEmail()
  const [clientResult, adminResult] = await Promise.allSettled([
    sendEmail({
      to: data.contactEmail,
      subject: `We're on it — setup starts within 24 hours`,
      html: onboardingClientEmail({
        contactName: data.contactName,
        businessName: data.businessName,
        businessType: data.businessType === 'other' ? (data.businessTypeCustom ?? 'rental') : data.businessType,
        leadId: data.leadId,
      }),
      replyTo: adminEmail,
    }),
    sendEmail({
      to: adminEmail,
      subject: `Setup request — ${data.businessName} — ${data.businessType}`,
      html: onboardingAdminEmail(data),
    }),
  ])

  if (clientResult.status === 'rejected') {
    console.error('[Email] Onboarding client email failed:', clientResult.reason)
  }
  if (adminResult.status === 'rejected') {
    console.error('[Email] Onboarding admin alert failed:', adminResult.reason)
  }
}

export async function sendWeeklyReport(data: {
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
  adminEmail: string
}) {
  console.log('[Email] sendWeeklyReport called:', data.dateRange)
  const result = await sendEmail({
    to: data.adminEmail,
    subject: `Your week — ${data.dateRange}`,
    html: weeklyReportEmail(data),
  })
  if (!result.success) {
    console.error('[Email] Weekly report failed:', result.error)
  }
}

export async function sendReviewRequest(data: {
  customerEmail: string
  customerName: string
  carLabel: string
  businessName: string
  reviewUrl: string
  siteUrl: string
  bookingId: string
}) {
  const firstName = data.customerName.split(' ')[0] || data.customerName
  const unsubscribeUrl = `${data.siteUrl}/api/unsubscribe?ref=${data.bookingId}`
  const result = await sendEmail({
    to: data.customerEmail,
    subject: `How was your ${data.carLabel}, ${firstName}?`,
    html: reviewRequestEmail({
      firstName,
      carLabel: data.carLabel,
      businessName: data.businessName,
      reviewUrl: data.reviewUrl,
      unsubscribeUrl,
    }),
    replyTo: await getAdminEmail(),
  })
  if (!result.success) {
    console.error('[Email] Review request failed')
  }
}

export async function sendCancellationEmail(data: {
  customerName: string
  customerEmail: string
  carLabel: string
  startAt: string
  endAt: string
  bookingCode: string
}) {
  const result = await Promise.allSettled([
    sendEmail({
      to: data.customerEmail,
      subject: `Your reservation has been cancelled — ${data.bookingCode}`,
      html: bookingCancelledEmail(data),
      replyTo: await getAdminEmail(),
    }),
  ])

  if (result[0].status === 'rejected') {
    console.error('[Email] Customer cancellation email failed:', result[0].reason)
  }
}
