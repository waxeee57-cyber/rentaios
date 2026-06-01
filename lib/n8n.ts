import 'server-only'

export interface InquiryPayload {
  event: 'inquiry' | 'confirmed'
  booking_code: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_message: string
  car_label: string
  dates_label: string
  days: number
  pickup_label: string
  estimated_total: string
  deposit: string
  status_page_url: string
  transfer_requested?: boolean
  transfer_address?: string
}

export async function notifyInquiry(payload: InquiryPayload): Promise<void> {
  const url = process.env.N8N_WEBHOOK_URL
  if (!url) {
    // No PII in logs — booking code only (see CLAUDE.md logging rule).
    console.log('[n8n:dev] webhook skipped — N8N_WEBHOOK_URL not configured', payload.booking_code)
    return
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': process.env.N8N_WEBHOOK_SECRET ?? '',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      console.warn('[n8n] webhook returned non-ok status', res.status)
    }
  } catch (err) {
    console.warn('[n8n] webhook call failed — continuing lifecycle', err)
  }
}
