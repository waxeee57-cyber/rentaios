'use client'

import { useState } from 'react'
import { Copy, Check, MessageCircle } from 'lucide-react'
import { formatPrice } from '@/lib/formatters'

type AgencyClient = {
  id: string
  agency_code: string
  client_business_name: string
  client_email: string
  client_plan: string | null
  client_domain: string | null
  status: string
  revenue_share_pct: number
  notes: string | null
  created_at: string
}

type Props = {
  clients: AgencyClient[]
  monthlyGross: number
  monthlyShare: number
  siteUrl: string
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="ml-1.5 text-muted hover:text-gold transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function AddClientModal({ agencyCode, siteUrl, onAdd, onClose }: {
  agencyCode: string
  siteUrl: string
  onAdd: (client: AgencyClient) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    client_business_name: '',
    client_email: '',
    client_plan: 'starter',
    client_domain: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/reseller/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, agency_code: agencyCode }),
    })
    if (res.ok) {
      const { client } = await res.json()
      onAdd(client)
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-md border border-border bg-graphite p-6">
        <h3 className="font-display text-xl font-light text-white mb-5">Add client</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { id: 'client_business_name', label: 'Business name', required: true },
            { id: 'client_email', label: 'Contact email', type: 'email', required: true },
            { id: 'client_domain', label: 'Domain (optional)' },
          ].map(({ id, label, type, required }) => (
            <div key={id} className="flex flex-col gap-1.5">
              <label className="font-sans text-xs uppercase tracking-[0.15em] text-muted">{label}</label>
              <input
                type={type ?? 'text'}
                required={required}
                value={form[id as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
                className="h-10 rounded-md border border-border bg-black/40 px-3 font-sans text-sm text-white placeholder:text-muted/40 focus:border-gold/40 focus:outline-none"
              />
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-xs uppercase tracking-[0.15em] text-muted">Plan</label>
            <select
              value={form.client_plan}
              onChange={e => setForm(f => ({ ...f, client_plan: e.target.value }))}
              className="h-10 rounded-md border border-border bg-black/40 px-3 font-sans text-sm text-white focus:border-gold/40 focus:outline-none"
            >
              <option value="starter">Starter — €49/mo</option>
              <option value="growth">Growth — €99/mo</option>
              <option value="pro">Pro — €199/mo</option>
            </select>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="min-h-[40px] rounded-md bg-gold px-5 font-sans text-xs uppercase tracking-[0.15em] text-black hover:opacity-90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Adding…' : 'Add client'}
            </button>
            <button type="button" onClick={onClose} className="font-sans text-xs text-muted hover:text-white">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const PLAN_MRR: Record<string, number> = { starter: 49, growth: 99, pro: 199 }

export function ResellerDashboard({ clients: initialClients, monthlyGross, monthlyShare, siteUrl }: Props) {
  const [clients, setClients] = useState(initialClients)
  const [showAddModal, setShowAddModal] = useState(false)

  const agencyCode = clients[0]?.agency_code ?? `AGENCY-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
  const onboardingUrl = `${siteUrl}/onboarding?agency=${agencyCode}`

  const gross = clients.filter(c => c.status === 'active').reduce((s, c) => s + (c.client_plan ? (PLAN_MRR[c.client_plan] ?? 0) : 0), 0)
  const share = Math.round(gross * 0.7)

  return (
    <>
      {showAddModal && (
        <AddClientModal
          agencyCode={agencyCode}
          siteUrl={siteUrl}
          onAdd={(c) => setClients(prev => [c, ...prev])}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Header */}
      <div className="rounded-md border border-border bg-graphite/30 p-5 mb-6">
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-3">Your agency code</p>
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-lg text-white">{agencyCode}</span>
          <CopyButton value={agencyCode} />
        </div>
        <p className="font-sans text-xs text-muted mb-4">Share this with clients to track their referral.</p>

        <div className="flex items-center gap-1.5 rounded-md border border-border bg-black/40 px-3 py-2 mb-3 max-w-lg">
          <span className="font-sans text-xs text-muted truncate flex-1">{onboardingUrl}</span>
          <CopyButton value={onboardingUrl} />
        </div>

        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Get your rental business online: ${onboardingUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-sans text-xs text-muted hover:text-white transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Share on WhatsApp
        </a>
      </div>

      {/* Monthly earnings */}
      <div className="flex gap-6 mb-6 divide-x divide-border">
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-1">This month</p>
          <p className="font-sans text-xl font-medium text-white">
            {formatPrice(share)}
            <span className="font-sans text-sm text-muted ml-2">your share</span>
          </p>
          <p className="font-sans text-xs text-muted mt-0.5">70% of {formatPrice(gross)} gross</p>
        </div>
        <div className="pl-6">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-1">Active clients</p>
          <p className="font-sans text-xl font-medium text-white">
            {clients.filter(c => c.status === 'active').length}
          </p>
        </div>
      </div>

      {/* Clients table */}
      <div className="rounded-md border border-border bg-graphite/30 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted">Client deployments</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="min-h-[32px] rounded-md border border-gold/40 px-4 font-sans text-[10px] uppercase tracking-[0.15em] text-gold hover:bg-gold hover:text-black transition-colors"
          >
            Add client manually
          </button>
        </div>

        {clients.length === 0 ? (
          <p className="font-sans text-sm text-muted">No clients yet. Share your onboarding link above to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-border">
                  {['Business', 'Domain', 'Plan', 'Monthly', 'Your share', 'Status'].map(h => (
                    <th key={h} className="pb-3 text-left font-sans text-[10px] uppercase tracking-[0.15em] text-muted pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map((c) => {
                  const mrr = c.client_plan ? (PLAN_MRR[c.client_plan] ?? 0) : 0
                  return (
                    <tr key={c.id}>
                      <td className="py-3 pr-4 font-sans text-sm text-white">{c.client_business_name}</td>
                      <td className="py-3 pr-4 font-sans text-xs text-muted">{c.client_domain ?? '—'}</td>
                      <td className="py-3 pr-4 font-sans text-xs text-muted capitalize">{c.client_plan ?? '—'}</td>
                      <td className="py-3 pr-4 font-sans text-xs text-muted">{mrr > 0 ? formatPrice(mrr) : '—'}</td>
                      <td className="py-3 pr-4 font-sans text-xs text-gold">{mrr > 0 ? formatPrice(Math.round(mrr * c.revenue_share_pct / 100)) : '—'}</td>
                      <td className="py-3">
                        <span className={`rounded-sm px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-[0.1em] ${
                          c.status === 'active' ? 'bg-success/15 text-success' : 'bg-muted/10 text-muted'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="font-sans text-xs text-muted">
        Payouts processed monthly on the 1st via bank transfer.{' '}
        <a href="/contact?subject=Payout+details" className="text-gold hover:underline underline-offset-4">
          Update payout details →
        </a>
      </p>
    </>
  )
}
