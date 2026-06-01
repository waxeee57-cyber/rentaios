export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase-admin'
import { OutreachClient } from './OutreachClient'

export type OutreachLead = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  company_name: string | null
  business_type: string | null
  location: string | null
  status: string
  email_sent_at: string | null
  replied_at: string | null
  notes: string | null
  subject: string | null
  created_at: string
}

async function getStats() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [totalRes, repliedRes, convertedRes, weekRes] = await Promise.all([
    supabaseAdmin.from('cold_email_leads').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('cold_email_leads').select('id', { count: 'exact', head: true })
      .in('status', ['replied', 'booked_demo', 'converted']),
    supabaseAdmin.from('cold_email_leads').select('id', { count: 'exact', head: true })
      .eq('status', 'converted'),
    supabaseAdmin.from('cold_email_leads').select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo),
  ])

  const total = totalRes.count ?? 0
  const replied = repliedRes.count ?? 0
  const converted = convertedRes.count ?? 0
  const thisWeek = weekRes.count ?? 0
  const replyRate = total > 0 ? Math.round((replied / total) * 100) : 0

  return { total, replied, converted, thisWeek, replyRate }
}

async function getLeads(): Promise<OutreachLead[]> {
  const { data, error } = await supabaseAdmin
    .from('cold_email_leads')
    .select('id, email, first_name, last_name, company_name, business_type, location, status, email_sent_at, replied_at, notes, subject, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error('[Outreach] Failed to fetch leads:', error.message)
    return []
  }

  return (data ?? []) as OutreachLead[]
}

export default async function OutreachPage() {
  const [stats, leads] = await Promise.all([getStats(), getLeads()])

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-medium text-white">Outreach</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
        {[
          { label: 'Total contacted', value: stats.total },
          { label: `Replied (${stats.replyRate}%)`, value: stats.replied },
          { label: 'Converted', value: stats.converted },
          { label: 'This week', value: stats.thisWeek },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-md border border-border bg-graphite p-4">
            <p className="font-display text-2xl font-light text-white">{value}</p>
            <p className="font-sans text-[11px] uppercase tracking-[0.15em] text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      <OutreachClient leads={leads} />
    </div>
  )
}
