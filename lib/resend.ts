import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY

export const resend = apiKey ? new Resend(apiKey) : null

export const FROM =
  `${process.env.RESEND_FROM_NAME ?? 'RentalOS'} <${
    process.env.RESEND_FROM_EMAIL ?? 'noreply@rentaios.com'
  }>`

export const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ?? 'hello@rentaios.com'

export async function getAdminEmail(): Promise<string> {
  if (process.env.ADMIN_EMAIL) return process.env.ADMIN_EMAIL
  const { getBusinessConfig } = await import('./config')
  const config = await getBusinessConfig()
  return config.business_email || 'hello@rentaios.com'
}

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string
  subject: string
  html: string
  replyTo?: string
}): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.log('[Resend] No API key — email skipped:', { subject })
    return { success: false, error: 'No API key configured' }
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    })

    if (error) {
      console.error('[Resend] Send error:', error.message)
      return { success: false, error: error.message }
    }

    console.log('[Resend] Sent:', { subject })
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Resend] Exception:', message)
    return { success: false, error: message }
  }
}
