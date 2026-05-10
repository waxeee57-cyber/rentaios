'use client'

import { useState, useRef, useCallback } from 'react'
import type { ClientLead } from './page'

const STATUS_COLUMNS = [
  { id: 'new', label: 'New' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'live', label: 'Live' },
  { id: 'cancelled', label: 'Cancelled' },
] as const

const CHECKLIST_LABELS: Record<string, string> = {
  payment_confirmed: 'Payment confirmed',
  supabase_created: 'Supabase created',
  domain_configured: 'Domain configured',
  business_config_set: 'Business config set',
  fleet_data_entered: 'Fleet data entered',
  test_booking_done: 'Test booking done',
  credentials_sent: 'Credentials sent',
  client_signed_off: 'Client signed off',
}

function timeAgo(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function BusinessTypeBadge({ type, custom }: { type: string; custom: string | null }) {
  const label = type === 'other' ? (custom ?? 'Other') : type
  return (
    <span className="inline-block rounded-sm border border-gold/20 bg-gold/5 px-2 py-0.5
      font-sans text-[10px] uppercase tracking-[0.1em] text-gold">
      {label}
    </span>
  )
}

function DataRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex gap-3 py-1.5 border-b border-border/50 last:border-0">
      <dt className="font-sans text-xs text-muted w-36 shrink-0">{label}</dt>
      <dd className="font-sans text-xs text-white break-all">{String(value)}</dd>
    </div>
  )
}

