'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { OutreachLead } from './page'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'follow_up', label: 'Follow-up' },
  { key: 'replied', label: 'Replied' },
  { key: 'converted', label: 'Converted' },
  { key: 'unsubscribed', label: 'Unsubscribed' },
]

const STATUS_PILL: Record<string, string> = {
  new: 'bg-white/5 text-muted border-border',
  contacted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  follow_up_1: 'bg-gold/10 text-gold border-gold/20',
  follow_up_2: 'bg-gold/15 text-gold border-gold/30',
  replied: 'bg-success/10 text-success border-success/20',
  booked_demo: 'bg-success/15 text-success border-success/30',
  converted: 'bg-success/20 text-success border-success/40',
  unsubscribed: 'bg-white/5 text-muted/50 border-border',
  bounced: 'bg-danger/10 text-danger border-danger/20',
  not_interested: 'bg-white/5 text-muted/40 border-border',
}

function relativeTime(iso: string | null): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return weeks < 8 ? `${weeks}w ago` : `${Math.floor(days / 30)}mo ago`
}

function shortDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function downloadCsv(leads: OutreachLead[]) {
  const rows = [
    ['Email', 'First name', 'Company', 'Type', 'Location', 'Status', 'Sent', 'Replied'],
    ...leads.map(l => [
      l.email, l.first_name ?? '', l.company_name ?? '',
      l.business_type ?? '', l.location ?? '', l.status,
      l.email_sent_at ?? '', l.replied_at ?? '',
    ]),
  ]
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `outreach-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

type SendResult = { sent: number; skipped: number; errors: string[] } | null

export function OutreachClient({ leads: initial }: { leads: OutreachLead[] }) {
  const [leads, setLeads] = useState(initial)
  const [tab, setTab] = useState('all')
  const [addOpen, setAddOpen] = useState(false)
  const [csvInput, setCsvInput] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<SendResult>(null)
  const [noteFor, setNoteFor] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving] = useState(false)

  const filtered = leads.filter(l => {
    if (tab === 'all') return true
    if (tab === 'follow_up') return l.status === 'follow_up_1' || l.status === 'follow_up_2'
    return l.status === tab
  })

  async function updateLead(id: string, update: Record<string, unknown>) {
    const res = await fetch(`/api/admin/outreach/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(update),
    })
    if (res.ok) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...update } : l))
    }
  }

  async function handleSend() {
    const lines = csvInput.trim().split('\n').filter(Boolean)
    const leads = lines.map(line => {
      const [email, first_name, company_name, business_type, location] = line.split(',').map(s => s.trim())
      return { email, first_name, company_name, business_type, location }
    }).filter(l => l.email?.includes('@'))

    if (!leads.length) return

    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch('/api/admin/outreach/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ leads }),
      })
      const data = await res.json()
      setSendResult(data)
      if (data.sent > 0) {
        // Refresh leads — simplest approach is to reload the page data
        window.location.reload()
      }
    } finally {
      setSending(false)
    }
  }

  async function handleSaveNote() {
    if (!noteFor) return
    setSaving(true)
    await updateLead(noteFor, { notes: noteText })
    setSaving(false)
    setNoteFor(null)
    setNoteText('')
  }

  const noteTarget = noteFor ? leads.find(l => l.id === noteFor) : null

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        {/* Tabs */}
        <div className="flex gap-0 overflow-x-auto rounded-md border border-border">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'whitespace-nowrap px-3 py-2 font-sans text-xs transition-colors',
                tab === t.key ? 'bg-gold/15 text-gold' : 'text-muted hover:text-white'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadCsv(filtered)}
            className="rounded-md border border-border px-3 py-2 font-sans text-xs text-muted hover:text-white transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={() => { setAddOpen(true); setSendResult(null) }}
            className="rounded-md bg-gold px-4 py-2 font-sans text-xs font-medium text-black hover:opacity-90 transition-opacity"
          >
            + Add leads
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-white/10 p-12 text-center">
          <p className="font-sans text-sm text-muted">No leads yet.</p>
          <p className="font-sans text-xs text-muted/50 mt-1">Use the Add leads button to paste a CSV list.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                {['Company', 'Contact', 'Location', 'Status', 'Sent', 'Replied', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 font-sans text-[10px] uppercase tracking-[0.15em] text-muted whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(lead => (
                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-sans text-sm font-medium text-white whitespace-nowrap">
                      {lead.company_name || '—'}
                    </p>
                    {lead.business_type && (
                      <span className="inline-block mt-0.5 rounded-sm bg-white/5 border border-border px-1.5 py-0 font-sans text-[10px] text-muted">
                        {lead.business_type}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-sans text-sm text-white">{lead.first_name ?? ''} {lead.last_name ?? ''}</p>
                    <p className="font-sans text-[11px] text-muted/60">{lead.email}</p>
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-muted whitespace-nowrap">
                    {lead.location ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'rounded-sm border px-2 py-0.5 font-sans text-[11px] font-medium whitespace-nowrap',
                      STATUS_PILL[lead.status] ?? STATUS_PILL.new
                    )}>
                      {lead.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans text-xs text-muted whitespace-nowrap">
                    {relativeTime(lead.email_sent_at)}
                  </td>
                  <td className="px-4 py-3 font-sans text-xs text-muted whitespace-nowrap">
                    {shortDate(lead.replied_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {!['replied', 'booked_demo', 'converted', 'unsubscribed'].includes(lead.status) && (
                        <button
                          onClick={() => updateLead(lead.id, { status: 'replied', replied_at: new Date().toISOString() })}
                          className="rounded border border-border px-2 py-1 font-sans text-[11px] text-muted hover:text-white hover:border-gold/30 transition-colors whitespace-nowrap"
                        >
                          Replied
                        </button>
                      )}
                      {lead.status !== 'converted' && (
                        <button
                          onClick={() => updateLead(lead.id, { status: 'converted', converted_at: new Date().toISOString() })}
                          className="rounded border border-border px-2 py-1 font-sans text-[11px] text-muted hover:text-white hover:border-success/30 transition-colors"
                        >
                          Converted
                        </button>
                      )}
                      <button
                        onClick={() => { setNoteFor(lead.id); setNoteText(lead.notes ?? '') }}
                        className="rounded border border-border px-2 py-1 font-sans text-[11px] text-muted hover:text-white transition-colors"
                        title={lead.notes ?? 'Add note'}
                      >
                        {lead.notes ? '📝' : 'Note'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add leads modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg rounded-md border border-border bg-graphite p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-medium text-white">Add leads</h2>
              <button onClick={() => setAddOpen(false)} className="font-sans text-sm text-muted hover:text-white">✕</button>
            </div>
            <p className="font-sans text-xs text-muted mb-3">
              Paste one lead per line: <code className="text-gold">email, first_name, company, type, location</code>
            </p>
            <textarea
              value={csvInput}
              onChange={e => setCsvInput(e.target.value)}
              rows={8}
              placeholder="john@coastalcars.es, John, Coastal Cars, car rental, Marbella"
              className="w-full rounded-md border border-border bg-black/40 px-3 py-2 font-mono text-xs text-white placeholder:text-muted/40 focus:outline-none focus:border-gold/40"
            />
            {sendResult && (
              <div className="mt-3 rounded-md border border-border bg-black/40 p-3">
                <p className="font-sans text-xs text-white">
                  Sent: <span className="text-success">{sendResult.sent}</span>
                  {' · '}Skipped: <span className="text-muted">{sendResult.skipped}</span>
                  {sendResult.errors.length > 0 && (
                    <> · <span className="text-danger">{sendResult.errors.length} errors</span></>
                  )}
                </p>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setAddOpen(false)} className="rounded-md border border-border px-4 py-2 font-sans text-xs text-muted hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !csvInput.trim()}
                className="rounded-md bg-gold px-5 py-2 font-sans text-xs font-medium text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {sending ? 'Sending…' : 'Send emails'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note modal */}
      {noteFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-md border border-border bg-graphite p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-medium text-white">
                Note — {noteTarget?.company_name ?? noteTarget?.email}
              </h2>
              <button onClick={() => setNoteFor(null)} className="font-sans text-sm text-muted hover:text-white">✕</button>
            </div>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              rows={5}
              placeholder="Add a note about this lead…"
              className="w-full rounded-md border border-border bg-black/40 px-3 py-2 font-sans text-sm text-white placeholder:text-muted/40 focus:outline-none focus:border-gold/40"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setNoteFor(null)} className="rounded-md border border-border px-4 py-2 font-sans text-xs text-muted hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={saving}
                className="rounded-md bg-gold px-5 py-2 font-sans text-xs font-medium text-black hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
