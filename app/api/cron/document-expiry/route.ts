import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail, ADMIN_EMAIL } from '@/lib/resend'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'
const _bn = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? ''
const BUSINESS_NAME = _bn && !_bn.startsWith('http') ? _bn : 'RentalOS'

const TYPE_LABELS: Record<string, string> = {
  insurance: 'Insurance',
  registration: 'Registration',
  mot_certificate: 'MOT Certificate',
  service_history: 'Service History',
  purchase_invoice: 'Purchase Invoice',
  driving_licence_front: 'Driving Licence (Front)',
  driving_licence_back: 'Driving Licence (Back)',
  passport: 'Passport',
  national_id: 'National ID',
  proof_of_address: 'Proof of Address',
  other: 'Document',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sixtyDaysFromNow = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const today = new Date().toISOString().slice(0, 10)

  // Vehicle documents expiring within 60 days
  const { data: vehicleDocs } = await supabaseAdmin
    .from('vehicle_documents')
    .select('id, document_type, document_type_label, expires_at, car_id, cars(brand, model)')
    .not('expires_at', 'is', null)
    .lte('expires_at', sixtyDaysFromNow)
    .eq('expiry_alert_sent', false)

  // Customer documents expiring within 60 days
  const { data: customerDocs } = await supabaseAdmin
    .from('customer_documents')
    .select('id, document_type, document_type_label, expires_at, customer_id, customers(full_name)')
    .not('expires_at', 'is', null)
    .lte('expires_at', sixtyDaysFromNow)
    .eq('expiry_alert_sent', false)

  let sent = 0

  for (const doc of vehicleDocs ?? []) {
    const car = Array.isArray(doc.cars) ? doc.cars[0] : doc.cars
    const carLabel = car ? `${(car as { brand: string; model: string }).brand} ${(car as { brand: string; model: string }).model}` : 'Vehicle'
    const typeLabel = TYPE_LABELS[doc.document_type] ?? doc.document_type_label ?? 'Document'
    const expiry = doc.expires_at as string
    const isExpired = expiry < today

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `${isExpired ? 'EXPIRED' : 'Expiring soon'} — ${typeLabel} for ${carLabel}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;">
          <p style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#C8A96B;margin:0 0 16px;">${BUSINESS_NAME}</p>
          <h2 style="font-size:20px;font-weight:400;color:#0F0F10;margin:0 0 16px;">
            ${isExpired ? 'Document expired' : 'Document expiring soon'}
          </h2>
          <p style="font-size:14px;color:#444;line-height:1.6;">
            The <strong>${typeLabel}</strong> for <strong>${carLabel}</strong>
            ${isExpired ? 'expired on' : 'expires on'} <strong>${formatDate(expiry)}</strong>.
          </p>
          <p style="font-size:14px;color:#444;line-height:1.6;">
            Update it in your admin panel before the vehicle goes out on its next booking.
          </p>
          <a href="${SITE_URL}/admin/cars" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#C8A96B;color:#000;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:1px;">
            Open Fleet →
          </a>
        </div>
      `,
    })

    await supabaseAdmin
      .from('vehicle_documents')
      .update({ expiry_alert_sent: true })
      .eq('id', doc.id)

    sent++
  }

  for (const doc of customerDocs ?? []) {
    const customer = Array.isArray(doc.customers) ? doc.customers[0] : doc.customers
    const customerName = (customer as { full_name?: string } | null)?.full_name ?? 'Customer'
    const typeLabel = TYPE_LABELS[doc.document_type] ?? doc.document_type_label ?? 'Document'
    const expiry = doc.expires_at as string
    const isExpired = expiry < today

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `${isExpired ? 'EXPIRED' : 'Expiring soon'} — ${typeLabel} for ${customerName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;">
          <p style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#C8A96B;margin:0 0 16px;">${BUSINESS_NAME}</p>
          <h2 style="font-size:20px;font-weight:400;color:#0F0F10;margin:0 0 16px;">
            ${isExpired ? 'Document expired' : 'Document expiring soon'}
          </h2>
          <p style="font-size:14px;color:#444;line-height:1.6;">
            The <strong>${typeLabel}</strong> for customer <strong>${customerName}</strong>
            ${isExpired ? 'expired on' : 'expires on'} <strong>${formatDate(expiry)}</strong>.
          </p>
          <p style="font-size:14px;color:#444;line-height:1.6;">
            Check the customer's documents in the booking detail before their next pickup.
          </p>
          <a href="${SITE_URL}/admin/bookings" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#C8A96B;color:#000;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:1px;">
            Open Bookings →
          </a>
        </div>
      `,
    })

    await supabaseAdmin
      .from('customer_documents')
      .update({ expiry_alert_sent: true })
      .eq('id', doc.id)

    sent++
  }

  return NextResponse.json({ success: true, sent })
}
