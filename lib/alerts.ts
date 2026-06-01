import 'server-only'

/**
 * Alert dispatch. Deliberately a thin, dependency-free stub so it can be wired
 * to a real channel later WITHOUT a surprise paid integration:
 *
 *   - If ALERT_WEBHOOK_URL is set  -> POST the alert as JSON (Slack/Discord/
 *     n8n/Better-Stack-style incoming webhook all accept this shape).
 *   - Else if ALERT_EMAIL_ENABLED is "true" -> send via the already-configured
 *     Resend client to ADMIN_EMAIL (opt-in, off by default).
 *   - Else -> structured console.warn STUB. Never throws; alerting must never
 *     take down the caller (cron/ops route).
 *
 * NO PII: alerts carry only tenant slug, severity, and a short reason string.
 */

export type Alert = {
  tenant: string
  severity: 'warning' | 'critical'
  kind: 'health_degraded' | 'no_recent_booking'
  reason: string
  meta?: Record<string, string | number | boolean | null>
}

export async function dispatchAlert(alert: Alert): Promise<{ delivered: boolean; channel: string }> {
  const payload = { ...alert, at: new Date().toISOString() }

  const webhook = process.env.ALERT_WEBHOOK_URL
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      })
      return { delivered: res.ok, channel: 'webhook' }
    } catch {
      console.warn('[alerts] webhook delivery failed', alert.tenant, alert.kind)
      return { delivered: false, channel: 'webhook' }
    }
  }

  if (process.env.ALERT_EMAIL_ENABLED === 'true') {
    try {
      const { sendEmail, ADMIN_EMAIL } = await import('./resend')
      const r = await sendEmail({
        to: ADMIN_EMAIL,
        subject: `[${alert.severity.toUpperCase()}] ${alert.tenant}: ${alert.kind}`,
        html: `<p>${alert.reason}</p><pre>${JSON.stringify(payload, null, 2)}</pre>`,
      })
      return { delivered: r.success, channel: 'email' }
    } catch {
      return { delivered: false, channel: 'email' }
    }
  }

  // STUB — no external channel configured. Visible in logs, never silent.
  console.warn('[alerts:stub] would dispatch alert:', JSON.stringify(payload))
  return { delivered: false, channel: 'stub' }
}