function ClientCard({ lead, onUpdate }: {
  lead: ClientLead
  onUpdate: (id: string, updates: Partial<ClientLead>) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState(lead.status)
  const [notes, setNotes] = useState(lead.admin_notes ?? '')
  const [checklist, setChecklist] = useState(lead.deployment_checklist)
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function updateStatus(newStatus: ClientLead['status']) {
    setStatus(newStatus)
    onUpdate(lead.id, { status: newStatus })
    await fetch(`/api/admin/clients/${lead.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
  }

  function handleNotesChange(value: string) {
    setNotes(value)
    if (notesTimer.current) clearTimeout(notesTimer.current)
    notesTimer.current = setTimeout(async () => {
      await fetch(`/api/admin/clients/${lead.id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: value }),
      })
    }, 300)
  }

  async function toggleChecklist(key: string) {
    const value = !checklist[key]
    const updated = { ...checklist, [key]: value }
    setChecklist(updated)
    onUpdate(lead.id, { deployment_checklist: updated })
    await fetch(`/api/admin/clients/${lead.id}/checklist`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
  }

  const completedCount = Object.values(checklist).filter(Boolean).length
  const totalCount = Object.keys(checklist).length

  const whatsappUrl = lead.contact_email
    ? `https://wa.me/?text=${encodeURIComponent(
        `Hi ${lead.contact_name.split(' ')[0]}, your ${lead.business_name} system is ready. Here are your login details: `
      )}`
    : null

  if (!expanded) {
    return (
      <div className="rounded-md border border-border bg-graphite/20 p-4 hover:border-border/80 transition-colors">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="font-sans text-sm font-medium text-white">{lead.business_name}</p>
            <p className="font-sans text-xs text-muted mt-0.5">{lead.business_city}, {lead.business_country}</p>
          </div>
          <BusinessTypeBadge type={lead.business_type} custom={lead.business_type_custom} />
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="font-sans text-xs text-muted">{timeAgo(lead.created_at)}</p>
          <button
            onClick={() => setExpanded(true)}
            className="font-sans text-xs text-gold hover:underline underline-offset-4"
          >
            Open
          </button>
        </div>
        {completedCount > 0 && (
          <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-1 rounded-full bg-gold/60 transition-all"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-md border border-gold/30 bg-graphite/30 p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="font-sans text-sm font-medium text-white">{lead.business_name}</p>
          <p className="font-sans text-xs text-muted mt-0.5">{lead.contact_name} · {lead.contact_email}</p>
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="font-sans text-xs text-muted hover:text-white transition-colors"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: form data + notes */}
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Intake data</p>
          <dl className="mb-5">
            <DataRow label="Business type" value={lead.business_type === 'other' ? lead.business_type_custom : lead.business_type} />
            <DataRow label="Location" value={`${lead.business_city}, ${lead.business_country}`} />
            <DataRow label="Booking method" value={lead.current_booking_method} />
            <DataRow label="Monthly bookings" value={lead.monthly_bookings_estimate} />
            <DataRow label="Fleet size" value={lead.vehicle_count ? `${lead.vehicle_count} units` : null} />
            <DataRow label="Domain" value={lead.domain_name} />
            <DataRow label="Language" value={lead.preferred_language} />
            <DataRow label="Brand color" value={lead.brand_color} />
            <DataRow label="Tagline" value={lead.tagline} />
            <DataRow label="Delivery base" value={lead.delivery_location} />
            <DataRow label="Delivery radius" value={lead.delivery_radius} />
            <DataRow label="Min age" value={`${lead.min_driver_age}`} />
            <DataRow label="Min licence" value={`${lead.min_license_years} year${lead.min_license_years !== 1 ? 's' : ''}`} />
            <DataRow label="Max days" value={`${lead.max_rental_days}`} />
            <DataRow label="Cancellation" value={lead.cancellation_policy} />
            <DataRow label="Notes" value={lead.notes} />
            <DataRow label="Heard via" value={lead.referral_source} />
          </dl>

          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold mb-2">Admin notes</p>
          <textarea
            value={notes}
            onChange={e => handleNotesChange(e.target.value)}
            placeholder="Internal notes about this client..."
            rows={4}
            className="w-full rounded-md border border-border bg-black/30 px-3 py-2.5
              font-sans text-xs text-white placeholder:text-muted resize-none
              focus:border-gold/40 focus:outline-none transition-colors"
          />
        </div>

        {/* Right: status + checklist + actions */}
        <div>
          <div className="mb-5">
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold mb-2">Status</p>
            <select
              value={status}
              onChange={e => updateStatus(e.target.value as ClientLead['status'])}
              className="w-full min-h-[40px] rounded-md border border-border bg-black/30 px-3
                font-sans text-xs text-white focus:border-gold/40 focus:outline-none transition-colors"
            >
              <option value="new" className="bg-graphite">New</option>
              <option value="contacted" className="bg-graphite">Contacted</option>
              <option value="in_progress" className="bg-graphite">In progress</option>
              <option value="live" className="bg-graphite">Live</option>
              <option value="cancelled" className="bg-graphite">Cancelled</option>
            </select>
          </div>

          <div className="mb-5">
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold mb-3">
              Deployment checklist — {completedCount}/{totalCount}
            </p>
            <div className="space-y-2">
              {Object.entries(CHECKLIST_LABELS).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={!!checklist[key]}
                    onChange={() => toggleChecklist(key)}
                    className="h-4 w-4 rounded border-border accent-gold cursor-pointer"
                  />
                  <span className={`font-sans text-xs transition-colors ${
                    checklist[key] ? 'text-muted line-through' : 'text-white group-hover:text-white/80'
                  }`}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-whatsapp px-4 py-2.5
                font-sans text-xs font-medium text-white hover:opacity-90 transition-opacity"
            >
              WhatsApp {lead.contact_name.split(' ')[0]}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export function ClientsList({ initialLeads }: { initialLeads: ClientLead[] }) {
  const [leads, setLeads] = useState<ClientLead[]>(initialLeads)

  const handleUpdate = useCallback((id: string, updates: Partial<ClientLead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))
  }, [])

  return (
    <div className="space-y-8">
      {STATUS_COLUMNS.map(col => {
        const colLeads = leads.filter(l => {
          if (col.id === 'in_progress') return l.status === 'in_progress' || l.status === 'contacted'
          return l.status === col.id
        })
        return (
          <div key={col.id}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted">{col.label}</h2>
              <span className="font-sans text-xs text-white/40">{colLeads.length}</span>
            </div>
            {colLeads.length === 0 ? (
              <p className="font-sans text-xs text-muted/50 py-4 border border-dashed border-border/30 rounded-md text-center">
                None
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {colLeads.map(lead => (
                  <ClientCard key={lead.id} lead={lead} onUpdate={handleUpdate} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
