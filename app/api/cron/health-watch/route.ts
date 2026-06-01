import { NextRequest, NextResponse } from 'next/server'
import { getHealthDetails, lastBookingAt } from '@/lib/health'
import { getLocalTenantSlug } from '@/lib/ops-registry'
import { dispatchAlert } from '@/lib/alerts'

export const dynamic = 'force-dynamic'

const NO_BOOKING_ALERT_HOURS = 48

/**
 * GET /api/cron/health-watch (Vercel cron, hourly)
 *
 * Evaluates the local tenant and dispatches an alert when:
 *   - health is degraded (DB down / required env missing)  -> critical
 *   - no real booking in the last 48h                      -> warning
 *
 * Alert delivery is handled by lib/alerts.dispatchAlert (webhook / email /
 * logged stub). Auth matches the other crons: Authorization: Bearer CRON_SECRET.
 */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tenant = getLocalTenantSlug()
  const [health, lastBooking] = await Promise.all([getHealthDetails(), lastBookingAt()])
  const dispatched: string[] = []

  if (health.status === 'degraded') {
    await dispatchAlert({
      tenant,
      severity: 'critical',
      kind: 'health_degraded',
      reason: `Health degraded: db=${health.checks.db}, env_complete=${health.checks.env_complete}`,
      meta: { missing_env: health.checks.missing_env.join(',') || 'none' },
    })
    dispatched.push('health_degraded')
  }

  const hours = lastBooking
    ? (Date.now() - new Date(lastBooking).getTime()) / 3_600_000
    : null
  if (hours !== null && hours >= NO_BOOKING_ALERT_HOURS) {
    await dispatchAlert({
      tenant,
      severity: 'warning',
      kind: 'no_recent_booking',
      reason: `No real booking in ${Math.round(hours)}h (threshold ${NO_BOOKING_ALERT_HOURS}h).`,
      meta: { hours_since_booking: Math.round(hours) },
    })
    dispatched.push('no_recent_booking')
  }

  return NextResponse.json({
    ok: true,
    status: health.status,
    dispatched,
    checked_at: new Date().toISOString(),
  })
}
