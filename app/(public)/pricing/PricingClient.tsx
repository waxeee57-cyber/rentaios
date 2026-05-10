'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, Info } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

type Cadence = 'monthly' | 'annual'
type CurrencyCode = 'EUR' | 'GBP' | 'AED' | 'USD'

const AED_RATE = parseFloat(process.env.NEXT_PUBLIC_AED_RATE ?? '4.1')

const RATES: Record<CurrencyCode, number> = {
  EUR: 1,
  GBP: 0.855,
  AED: AED_RATE,
  USD: 1.09,
}

const SYMBOLS: Record<CurrencyCode, string> = {
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  USD: '$',
}

function fmtPrice(eur: number, currency: CurrencyCode): string {
  const converted = Math.round(eur * RATES[currency])
  return `${SYMBOLS[currency]}${converted}`
}

type Tier = {
  key: string
  name: string
  monthlyEur: number
  annualEur: number
  annualSavingEur: number
  highlight: boolean
  badge?: string
  features: string[]
  everything?: string
  extras?: string[]
  cta: string
  href: string
  agency?: boolean
}

const TIERS: Tier[] = [
  {
    key: 'starter',
    name: 'Starter',
    monthlyEur: 49,
    annualEur: 490,
    annualSavingEur: 98,
    highlight: false,
    features: [
      '1–3 vehicles',
      'Up to 30 bookings per month',
      'Email notifications',
      'Admin panel',
      'Mobile-friendly public site',
      '14-day free trial',
    ],
    cta: 'Start free trial',
    href: '/admin/billing',
  },
  {
    key: 'growth',
    name: 'Growth',
    monthlyEur: 99,
    annualEur: 990,
    annualSavingEur: 198,
    highlight: true,
    badge: 'Most popular',
    features: [
      '4–10 vehicles',
      'Unlimited bookings',
    ],
    everything: 'Starter',
    extras: [
      'Transfer/delivery with fee management',
      'Weekly automated report email',
      'Priority email support (48h)',
      'Referral program access',
    ],
    cta: 'Start free trial',
    href: '/admin/billing',
  },
  {
    key: 'pro',
    name: 'Pro',
    monthlyEur: 199,
    annualEur: 1990,
    annualSavingEur: 398,
    highlight: false,
    features: [
      'Unlimited vehicles',
      'Unlimited bookings',
    ],
    everything: 'Growth',
    extras: [
      'Custom domain setup included',
      'SMS notifications add-on available',
      'Agency reseller eligible',
      '"Powered by RentalOS" badge removable',
    ],
    cta: 'Start free trial',
    href: '/admin/billing',
  },
  {
    key: 'agency',
    name: 'Agency',
    monthlyEur: 499,
    annualEur: 499 * 10,
    annualSavingEur: 499 * 2,
    highlight: false,
    agency: true,
    features: [
      'Unlimited client deployments',
      'Full white-label rights',
      'Reseller dashboard',
      'Revenue share: 70% of client subscriptions',
      'Priority support (24h guaranteed)',
      'Onboarding call included',
      'Listed on rentaios.com/agencies',
    ],
    cta: 'Apply for agency plan',
    href: '/contact?subject=Agency+plan+application',
  },
]

const COMPARISON_ROWS: Array<{
  feature: string
  tooltip: string
  starter: string | boolean
  growth: string | boolean
  pro: string | boolean
}> = [
  {
    feature: 'Vehicles',
    tooltip: 'How many cars, yachts, or villas you can list on your public booking site.',
    starter: '1–3',
    growth: '4–10',
    pro: 'Unlimited',
  },
  {
    feature: 'Bookings per month',
    tooltip: 'Confirmed reservations taken via your booking site.',
    starter: '30',
    growth: 'Unlimited',
    pro: 'Unlimited',
  },
  {
    feature: 'Email notifications',
    tooltip: 'Automated emails sent to customers on inquiry, confirmation, and cancellation.',
    starter: true,
    growth: true,
    pro: true,
  },
  {
    feature: 'Transfer/delivery',
    tooltip: 'Customer requests pickup at their hotel or address. You set the fee before confirming.',
    starter: false,
    growth: true,
    pro: true,
  },
  {
    feature: 'Weekly report email',
    tooltip: 'Automated Monday morning summary: inquiries, confirmed bookings, revenue, upcoming pickups.',
    starter: false,
    growth: true,
    pro: true,
  },
  {
    feature: 'Referral program',
    tooltip: 'Share your referral link. Earn credits when contacts sign up.',
    starter: false,
    growth: true,
    pro: true,
  },
  {
    feature: 'Custom domain setup',
    tooltip: 'We configure your domain (yourcompany.com) and SSL. Completed within 24 hours.',
    starter: false,
    growth: false,
    pro: true,
  },
  {
    feature: 'Badge removable',
    tooltip: 'Remove the "Powered by RentalOS" attribution from your public site footer.',
    starter: false,
    growth: false,
    pro: true,
  },
]

