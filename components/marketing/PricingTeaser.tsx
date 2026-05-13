'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'

type Cadence = 'monthly' | 'annual'

const TIERS = [
  {
    key: 'starter',
    name: 'Starter',
    monthly: 79,
    annual: 790,
    annualSave: 158,
    items: 'Up to 5 items',
    features: ['Unlimited bookings', 'Email notifications', 'Admin panel', '14-day free trial'],
    cta: 'Start free trial →',
    href: '/pricing',
    highlight: false,
  },
  {
    key: 'growth',
    name: 'Growth',
    monthly: 149,
    annual: 1490,
    annualSave: 298,
    items: 'Up to 20 items',
    features: ['Everything in Starter', 'Transfer/delivery', 'Weekly report email', 'Referral program'],
    cta: 'Start free trial →',
    href: '/pricing',
    highlight: true,
  },
  {
    key: 'pro',
    name: 'Pro',
    monthly: 249,
    annual: 2490,
    annualSave: 498,
    items: 'Unlimited items',
    features: ['Everything in Growth', 'Custom domain included', 'Custom design & branding', 'Priority support'],
    cta: 'Start free trial →',
    href: '/pricing',
    highlight: false,
  },
]

export function PricingTeaser() {
  const [cadence, setCadence] = useState<Cadence>('monthly')

  return (
    <div>
      {/* Toggle */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 p-1">
          {(['monthly', 'annual'] as Cadence[]).map((c) => (
            <button
              key={c}
              onClick={() => setCadence(c)}
              className={`px-5 py-2 rounded font-sans text-xs uppercase tracking-[0.1em] transition-colors ${
                cadence === c ? 'bg-gold text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {c === 'monthly' ? 'Monthly' : 'Annual — save 2 months'}
            </button>
          ))}
        </div>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-start">
        {TIERS.map(({ key, name, monthly, annual, annualSave, items, features, cta, href, highlight }) => {
          const price = cadence === 'annual' ? annual : monthly
          const perMonth = cadence === 'annual' ? Math.round(annual / 12) : null

          return (
            <div
              key={key}
              className={`flex flex-col rounded-xl border ${
                highlight
                  ? 'border-2 border-gold bg-white shadow-2xl shadow-gold/15 relative z-10 p-10'
                  : 'border-gray-200 bg-white shadow-sm p-8'
              }`}
            >
              {highlight && (
                <div className="mb-4 self-start">
                  <span className="rounded-sm bg-gold px-3 py-1 font-sans text-[10px] uppercase tracking-[0.15em] text-white">
                    Most popular
                  </span>
                </div>
              )}

              <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">{name}</p>
              <p className="mt-1 font-sans text-xs text-muted/60">{items}</p>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-extrabold text-gray-900">€{price}</span>
                <span className="font-sans text-sm text-muted">{cadence === 'annual' ? '/ year' : '/ month'}</span>
              </div>
              {perMonth && (
                <p className="mt-1 font-sans text-xs text-muted">
                  €{perMonth}/mo equiv.{' '}
                  <span className="rounded-sm bg-gold/10 px-1.5 py-0.5 text-gold">Save €{annualSave}</span>
                </p>
              )}

              <ul className="my-8 flex flex-1 flex-col gap-3">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 shrink-0 text-gold" />
                    <span className="font-sans text-sm text-muted">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={href}
                className={`inline-flex items-center justify-center rounded-md px-6 py-3 font-sans text-xs uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  highlight
                    ? 'bg-gold text-white hover:opacity-90'
                    : 'border border-border text-muted hover:border-gold/40 hover:text-gray-900'
                }`}
              >
                {cta}
              </Link>
            </div>
          )
        })}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 font-sans text-sm text-gold underline-offset-4 hover:underline"
        >
          See full pricing details <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
