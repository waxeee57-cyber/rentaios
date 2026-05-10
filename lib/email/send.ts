import { formatInTimeZone } from 'date-fns-tz'
import { parseISO } from 'date-fns'
import { sendEmail, ADMIN_EMAIL } from '@/lib/resend'
import { TZ } from '@/lib/formatters'
import {
  inquiryConfirmationEmail,
  inquiryAdminAlertEmail,
  bookingConfirmedEmail,
  bookingConfirmedAdminEmail,
  bookingCancelledEmail,
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
  const [customerResult, adminResult] = await Promise.allSettled([
    sendEmail({
      to: data.customerEmail,
      subject: `We've got your request, ${fn(data.customerName)} — ${data.bookingCode}`,
      html: inquiryConfirmationEmail(data),
      replyTo: ADMIN_EMAIL,
    }),
    sendEmail({
      to: ADMIN_EMAIL,
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
  const [customerResult, adminResult] = await Promise.allSettled([
    sendEmail({
      to: data.customerEmail,
      subject: `You're confirmed, ${fn(data.customerName)} — see you on ${shortDate(data.startAt)}`,
      html: bookingConfirmedEmail(data),
      replyTo: ADMIN_EMAIL,
    }),
    sendEmail({
      to: ADMIN_EMAIL,
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
      replyTo: ADMIN_EMAIL,
    }),
  ])

  if (result[0].status === 'rejected') {
    console.error('[Email] Customer cancellation email failed:', result[0].reason)
  }
}