const ONE_TIME = [
  {
    name: 'Custom Domain Setup',
    price: '€149',
    cadence: 'once',
    desc: 'We connect your domain to your RentalOS site. Includes SSL, DNS guidance, and email forwarding. Completed within 24 hours.',
    cta: 'Request setup',
    href: '/onboarding?type=domain_setup',
  },
  {
    name: 'Done-for-you Setup',
    price: '€499',
    cadence: 'once',
    desc: 'We deploy and configure your complete RentalOS system. Your admin login details delivered within 48 hours.',
    cta: 'Get started',
    href: '/onboarding',
  },
  {
    name: 'Template',
    price: '€299',
    cadence: 'once',
    desc: 'Full source code. Deploy it yourself. Commercial licence — use it commercially, resell to clients, white-label freely.',
    cta: 'Buy template',
    href: '/sell',
  },
]

const FAQ_ITEMS = [
  {
    q: 'Is there a free trial?',
    a: '14 days, no credit card required. Full access to all features on the plan you choose.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from Admin → Billing. Your data remains accessible until the end of your billing period.',
  },
  {
    q: 'What happens after the trial ends?',
    a: "Choose a plan to continue. If you don't, your admin panel becomes read-only and no new bookings can be taken.",
  },
  {
    q: 'Do you offer refunds?',
    a: '30-day money-back guarantee on the first paid month. If you are not satisfied, we refund in full.',
  },
  {
    q: 'Can I upgrade or downgrade?',
    a: 'Yes, anytime from Admin → Billing. Changes take effect on your next billing cycle.',
  },
]

const CURRENCIES: CurrencyCode[] = ['EUR', 'GBP', 'AED', 'USD']
const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  EUR: '€ EUR',
  GBP: '£ GBP',
  AED: 'AED د.إ',
  USD: '$ USD',
}

function CheckCell({ value }: { value: string | boolean }) {
  if (value === false) return <span className="font-sans text-sm text-muted/40">—</span>
  if (value === true) return <Check className="h-4 w-4 text-gold mx-auto" />
  return <span className="font-sans text-sm text-white">{value}</span>
}

function Tooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex ml-1.5 align-middle">
      <Info className="h-3 w-3 text-muted/40 cursor-help" />
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-md bg-graphite border border-border px-2.5 py-2 font-sans text-xs text-muted leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity z-10 text-center">
        {text}
      </span>
    </span>
  )
}

