export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { formatPrice } from '@/lib/formatters'
import { formatInTimeZone } from 'date-fns-tz'
import { TZ } from '@/lib/formatters'

const PLAN_MRR: Record<string, number> = { starter: 79, growth: 149, pro: 249, white_glove: 299 }
const STRIPE_CONFIGURED = !!process.env.STRIPE_SECRET_KEY

async function getDashboardStats() {
  const todayMadrid = formatInTimeZone(new Date(), TZ, 'yyyy-MM-dd')
  const monthStart = formatInTimeZone(new Date(), TZ, 'yyyy-MM-01')
  const sixtyDaysOut = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const [inquiries, active, upcoming, revenue, subscription, newLeads, liveLeads, expiringVehicleDocs, unverifiedCustomerDocs] = await Promise.all([
    supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'inquiry'),
    supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'picked_up'),
    supabaseAdmin.from('bookings').select('id', { count: 'exact', head: true })
      .eq('status', 'confirmed')
      .gte('start_at', `${todayMadrid}T00:00:00+00:00`),
    supabaseAdmin.from('bookings').select('total_eur')
      .in('status', ['confirmed', 'picked_up', 'returned', 'completed'])
      .gte('created_at', `${monthStart}T00:00:00+00:00`),
    supabaseAdmin.from('subscriptions').select('plan, status, trial_ends_at').single(),
    supabaseAdmin.from('client_leads').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabaseAdmin.from('client_leads').select('id', { count: 'exact', head: true }).eq('status', 'live'),
    supabaseAdmin.from('vehicle_documents').select('id, expires_at', { count: 'exact', head: false })
      .not('expires_at', 'is', null)
      .lte('expires_at', sixtyDaysOut),
    supabaseAdmin.from('customer_documents').select('id', { count: 'exact', head: true }).eq('verified', false),
  ])

  const monthlyRevenue = (revenue.data ?? []).reduce(
    (sum: number, b: { total_eur: number }) => sum + (b.total_eur ?? 0),
    0
  )

  const sub = subscription.data
  const mrr = sub?.plan ? (PLAN_MRR[sub.plan] ?? 0) : 0
  const isTrialing = sub?.status === 'trialing'
  const trialDaysLeft = sub?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(sub.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  const today = new Date().toISOString().slice(0, 10)
  const vehicleDocList = (expiringVehicleDocs.data ?? []) as Array<{ id: string; expires_at: string }>
  const expiredVehicleDocs = vehicleDocList.filter((d) => d.expires_at < today).length
  const soonVehicleDocs = vehicleDocList.filter((d) => d.expires_at >= today).length

  return {
    inquiries: inquiries.count ?? 0,
    active: active.count ?? 0,
    upcoming: upcoming.count ?? 0,
    monthlyRevenue,
    plan: sub?.plan ?? null,
    planStatus: sub?.status ?? 'trialing',
    mrr,
    isTrialing,
    trialDaysLeft,
    newLeads: newLeads.count ?? 0,
    liveClients: liveLeads.count ?? 0,
    expiredVehicleDocs,
    soonVehicleDocs,
    unverifiedCustomerDocs: unverifiedCustomerDocs.count ?? 0,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  const showBusiness = stats.newLeads > 0 || stats.liveClients > 0 || STRIPE_CONFIGURED

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="font-display text-2xl font-medium text-white mb-6">Dashboard</h1>

      {/* Business metrics section */}
      {showBusiness && (
        <div className="mb-8 pb-8 border-b border-border">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-4">Your business</p>
          <div className="flex flex-wrap items-stretch gap-x-6 gap-y-4 divide-x divide-border">
            <Link href="/admin/billing" className="pr-6 group min-w-0">
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-1.5">Plan</p>
              <p className="font-sans text-sm font-medium text-white group-hover:text-gold transition-colors">
                {stats.isTrialing && stats.trialDaysLeft !== null
                  ? `Free trial â€” ${stats.trialDaysLeft}d left`
                  : stats.plan
                  ? `${stats.plan.replace('_', ' ')}`
                  : 'Trial'}
              </p>
            </Link>
            <div className="pl-6 pr-6">
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-1.5">MRR</p>
              {STRIPE_CONFIGURED && stats.mrr > 0 ? (
                <p className="font-sans text-sm font-medium text-white tabular-nums">{formatPrice(stats.mrr)}</p>
              ) : (
                <p className="font-sans text-sm text-muted" title={!STRIPE_CONFIGURED ? 'Connect Stripe in /admin/billing' : undefined}>
                  {STRIPE_CONFIGURED ? formatPrice(stats.mrr) : 'â€”'}
                </p>
              )}
            </div>
            {stats.newLeads > 0 && (
              <Link href="/admin/clients" className="pl-6 pr-6 group">
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-1.5">Setup requests</p>
                <p className="font-sans text-sm font-medium text-white group-hover:text-gold transition-colors">{stats.newLeads} new</p>
              </Link>
            )}
            {stats.liveClients > 0 && (
              <Link href="/admin/clients" className="pl-6 group">
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-1.5">Live clients</p>
                <p className="font-sans text-sm font-medium text-white group-hover:text-gold transition-colors">{stats.liveClients}</p>
              </Link>
            )}
          </div>
          {!STRIPE_CONFIGURED && (
            <p className="mt-4 font-sans text-xs text-muted/60">
              Connect Stripe in{' '}
              <Link href="/admin/billing" className="text-gold hover:underline underline-offset-4">
                Billing
              </Link>{' '}
              to see live revenue data.
            </p>
          )}
        </div>
      )}

      {/* Urgent: shown only when action is needed */}
      {stats.inquiries > 0 && (
        <Link
          href="/admin/bookings?filter=inquiries"
          className="flex items-center justify-between mb-6 rounded-md border border-gold/40 bg-gold/5 px-4 py-3.5 hover:border-gold/60 transition-colors"
        >
          <p className="font-sans text-sm text-white">
            <span className="text-gold font-medium">{stats.inquiries}</span>
            {' '}{stats.inquiries === 1 ? 'inquiry' : 'inquiries'} waiting for a response
          </p>
          <ArrowRight className="h-4 w-4 text-gold shrink-0" />
        </Link>
      )}

      {/* Context stats â€” compact strip, no cards */}
      <div className="flex items-stretch divide-x divide-border mb-8">
        <Link href="/admin/bookings?filter=active" className="pr-6 group">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-1.5">Active</p>
          <p className="font-sans text-xl font-medium text-white group-hover:text-gold transition-colors">{stats.active}</p>
        </Link>
        <Link href="/admin/bookings?filter=upcoming" className="px-6 group">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-1.5">Upcoming</p>
          <p className="font-sans text-xl font-medium text-white group-hover:text-gold transition-colors">{stats.upcoming}</p>
        </Link>
        <div className="pl-6">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-1.5">This month</p>
          <p className="font-sans text-xl font-medium text-white tabular-nums">{formatPrice(stats.monthlyRevenue)}</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href="/admin/bookings"
          className="flex items-center justify-center min-h-[44px] rounded-md border border-gold/40 px-4 py-2 text-xs font-sans uppercase tracking-[0.15em] text-gold hover:bg-gold hover:text-black transition-colors"
        >
          View all bookings
        </Link>
        <Link
          href="/admin/cars"
          className="flex items-center justify-center min-h-[44px] rounded-md border border-border px-4 py-2 text-xs font-sans uppercase tracking-[0.15em] text-muted hover:border-gold/30 hover:text-white transition-colors"
        >
          Manage fleet
        </Link>
      </div>

      {/* Documents widget â€” only when actionable */}
      {(stats.expiredVehicleDocs > 0 || stats.soonVehicleDocs > 0 || stats.unverifiedCustomerDocs > 0) && (
        <div className="mt-8 rounded-md border border-warning/30 bg-warning/5 px-4 py-4">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-warning mb-3">Documents needing attention</p>
          <div className="space-y-2">
            {stats.expiredVehicleDocs > 0 && (
              <Link href="/admin/cars" className="flex items-center justify-between group">
                <p className="font-sans text-sm text-white group-hover:text-gold transition-colors">
                  <span className="text-danger font-medium">{stats.expiredVehicleDocs}</span>{' '}
                  vehicle {stats.expiredVehicleDocs === 1 ? 'document' : 'documents'} expired
                </p>
                <ArrowRight className="h-3.5 w-3.5 text-muted group-hover:text-gold transition-colors" />
              </Link>
            )}
            {stats.soonVehicleDocs > 0 && (
              <Link href="/admin/cars" className="flex items-center justify-between group">
                <p className="font-sans text-sm text-white group-hover:text-gold transition-colors">
                  <span className="text-warning font-medium">{stats.soonVehicleDocs}</span>{' '}
                  vehicle {stats.soonVehicleDocs === 1 ? 'document' : 'documents'} expiring within 60 days
                </p>
                <ArrowRight className="h-3.5 w-3.5 text-muted group-hover:text-gold transition-colors" />
              </Link>
            )}
            {stats.unverifiedCustomerDocs > 0 && (
              <Link href="/admin/bookings" className="flex items-center justify-between group">
                <p className="font-sans text-sm text-white group-hover:text-gold transition-colors">
                  <span className="text-warning font-medium">{stats.unverifiedCustomerDocs}</span>{' '}
                  customer {stats.unverifiedCustomerDocs === 1 ? 'document' : 'documents'} unverified
                </p>
                <ArrowRight className="h-3.5 w-3.5 text-muted group-hover:text-gold transition-colors" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
