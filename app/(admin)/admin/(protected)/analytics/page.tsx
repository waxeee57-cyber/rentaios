export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase'

async function getAnalytics() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [allEvents, recentEvents] = await Promise.all([
    supabaseAdmin
      .from('page_events')
      .select('event_type, page, created_at')
      .gte('created_at', thirtyDaysAgo),
    supabaseAdmin
      .from('page_events')
      .select('event_type, page, created_at')
      .gte('created_at', fourteenDaysAgo),
  ])

  const events = allEvents.data ?? []
  const recent = recentEvents.data ?? []

  const count = (type: string) => events.filter(e => e.event_type === type).length
  const pricingViews = count('pricing_view')
  const demoViews = count('demo_view')
  const formStarts = count('form_start')
  const formCompletes = count('form_complete')
  const convRate = formStarts > 0 ? Math.round((formCompletes / formStarts) * 100) : 0

  // Daily events last 14 days
  const byDay: Record<string, Record<string, number>> = {}
  for (const e of recent) {
    const day = e.created_at.slice(0, 10)
    if (!byDay[day]) byDay[day] = {}
    byDay[day][e.event_type] = (byDay[day][e.event_type] ?? 0) + 1
  }

  const days = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, counts]) => ({ date, total: Object.values(counts).reduce((s, n) => s + n, 0) }))

  const maxTotal = Math.max(...days.map(d => d.total), 1)

  // Top pages last 7 days
  const weekEvents = events.filter(e => e.created_at >= sevenDaysAgo)
  const pageCounts: Record<string, number> = {}
  for (const e of weekEvents) {
    if (e.page) pageCounts[e.page] = (pageCounts[e.page] ?? 0) + 1
  }
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  return { pricingViews, demoViews, formStarts, formCompletes, convRate, days, maxTotal, topPages, totalEvents: events.length }
}

export default async function AnalyticsPage() {
  const { pricingViews, demoViews, formStarts, formCompletes, convRate, days, maxTotal, topPages, totalEvents } = await getAnalytics()

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium text-white">Analytics</h1>
        <p className="font-sans text-xs text-muted mt-0.5">Last 30 days</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: 'Pricing views', value: pricingViews },
          { label: 'Demo sessions', value: demoViews },
          { label: 'Form starts', value: formStarts },
          { label: 'Completions', value: formCompletes },
          { label: 'Conversion', value: `${convRate}%` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-md border border-border bg-graphite/30 p-4">
            <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-muted mb-1">{label}</p>
            <p className="font-display text-2xl font-light text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Daily bar chart */}
      {days.length > 0 && (
        <div className="rounded-md border border-border bg-graphite/30 p-5 mb-6">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-4">Daily events — last 14 days</p>
          <div className="flex items-end gap-1 h-24">
            {days.map(({ date, total }) => (
              <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full rounded-t-sm bg-gold/40 group-hover:bg-gold transition-colors"
                  style={{ height: `${(total / maxTotal) * 100}%`, minHeight: total > 0 ? '2px' : '0' }}
                />
                <span className="pointer-events-none absolute bottom-full mb-1 hidden group-hover:block font-sans text-[10px] text-white bg-graphite border border-border rounded px-1.5 py-0.5 whitespace-nowrap">
                  {date.slice(5)}: {total}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="font-sans text-[10px] text-muted">{days[0]?.date.slice(5)}</span>
            <span className="font-sans text-[10px] text-muted">{days[days.length - 1]?.date.slice(5)}</span>
          </div>
        </div>
      )}

      {/* Top pages */}
      {topPages.length > 0 && (
        <div className="rounded-md border border-border bg-graphite/30 p-5 mb-6">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-4">Top pages — last 7 days</p>
          <div className="flex flex-col gap-2">
            {topPages.map(([page, count]) => (
              <div key={page} className="flex items-center justify-between">
                <span className="font-sans text-sm text-muted">{page}</span>
                <span className="font-sans text-sm font-medium text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalEvents === 0 && (
        <div className="rounded-md border border-border bg-graphite/30 p-5">
          <p className="font-sans text-sm text-muted">No events tracked yet. Analytics will populate as visitors use the site.</p>
        </div>
      )}

      <p className="font-sans text-xs text-muted/60 mt-4">
        Analytics are first-party and privacy-preserving. No cookies. No third-party trackers. Data retained for 90 days.
      </p>
    </div>
  )
}