export function PricingClient({ stripeConfigured }: { stripeConfigured: boolean }) {
  const [cadence, setCadence] = useState<Cadence>('monthly')
  const [currency, setCurrency] = useState<CurrencyCode>('EUR')

  useEffect(() => {
    const stored = localStorage.getItem('pricing_currency') as CurrencyCode | null
    if (stored && CURRENCIES.includes(stored)) setCurrency(stored)
    trackEvent('pricing_view')
  }, [])

  function handleCurrencyChange(c: CurrencyCode) {
    setCurrency(c)
    localStorage.setItem('pricing_currency', c)
  }

  const displayPrice = (t: Tier): { main: string; sub?: string; save?: string } => {
    if (t.agency) {
      return { main: 'Contact us' }
    }
    if (cadence === 'annual') {
      const monthly = fmtPrice(Math.round(t.annualEur / 12 * 100) / 100, currency)
      const annual = fmtPrice(t.annualEur, currency)
      const save = fmtPrice(t.annualSavingEur, currency)
      return { main: annual, sub: `${monthly}/mo`, save: `Save ${save}` }
    }
    return { main: fmtPrice(t.monthlyEur, currency) }
  }

  return (
    <>
      {/* Hero */}
      <section className="py-24 md:py-32 bg-black">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Pricing</p>
          <h1 className="mb-4 font-display text-5xl font-light tracking-[-0.02em] text-white md:text-6xl">
            Simple, honest pricing
          </h1>
          <p className="font-sans text-base leading-relaxed text-muted">
            Start with a 14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Tier cards */}
      <section className="bg-graphite py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">

          {/* Toggles */}
          <div className="flex flex-col gap-4 mb-10 sm:flex-row sm:items-center sm:justify-between">
            {/* Billing cadence */}
            <div className="flex items-center gap-1 rounded-md border border-border bg-black/40 p-1 self-start">
              {(['monthly', 'annual'] as Cadence[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCadence(c)}
                  className={`px-4 py-1.5 rounded font-sans text-xs uppercase tracking-[0.1em] transition-colors ${
                    cadence === c
                      ? 'bg-gold text-black'
                      : 'text-muted hover:text-white'
                  }`}
                >
                  {c === 'monthly' ? 'Monthly' : 'Annual — save 17%'}
                </button>
              ))}
            </div>

            {/* Currency */}
            <div className="flex items-center gap-1 rounded-md border border-border bg-black/40 p-1 self-start">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  onClick={() => handleCurrencyChange(c)}
                  className={`px-3 py-1.5 rounded font-sans text-xs transition-colors ${
                    currency === c
                      ? 'bg-gold/20 text-gold'
                      : 'text-muted hover:text-white'
                  }`}
                >
                  {CURRENCY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          {/* Simplicity framing (Objection 5) */}
          <div className="mb-8 rounded-md border border-border bg-black/30 px-5 py-4 max-w-lg">
            <p className="font-sans text-sm text-muted leading-relaxed">
              The only thing you do in the admin panel: click{' '}
              <span className="font-medium text-white">Confirm</span> when a booking arrives.
            </p>
            <p className="mt-1.5 font-sans text-xs text-muted/60 leading-relaxed">
              Everything else — the email to the customer, the calendar update, the weekly report — happens automatically.
            </p>
          </div>

          {/* ROI framing (Objection 4) */}
          <div className="mb-10 max-w-xl">
            <h3 className="mb-4 font-display text-2xl font-light text-white">
              What does one missed booking cost you?
            </h3>
            <div className="flex flex-col gap-2 mb-4">
              {[
                'One missed booking at €500 = 10 months of RentalOS Starter.',
                'One missed booking at €1,000 = 20 months.',
                'One missed booking at €2,000 = 40 months.',
              ].map(line => (
                <p key={line} className="font-sans text-sm text-muted">{line}</p>
              ))}
            </div>
            <p className="font-sans text-sm text-muted/70 leading-relaxed">
              RentalOS captures inquiries at 11pm, on weekends, and while you&apos;re with a customer.
              The question is not whether it pays for itself. The question is how quickly.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((tier) => {
              const price = displayPrice(tier)
              const isAgency = tier.agency
              return (
                <div
                  key={tier.key}
                  className={`relative flex flex-col rounded-md border p-6 ${
                    tier.highlight
                      ? 'border-gold/50 bg-gold/5 ring-1 ring-gold/10 md:scale-[1.02]'
                      : isAgency
                      ? 'border-gold/30 bg-black'
                      : 'border-border bg-black/40'
                  }`}
                >
                  {tier.badge && (
                    <div className="mb-4">
                      <span className="rounded-sm bg-gold/15 px-2.5 py-0.5 font-sans text-[10px] uppercase tracking-[0.15em] text-gold">
                        {tier.badge}
                      </span>
                    </div>
                  )}
                  {isAgency && (
                    <div className="mb-4">
                      <span className="rounded-sm border border-gold/30 px-2.5 py-0.5 font-sans text-[10px] uppercase tracking-[0.15em] text-gold">
                        For agencies
                      </span>
                    </div>
                  )}

                  <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">{tier.name}</p>

                  {isAgency ? (
                    <div className="mt-3 mb-6">
                      <span className="font-display text-2xl font-light text-white">{fmtPrice(499, currency)}</span>
                      <span className="font-sans text-sm text-muted ml-1.5">/ month</span>
                    </div>
                  ) : price.main === 'Contact us' ? (
                    <div className="mt-3 mb-6">
                      <span className="font-display text-3xl font-light text-white">Contact us</span>
                    </div>
                  ) : (
                    <div className="mt-3 mb-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-display text-3xl font-light text-white">{price.main}</span>
                        {cadence === 'monthly' && (
                          <span className="font-sans text-sm text-muted">/ month</span>
                        )}
                      </div>
                      {price.sub && (
                        <p className="font-sans text-xs text-muted mt-0.5">{price.sub} equivalent</p>
                      )}
                      {price.save && (
                        <span className="inline-block mt-1.5 rounded-sm bg-gold/10 px-2 py-0.5 font-sans text-[10px] text-gold">
                          {price.save}
                        </span>
                      )}
                    </div>
                  )}

                  {cadence === 'annual' && !isAgency && <div className="mb-4" />}

                  <ul className="flex flex-1 flex-col gap-2.5 mb-6">
                    {tier.everything && (
                      <li className="font-sans text-xs text-muted italic">
                        Everything in {tier.everything}, plus:
                      </li>
                    )}
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                        <span className="font-sans text-sm text-muted">{f}</span>
                      </li>
                    ))}
                    {tier.extras?.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                        <span className="font-sans text-sm text-muted">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={
                      isAgency
                        ? tier.href
                        : stripeConfigured
                        ? tier.href
                        : '/onboarding'
                    }
                    onClick={() => {
                      if (!isAgency) trackEvent('cta_click', undefined, { cta: 'start_trial', tier: tier.key, cadence })
                    }}
                    className={`inline-flex items-center justify-center min-h-[44px] rounded-md px-5 font-sans text-xs uppercase tracking-[0.1em] transition-colors ${
                      tier.highlight
                        ? 'bg-gold text-black hover:opacity-90'
                        : isAgency
                        ? 'border border-gold/40 text-gold hover:bg-gold hover:text-black'
                        : 'border border-border text-muted hover:border-gold/40 hover:text-white'
                    }`}
                  >
                    {!isAgency && !stripeConfigured && !tier.agency
                      ? 'Get started'
                      : tier.cta}
                  </Link>
                  {tier.key === 'starter' && (
                    <p className="mt-3 font-sans text-[11px] text-muted/50 text-center">
                      Less than the cost of one missed booking.
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {cadence === 'annual' && (
            <p className="mt-6 font-sans text-xs text-muted text-center">
              Annual plans are billed once per year. Cancel before renewal for a full refund within 30 days.
            </p>
          )}

          {currency !== 'EUR' && (
            <p className="mt-3 font-sans text-xs text-muted/60 text-center">
              All plans billed in EUR. {currency} prices shown for reference and may vary with exchange rates.
            </p>
          )}

          <p className="mt-6 font-sans text-xs text-muted/50 text-center">
            Export all your data anytime from Admin → Settings.
            Bookings, customers, fleet — your CSV, your records.
          </p>
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-black py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Compare</p>
            <h2 className="font-display text-3xl font-light tracking-tight text-white">
              What's included
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-4 text-left font-sans text-xs uppercase tracking-[0.15em] text-muted w-1/3">
                    Feature
                  </th>
                  {['Starter', 'Growth', 'Pro'].map((n) => (
                    <th key={n} className="pb-4 font-sans text-xs uppercase tracking-[0.15em] text-white text-center">
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature}>
                    <td className="py-3.5 font-sans text-sm text-muted pr-4">
                      {row.feature}
                      <Tooltip text={row.tooltip} />
                    </td>
                    <td className="py-3.5 text-center"><CheckCell value={row.starter} /></td>
                    <td className="py-3.5 text-center"><CheckCell value={row.growth} /></td>
                    <td className="py-3.5 text-center"><CheckCell value={row.pro} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* One-time services */}
      <section className="bg-graphite py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">One-time</p>
            <h2 className="font-display text-3xl font-light tracking-tight text-white">
              Prefer to own it outright?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {ONE_TIME.map(({ name, price, cadence: c, desc, cta, href }) => (
              <div key={name} className="flex flex-col gap-4 rounded-md border border-border bg-black/40 p-6">
                <div>
                  <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">{name}</p>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="font-display text-3xl font-light text-white">{price}</span>
                    <span className="font-sans text-sm text-muted">{c}</span>
                  </div>
                </div>
                <p className="font-sans text-sm leading-relaxed text-muted flex-1">{desc}</p>
                <Link
                  href={href}
                  className="inline-flex items-center gap-1.5 font-sans text-sm text-gold underline-offset-4 hover:underline"
                >
                  {cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-black py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-10">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Questions</p>
            <h2 className="font-display text-3xl font-light tracking-tight text-white">FAQ</h2>
          </div>
          <div className="divide-y divide-border">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="py-6">
                <p className="mb-2 font-sans text-sm font-medium text-white">{q}</p>
                <p className="font-sans text-sm leading-relaxed text-muted">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
