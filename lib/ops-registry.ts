import 'server-only'

/**
 * Tenant registry for the Domrol Ops view.
 *
 * RentalOS is single-tenant-per-deployment, so the *local* deployment is always
 * tenant #1 and is inspected directly via its own service-role DB client. The
 * registry is structured for multi-tenant from day one: additional tenants are
 * declared in the OPS_TENANTS env var (JSON) and inspected remotely by calling
 * their own /api/health with a shared health secret.
 *
 *   OPS_TENANTS='[{"slug":"costasol","url":"https://costasol.vercel.app","healthSecret":"..."}]'
 *
 * The local tenant's slug/label come from NEXT_PUBLIC_BUSINESS_NAME / config.
 */

export type RemoteTenant = {
  slug: string
  url: string
  healthSecret?: string
}

export function getLocalTenantSlug(): string {
  const name = process.env.NEXT_PUBLIC_BUSINESS_NAME
  if (name && !name.startsWith('http')) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'local'
  }
  return 'local'
}

export function getRemoteTenants(): RemoteTenant[] {
  const raw = process.env.OPS_TENANTS
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (t): t is RemoteTenant =>
        t && typeof t.slug === 'string' && typeof t.url === 'string'
    )
  } catch {
    console.warn('[ops] OPS_TENANTS is not valid JSON — ignoring')
    return []
  }
}
