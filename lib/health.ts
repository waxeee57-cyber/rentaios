import 'server-only'
import { supabaseAdmin } from './supabase-admin'

/**
 * Centralised health/monitoring logic. Server-only — it reads the service-role
 * client and inspects env. Used by both /api/health and the Domrol Ops route.
 *
 * NOTHING here is allowed to be returned to an unauthenticated public caller
 * except the single `status` field (see app/api/health/route.ts).
 */

// Bump when a migration changes the schema the app depends on. Reported (not
// enforced) so an operator can spot a deploy/migration drift at a glance.
export const APP_SCHEMA_VERSION = 19

// Env vars the app cannot serve correctly without.
const REQUIRED_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

export type HealthDetails = {
  status: 'ok' | 'degraded'
  checks: {
    db: boolean
    env_complete: boolean
    missing_env: string[]
    resend_configured: boolean
    stripe_configured: boolean
  }
  schema_version: number
  release: string | null
  ts: string
}

function release(): string | null {
  return (
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.NEXT_PUBLIC_RELEASE ??
    null
  )
}

/** Cheap DB liveness ping via the service-role client. */
export async function pingDb(): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from('cars').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}

/** Full health snapshot — server-only callers only. */
export async function getHealthDetails(): Promise<HealthDetails> {
  const missing_env = REQUIRED_ENV.filter((k) => !process.env[k])
  const env_complete = missing_env.length === 0
  const db = await pingDb()

  const resendKey = process.env.RESEND_API_KEY ?? ''
  const resend_configured = resendKey.length > 0 && resendKey !== 'dev'
  const stripe_configured = !!process.env.STRIPE_SECRET_KEY

  // "degraded" = anything that breaks the core guest flow (DB or required env).
  // Resend/Stripe are tracked but do not by themselves flip the public status,
  // because the app degrades gracefully without them.
  const status: 'ok' | 'degraded' = db && env_complete ? 'ok' : 'degraded'

  return {
    status,
    checks: { db, env_complete, missing_env, resend_configured, stripe_configured },
    schema_version: APP_SCHEMA_VERSION,
    release: release(),
    ts: new Date().toISOString(),
  }
}

/** Timestamp of the most recent real (non-demo) booking, or null. */
export async function lastBookingAt(): Promise<string | null> {
  try {
    const { data } = await supabaseAdmin
      .from('bookings')
      .select('created_at')
      .eq('is_demo', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    return data?.created_at ?? null
  } catch {
    return null
  }
}
