export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase'

async function getWaitlist() {
  const { data } = await supabaseAdmin
    .from('waitlist')
    .select('id, email, vertical, source_page, created_at')
    .order('created_at', { ascending: false })

  return data ?? []
}

async function getCounts() {
  const { data } = await supabaseAdmin
    .from('waitlist')
    .select('vertical')

  if (!data) return {}
  const counts: Record<string, number> = {}
  for (const row of data) {
    if (row.vertical) counts[row.vertical] = (counts[row.vertical] ?? 0) + 1
  }
  return counts
}

export default async function WaitlistPage() {
  const [entries, counts] = await Promise.all([getWaitlist(), getCounts()])

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="font-display text-2xl font-medium text-white mb-6">Waitlist</h1>

      {/* Demand signals */}
      {Object.keys(counts).length > 0 && (
        <div className="rounded-md border border-border bg-graphite/30 p-5 mb-6">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-4">Demand by vertical</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([vertical, count]) => (
                <div key={vertical} className="flex items-center gap-2 rounded-md border border-border bg-black/40 px-3 py-2">
                  <span className="font-sans text-xs text-white capitalize">{vertical.replace('_', ' ')}</span>
                  <span className="font-sans text-xs text-gold font-medium">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Entries table */}
      <div className="rounded-md border border-border bg-graphite/30 p-5">
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-4">
          All entries ({entries.length})
        </p>

        {entries.length === 0 ? (
          <p className="font-sans text-sm text-muted">No waitlist entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="border-b border-border">
                  {['Email', 'Vertical', 'Source', 'Date'].map(h => (
                    <th key={h} className="pb-3 text-left font-sans text-[10px] uppercase tracking-[0.15em] text-muted pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td className="py-3 pr-4 font-sans text-sm text-white">{e.email}</td>
                    <td className="py-3 pr-4 font-sans text-xs text-muted capitalize">
                      {e.vertical?.replace('_', ' ') ?? '—'}
                    </td>
                    <td className="py-3 pr-4 font-sans text-xs text-muted">{e.source_page ?? '—'}</td>
                    <td className="py-3 font-sans text-xs text-muted">
                      {new Date(e.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
