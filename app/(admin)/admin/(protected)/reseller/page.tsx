export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { ResellerDashboard } from './ResellerDashboard'

async function getResellerData() {
  const [subRes, clientsRes] = await Promise.all([
    supabaseAdmin.from('subscriptions').select('plan, status').single(),
    supabaseAdmin
      .from('agency_clients')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  return {
    plan: subRes.data?.plan ?? null,
    clients: clientsRes.data ?? [],
  }
}

const PLAN_MRR: Record<string, number> = { starter: 49, growth: 99, pro: 199 }

export default async function ResellerPage() {
  const { plan, clients } = await getResellerData()

  if (plan !== 'agency') {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="font-display text-2xl font-medium text-white mb-6">Reseller</h1>
        <div className="rounded-md border border-border bg-graphite/30 p-6">
          <p className="font-sans text-sm font-medium text-white mb-2">Agency plan required</p>
          <p className="font-sans text-sm leading-relaxed text-muted mb-4">
            The reseller dashboard is available on the Agency plan. Upgrade to access revenue share,
            client management, and co-marketing.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center min-h-[40px] rounded-md border border-gold/40 px-5 font-sans text-xs uppercase tracking-[0.15em] text-gold hover:bg-gold hover:text-black transition-colors"
          >
            View Agency plan
          </Link>
        </div>
      </div>
    )
  }

  const monthlyGross = clients
    .filter(c => c.status === 'active')
    .reduce((sum: number, c: { client_plan: string | null }) => sum + (c.client_plan ? (PLAN_MRR[c.client_plan] ?? 0) : 0), 0)
  const monthlyShare = Math.round(monthlyGross * 0.7)

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="font-display text-2xl font-medium text-white mb-6">Reseller</h1>
      <ResellerDashboard
        clients={clients}
        monthlyGross={monthlyGross}
        monthlyShare={monthlyShare}
        siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'}
      />
    </div>
  )
}
