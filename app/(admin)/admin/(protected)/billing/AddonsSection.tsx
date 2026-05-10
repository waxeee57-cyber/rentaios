'use client'

import { useState } from 'react'
import Link from 'next/link'

type AddonKey = 'sms_notifications' | 'deposit_hold' | 'multi_language'

type ActiveAddon = {
  id: string
  addon_key: AddonKey
  status: string
  activated_at: string
}

type AddonsProps = {
  activeAddons: ActiveAddon[]
  stripeConfigured: boolean
  twilioConfigured: boolean
  planEligible: boolean
}

const ADDONS = [
  {
    key: 'sms_notifications' as AddonKey,
    name: 'SMS Notifications',
    price: '€19/month',
    desc: 'Send SMS confirmations and pickup reminders to customers. Requires a Twilio account.',
    requiresTwilio: true,
    requiresStripe: false,
    comingSoon: false,
  },
  {
    key: 'deposit_hold' as AddonKey,
    name: 'Online Deposit Hold',
    price: '€29/month',
    desc: 'Collect a refundable security deposit online when a customer confirms. Released automatically on return.',
    requiresTwilio: false,
    requiresStripe: true,
    comingSoon: false,
    note: 'Works for new bookings only.',
  },
  {
    key: 'multi_language' as AddonKey,
    name: 'Multi-language Site',
    price: '€29/month',
    desc: 'Your booking site in Spanish, French, German, or Italian. Customers see it in their browser language.',
    requiresTwilio: false,
    requiresStripe: false,
    comingSoon: true,
  },
]

function statusPill(available: boolean, label: string) {
  return (
    <span className={`rounded-sm px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.1em] ${
      available ? 'bg-success/15 text-success' : 'bg-gold/10 text-gold'
    }`}>
      {label}
    </span>
  )
}

export function AddonsSection({ activeAddons, stripeConfigured, twilioConfigured, planEligible }: AddonsProps) {
  const [loading, setLoading] = useState<AddonKey | null>(null)
  const [removeTarget, setRemoveTarget] = useState<AddonKey | null>(null)
  const [addons, setAddons] = useState<ActiveAddon[]>(activeAddons)

  const activeKeys = new Set(addons.filter(a => a.status === 'active').map(a => a.addon_key))

  async function addAddon(key: AddonKey) {
    setLoading(key)
    try {
      const res = await fetch('/api/admin/billing/addons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addon_key: key }),
      })
      if (res.ok) {
        const { addon } = await res.json()
        setAddons((prev) => [...prev, addon])
      }
    } finally {
      setLoading(null)
    }
  }

  async function removeAddon(key: AddonKey) {
    setLoading(key)
    try {
      const res = await fetch(`/api/admin/billing/addons/${key}`, { method: 'DELETE' })
      if (res.ok) {
        setAddons((prev) => prev.filter(a => a.addon_key !== key))
      }
    } finally {
      setLoading(null)
      setRemoveTarget(null)
    }
  }

  return (
    <div className="mt-6">
      <div className="rounded-md border border-border bg-graphite/30 p-5">
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-4">Add-ons</p>

        {!planEligible && (
          <p className="font-sans text-xs text-muted mb-4">
            Add-ons are available on Growth and Pro plans.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {ADDONS.map((addon) => {
            const isActive = activeKeys.has(addon.key)
            const available = addon.comingSoon
              ? false
              : addon.requiresTwilio
              ? twilioConfigured
              : addon.requiresStripe
              ? stripeConfigured
              : true

            const activeRecord = addons.find(a => a.addon_key === addon.key && a.status === 'active')

            return (
              <div key={addon.key} className="flex flex-col gap-2 rounded-md border border-border bg-black/30 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-sans text-sm font-medium text-white">{addon.name}</p>
                    <span className="font-sans text-xs text-gold">{addon.price}</span>
                    {addon.comingSoon && statusPill(false, 'Coming soon')}
                    {!addon.comingSoon && addon.requiresTwilio && statusPill(twilioConfigured, twilioConfigured ? 'Available' : 'Setup required')}
                    {!addon.comingSoon && addon.requiresStripe && !addon.requiresTwilio && statusPill(stripeConfigured, stripeConfigured ? 'Available' : 'Requires Stripe')}
                    {!addon.comingSoon && !addon.requiresTwilio && !addon.requiresStripe && statusPill(true, 'Available')}
                  </div>
                  <p className="font-sans text-xs leading-relaxed text-muted">{addon.desc}</p>
                  {addon.note && (
                    <p className="font-sans text-[10px] text-muted/60 mt-1">{addon.note}</p>
                  )}
                  {isActive && activeRecord && (
                    <p className="font-sans text-[10px] text-muted/60 mt-1">
                      Active since {new Date(activeRecord.activated_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>

                <div className="shrink-0 mt-2 sm:mt-0 sm:ml-4">
                  {addon.comingSoon ? (
                    <button
                      onClick={async () => {
                        await fetch('/api/waitlist/join', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ vertical: addon.key, source_page: '/admin/billing' }),
                        })
                      }}
                      className="min-h-[36px] rounded-md border border-border px-4 font-sans text-xs uppercase tracking-[0.1em] text-muted hover:border-gold/30 hover:text-white transition-colors"
                    >
                      Join waitlist
                    </button>
                  ) : isActive ? (
                    removeTarget === addon.key ? (
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-xs text-muted">Remove?</span>
                        <button
                          onClick={() => removeAddon(addon.key)}
                          disabled={loading === addon.key}
                          className="font-sans text-xs text-danger hover:underline underline-offset-4 disabled:opacity-50"
                        >
                          Confirm
                        </button>
                        <button onClick={() => setRemoveTarget(null)} className="font-sans text-xs text-muted hover:text-white">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRemoveTarget(addon.key)}
                        className="min-h-[36px] rounded-md border border-border px-4 font-sans text-xs uppercase tracking-[0.1em] text-muted hover:border-danger/40 hover:text-danger transition-colors"
                      >
                        Remove
                      </button>
                    )
                  ) : (
                    available && planEligible ? (
                      <button
                        onClick={() => addAddon(addon.key)}
                        disabled={loading === addon.key}
                        className="min-h-[36px] rounded-md border border-gold/40 px-4 font-sans text-xs uppercase tracking-[0.1em] text-gold hover:bg-gold hover:text-black transition-colors disabled:opacity-50"
                      >
                        {loading === addon.key ? 'Adding…' : 'Add to plan'}
                      </button>
                    ) : addon.requiresTwilio && !twilioConfigured ? (
                      <Link
                        href="/admin/settings#sms"
                        className="font-sans text-xs text-gold hover:underline underline-offset-4"
                      >
                        Configure Twilio →
                      </Link>
                    ) : null
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
