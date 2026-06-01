import { NextRequest, NextResponse } from 'next/server'
import { getHealthDetails, pingDb } from '@/lib/health'

// Always run on-demand; never cached.
export const dynamic = 'force-dynamic'

/**
 * GET /api/health
 *
 * Public (no/invalid x-health-secret):
 *   { status: 'ok' | 'degraded' }   — 200 if ok, 503 if degraded.
 *   Reveals nothing else: no env names, no service inventory, no versions.
 *
 * Privileged (x-health-secret matches HEALTH_SECRET):
 *   Full HealthDetails — DB ping, env completeness + missing keys, Resend/Stripe
 *   configured flags, schema version, release sha.
 */
export async function GET(req: NextRequest) {
  const healthSecret = process.env.HEALTH_SECRET
  const authorized =
    !!healthSecret && req.headers.get('x-health-secret') === healthSecret

  if (!authorized) {
    // Minimal public probe — only liveness, nothing descriptive.
    const db = await pingDb()
    const status = db ? 'ok' : 'degraded'
    return NextResponse.json({ status }, { status: db ? 200 : 503 })
  }

  const details = await getHealthDetails()
  return NextResponse.json(details, { status: details.status === 'ok' ? 200 : 503 })
}
