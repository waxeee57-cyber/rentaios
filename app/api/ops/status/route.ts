import { NextRequest, NextResponse } from 'next/server'
import { getHealthDetails, lastBookingAt } from '@/lib/health'
import { getLocalTenantSlug, getRemoteTenants } from '@/lib/ops-registry'

export const dynamic = 'force-dynamic'

const NO_BOOKING_ALERT_HOURS = 48

type TenantStatus = {
  slug: string
  scope: 'local' | 'remote'
  status: 'ok' | 'degraded' | 'unreachable'
  last_booking_at: string | null
  hours_since_booking: number | null
  no_recent_booking: boolean
  schema_version: number | null
  release: string | null
  url?: string
}

function hoursSince(iso: string | null): number | null {
  if (!iso) return null
  return Math.round(((Date.now() - new Date(iso).getTime()) / 3_600_000) * 10) / 10
}

/**
 * GET /api/ops/status — Domrol Ops, internal cross-tenant fleet view.
 *
 * Server-only auth: requires x-ops-secret == OPS_SECRET. Returns nothing if the
 * secret is unset (route disabled) so it can never be left open by accident.
 *
 * Reports, per tenant: health status, last real booking time + staleness flag,
 * schema version, last deploy (release sha). One tenant today; the shape is an
 * array so adding deployments is a config change, not a code change.
 */
export async function GET(req: NextRequest) {
  const opsSecret = process.env.OPS_SECRET
  if (!opsSecret || req.headers.get('x-ops-secret') !== opsSecret) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Local tenant — inspected directly.
  const [health, lastBooking] = await Promise.all([getHealthDetails(), lastBookingAt()])
  const localHours = hoursSince(lastBooking)
  const tenants: TenantStatus[] = [
    {
      slug: getLocalTenantSlug(),
      scope: 'local',
      status: health.status,
      last_booking_at: lastBooking,
      hours_since_booking: localHours,
      no_recent_booking: localHours !== null && localHours >= NO_BOOKING_ALERT_HOURS,
      schema_version: health.schema_version,
      release: health.release,
    },
  ]

  // Remote tenants — inspected via their own privileged /api/health.
  const remotes = getRemoteTenants()
  await Promise.all(
    remotes.map(async (t) => {
      const entry: TenantStatus = {
        slug: t.slug,
        scope: 'remote',
        status: 'unreachable',
        last_booking_at: null,
        hours_since_booking: null,
        no_recent_booking: false,
        schema_version: null,
        release: null,
        url: t.url,
      }
      try {
        const res = await fetch(`${t.url.replace(/\/$/, '')}/api/health`, {
          headers: t.healthSecret ? { 'x-health-secret': t.healthSecret } : {},
          signal: AbortSignal.timeout(8000),
        })
        if (res.ok || res.status === 503) {
          const body = await res.json()
          entry.status = body.status === 'ok' ? 'ok' : 'degraded'
          entry.schema_version = body.schema_version ?? null
          entry.release = body.release ?? null
        }
      } catch {
        // leave as unreachable
      }
      tenants.push(entry)
    })
  )

  const anyDegraded = tenants.some((t) => t.status !== 'ok')
  return NextResponse.json({
    overall: anyDegraded ? 'attention' : 'ok',
    tenant_count: tenants.length,
    tenants,
    ts: new Date().toISOString(),
  })
}
