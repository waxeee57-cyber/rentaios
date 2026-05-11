'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, Info } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import { PlanQuiz } from '@/components/marketing/PlanQuiz'

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
      'Custom design and branding',
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
      'Listed on domrol.com/agencies',
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
    feature: 'Custom design',
    tooltip: 'Tailored colour scheme, typography, and layout to match your brand identity. Delivered as part of setup.',
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

function RoiCalculator() {
  return (
    <div className="mb-10 max-w-xl">
      <h3 className="mb-6 font-display text-2xl font-bold text-gray-900">
        What does one missed booking cost you?
      </h3>
      <div className="mb-2">
        <span className="font-display leading-none text-gold" style={{ fontSize: '4rem' }}>€300</span>
        <p className="mt-2 font-sans text-sm text-muted">The average value of one missed booking.</p>
      </div>
      <div className="mt-8 rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="py-2.5 px-4 text-left font-sans text-[10px] uppercase tracking-[0.15em] text-muted">Missed / month</th>
              <th className="py-2.5 px-4 text-right font-sans text-[10px] uppercase tracking-[0.15em] text-muted">Lost / year</th>
              <th className="py-2.5 px-4 text-right font-sans text-[10px] uppercase tracking-[0.15em] text-gold">RentalOS / year</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <td className="py-3 px-4 font-sans text-sm text-gray-900">1</td>
              <td className="py-3 px-4 text-right font-sans text-sm text-muted">€3,600</td>
              <td className="py-3 px-4 text-right font-sans text-sm text-gold">€588</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-sans text-sm text-gray-900">2</td>
              <td className="py-3 px-4 text-right font-sans text-sm text-muted">€7,200</td>
              <td className="py-3 px-4 text-right font-sans text-sm text-gold">€588</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-sans text-sm text-gray-900">5</td>
              <td className="py-3 px-4 text-right font-sans text-sm text-muted">€18,000</td>
              <td className="py-3 px-4 text-right font-sans text-sm text-gold">€588</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-4 font-sans text-xs text-muted/60 leading-relaxed">
        RentalOS costs €588/year. One recovered booking pays for it.
      </p>
    </div>
  )
}

function CheckCell({ value }: { value: string | boolean }) {
  if (value === false) return <span className="font-sans text-sm text-muted/40">—</span>
  if (value === true) return <Check className="h-4 w-4 text-gold mx-auto" />
  return <span className="font-sans text-sm text-gray-900">{value}</span>
}

function Tooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex ml-1.5 align-middle">
      <Info className="h-3 w-3 text-muted/40 cursor-help" />
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-md bg-gray-800 border border-gray-700 px-2.5 py-2 font-sans text-xs text-gray-200 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity z-10 text-center">
        {text}
      </span>
    </span>
  )
}

type Props = {
  stripeConfigured: boolean
  starterPriceId: string | null
  growthPriceId: string | null
  proPriceId: string | null
  starterAnnualPriceId: string | null
  growthAnnualPriceId: string | null
  proAnnualPriceId: string | null
}

export function PricingClient({
  stripeConfigured,
  starterPriceId,
  growthPriceId,
  proPriceId,
  starterAnnualPriceId,
  growthAnnualPriceId,
  proAnnualPriceId,
}: Props) {
  const [cadence, setCadence] = useState<Cadence>('monthly')
  const [currency, setCurrency] = useState<CurrencyCode>('EUR')
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [showMore, setShowMore] = useState(false)

  async function handleCheckout(tierKey: string) {
    const priceIdMap: Record<string, string | null> = {
      starter: cadence === 'annual' ? starterAnnualPriceId : starterPriceId,
      growth: cadence === 'annual' ? growthAnnualPriceId : growthPriceId,
      pro: cadence === 'annual' ? proAnnualPriceId : proPriceId,
    }
    const priceId = priceIdMap[tierKey] ?? null
    if (!priceId) return
    setCheckoutLoading(tierKey)
    setCheckoutError(null)
    try {
      trackEvent('cta_click', undefined, { cta: 'start_trial', tier: tierKey, cadence })
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setCheckoutError('Unable to start checkout. Please try again or contact support.')
      }
    } catch {
      setCheckoutError('Network error. Please check your connection and try again.')
    } finally {
      setCheckoutLoading(null)
    }
  }

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
      <section className="py-24 md:py-32 bg-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Pricing</p>
          <h1 className="mb-4 font-display text-5xl font-bold tracking-[-0.02em] text-gray-900 md:text-6xl">
            Simple, honest pricing
          </h1>
          <p className="font-sans text-base leading-relaxed text-muted">
            Start with a 14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Plan Quiz */}
      <section className="bg-surface py-16 md:py-20 border-t border-border">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-10 text-center">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Find your plan</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900">
              Three questions, one recommendation
            </h2>
          </div>
          <PlanQuiz
            starterPriceId={starterPriceId}
            growthPriceId={growthPriceId}
            proPriceId={proPriceId}
            stripeConfigured={stripeConfigured}
          />
        </div>
      </section>

      {/* Pricing cards */}
      <section id="pricing-table" className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6">

          {/* Simplicity framing */}
          <div className="mb-8 rounded-lg border border-border bg-surface px-5 py-4 max-w-lg">
            <p className="font-sans text-sm text-muted leading-relaxed">
              The only thing you do in the admin panel: click{' '}
              <span className="font-medium text-gray-900">Confirm</span> when a booking arrives.
            </p>
            <p className="mt-1.5 font-sans text-xs text-muted/60 leading-relaxed">
              Everything else — the email to the customer, the calendar update, the weekly report — happens automatically.
            </p>
          </div>

          {/* ROI calculator */}
          <RoiCalculator />

          {/* 3 main cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">

            {/* Self-hosted */}
            <div className="flex flex-col rounded-lg border border-border bg-white p-8 shadow-sm">
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">Self-hosted</p>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-bold text-gray-900">€299</span>
                <span className="font-sans text-sm text-muted">one-time</span>
              </div>
              <p className="mt-2 mb-6 font-sans text-sm text-muted">Buy the code. Deploy yourself.</p>
              <ul className="flex flex-1 flex-col gap-3 mb-8">
                {['Full source code', 'RentalOS Commercial Licence', 'Free updates (git pull)', 'Deploy on your own Vercel'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 shrink-0 text-gold" />
                    <span className="font-sans text-sm text-muted">{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={process.env.NEXT_PUBLIC_GUMROAD_URL || '/sell'}
                className="inline-flex items-center justify-center min-h-[44px] rounded-md border border-border px-6 font-sans text-xs uppercase tracking-[0.1em] text-muted transition-colors hover:border-gold/40 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Buy template →
              </a>
            </div>

            {/* Done-for-you — committed blue (the dominant choice) */}
            <div className="relative flex flex-col rounded-lg border-2 border-gold bg-gold p-8 shadow-2xl">
              <div className="mb-4">
                <span className="rounded-sm bg-white/20 px-2.5 py-0.5 font-sans text-[10px] uppercase tracking-[0.15em] text-white">
                  Recommended
                </span>
              </div>
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-white/70">Done-for-you</p>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-extrabold text-white">€499</span>
                <span className="font-sans text-sm text-white/70">one-time</span>
              </div>
              <p className="mt-2 mb-6 font-sans text-sm text-white/75">We build it. You run it.</p>
              <ul className="flex flex-1 flex-col gap-3 mb-8">
                {['We deploy everything', 'Your domain configured', '30-day support included', 'Live in 48 hours'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 shrink-0 text-white/90" />
                    <span className="font-sans text-sm text-white/85">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center min-h-[44px] rounded-md bg-white px-6 font-sans text-xs uppercase tracking-[0.1em] text-gold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gold"
              >
                Get started →
              </Link>
            </div>

            {/* Monthly */}
            <div className="flex flex-col rounded-lg border border-border bg-white p-8 shadow-sm">
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">Monthly</p>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-bold text-gray-900">From €49</span>
                <span className="font-sans text-sm text-muted">/ month</span>
              </div>
              <p className="mt-2 mb-6 font-sans text-sm text-muted">Start free. Cancel anytime.</p>
              <ul className="flex flex-1 flex-col gap-3 mb-8">
                {['14-day free trial', 'No credit card required', 'Everything included', 'Cancel from admin panel'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 shrink-0 text-gold" />
                    <span className="font-sans text-sm text-muted">{f}</span>
                  </li>
                ))}
              </ul>
              {stripeConfigured && starterPriceId ? (
                <button
                  onClick={() => handleCheckout('starter')}
                  disabled={checkoutLoading === 'starter'}
                  className="inline-flex items-center justify-center min-h-[44px] rounded-md border border-border px-6 font-sans text-xs uppercase tracking-[0.1em] text-muted transition-colors hover:border-gold/40 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  {checkoutLoading === 'starter' ? 'Redirecting…' : 'Start free trial →'}
                </button>
              ) : (
                <Link
                  href="/admin/billing"
                  className="inline-flex items-center justify-center min-h-[44px] rounded-md border border-border px-6 font-sans text-xs uppercase tracking-[0.1em] text-muted transition-colors hover:border-gold/40 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Start free trial →
                </Link>
              )}
            </div>
          </div>

          {/* DFY timeline */}
          <div className="mt-2 mb-8 rounded-md border border-gold/20 bg-gold/5 px-6 py-5">
            <p className="font-sans text-xs uppercase tracking-[0.15em] text-gold mb-5">How done-for-you works</p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { day: 'Day 0', title: 'You fill in the form', sub: '5 minutes, no technical knowledge needed' },
                { day: 'Day 0–1', title: 'We review your requirements', sub: 'We may ask one or two clarifying questions' },
                { day: 'Day 1–2', title: 'We deploy your system', sub: 'Domain, branding, fleet — fully configured' },
                { day: 'Day 2', title: 'You receive your login', sub: 'Take real bookings from day two' },
              ].map(({ day, title, sub }, i) => (
                <div key={day} className="relative flex flex-col gap-1">
                  {i < 3 && (
                    <div className="absolute top-3 left-full hidden h-px w-full bg-gold/15 md:block" style={{ width: 'calc(100% - 1rem)', left: '50%' }} />
                  )}
                  <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-gold/60">{day}</p>
                  <p className="font-sans text-sm font-medium text-gray-900 leading-snug">{title}</p>
                  <p className="font-sans text-xs text-muted leading-relaxed">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {checkoutError && (
            <p className="mb-6 font-sans text-sm text-center" style={{ color: 'oklch(0.65 0.18 25)' }}>
              {checkoutError}
            </p>
          )}

          {/* More options collapsible */}
          <div className="mt-4">
            <button
              onClick={() => setShowMore((s) => !s)}
              className="font-sans text-sm text-muted transition-colors hover:text-gray-900 flex items-center gap-1.5"
            >
              Looking for more options? <span className="text-gold">{showMore ? '▲' : '▼'}</span>
            </button>

            {showMore && (
              <div className="mt-8">
                {/* Billing cadence + currency */}
                <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-1 rounded-md border border-border bg-white p-1 self-start shadow-sm">
                    {(['monthly', 'annual'] as Cadence[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => setCadence(c)}
                        className={`px-4 py-1.5 rounded font-sans text-xs uppercase tracking-[0.1em] transition-colors ${
                          cadence === c ? 'bg-gold text-white' : 'text-muted hover:text-gray-900'
                        }`}
                      >
                        {c === 'monthly' ? 'Monthly' : 'Annual — save 17%'}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 rounded-md border border-border bg-white p-1 self-start shadow-sm">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => handleCurrencyChange(c)}
                        className={`px-3 py-1.5 rounded font-sans text-xs transition-colors ${
                          currency === c ? 'bg-gold/20 text-gold' : 'text-muted hover:text-gray-900'
                        }`}
                      >
                        {CURRENCY_LABELS[c]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Growth */}
                  {(() => {
                    const t = TIERS.find((x) => x.key === 'growth')!
                    const p = displayPrice(t)
                    const pid = cadence === 'annual' ? growthAnnualPriceId : growthPriceId
                    return (
                      <div className="relative flex flex-col rounded-md border border-gold/50 bg-gold/5 ring-1 ring-gold/10 p-6">
                        <div className="mb-3">
                          <span className="rounded-sm bg-gold/15 px-2.5 py-0.5 font-sans text-[10px] uppercase tracking-[0.15em] text-gold">Most popular</span>
                        </div>
                        <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">{t.name}</p>
                        <div className="mt-2 mb-1">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-display text-2xl font-bold text-gray-900">{p.main}</span>
                            {cadence === 'monthly' && <span className="font-sans text-sm text-muted">/ month</span>}
                          </div>
                          {p.sub && <p className="font-sans text-xs text-muted mt-0.5">{p.sub} equiv.</p>}
                          {p.save && <span className="inline-block mt-1 rounded-sm bg-gold/10 px-2 py-0.5 font-sans text-[10px] text-gold">{p.save}</span>}
                        </div>
                        <ul className="flex flex-1 flex-col gap-2 mt-4 mb-6">
                          {[...t.features, ...(t.extras ?? [])].map((f) => (
                            <li key={f} className="flex items-start gap-2">
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                              <span className="font-sans text-sm text-muted">{f}</span>
                            </li>
                          ))}
                        </ul>
                        {stripeConfigured && pid ? (
                          <button onClick={() => handleCheckout('growth')} disabled={checkoutLoading === 'growth'}
                            className="inline-flex items-center justify-center min-h-[44px] rounded-md bg-gold px-5 font-sans text-xs uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                            {checkoutLoading === 'growth' ? 'Redirecting…' : t.cta}
                          </button>
                        ) : (
                          <Link href={t.href} className="inline-flex items-center justify-center min-h-[44px] rounded-md border border-border text-muted px-5 font-sans text-xs uppercase tracking-[0.1em] hover:border-gold/40 hover:text-gray-900 transition-colors">
                            {t.cta}
                          </Link>
                        )}
                      </div>
                    )
                  })()}

                  {/* Pro */}
                  {(() => {
                    const t = TIERS.find((x) => x.key === 'pro')!
                    const p = displayPrice(t)
                    const pid = cadence === 'annual' ? proAnnualPriceId : proPriceId
                    return (
                      <div className="flex flex-col rounded-lg border border-border bg-white p-6 shadow-sm">
                        <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">{t.name}</p>
                        <div className="mt-2 mb-1">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-display text-2xl font-bold text-gray-900">{p.main}</span>
                            {cadence === 'monthly' && <span className="font-sans text-sm text-muted">/ month</span>}
                          </div>
                          {p.sub && <p className="font-sans text-xs text-muted mt-0.5">{p.sub} equiv.</p>}
                          {p.save && <span className="inline-block mt-1 rounded-sm bg-gold/10 px-2 py-0.5 font-sans text-[10px] text-gold">{p.save}</span>}
                        </div>
                        <ul className="flex flex-1 flex-col gap-2 mt-4 mb-6">
                          {[...t.features, ...(t.extras ?? [])].map((f) => (
                            <li key={f} className="flex items-start gap-2">
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                              <span className="font-sans text-sm text-muted">{f}</span>
                            </li>
                          ))}
                        </ul>
                        {stripeConfigured && pid ? (
                          <button onClick={() => handleCheckout('pro')} disabled={checkoutLoading === 'pro'}
                            className="inline-flex items-center justify-center min-h-[44px] rounded-md border border-border text-muted px-5 font-sans text-xs uppercase tracking-[0.1em] hover:border-gold/40 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {checkoutLoading === 'pro' ? 'Redirecting…' : t.cta}
                          </button>
                        ) : (
                          <Link href={t.href} className="inline-flex items-center justify-center min-h-[44px] rounded-md border border-border text-muted px-5 font-sans text-xs uppercase tracking-[0.1em] hover:border-gold/40 hover:text-gray-900 transition-colors">
                            {t.cta}
                          </Link>
                        )}
                      </div>
                    )
                  })()}

                  {/* White-glove */}
                  <div className="flex flex-col rounded-lg border border-border bg-white p-6 shadow-sm">
                    <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">White-glove</p>
                    <div className="mt-2 mb-1 flex items-baseline gap-1.5">
                      <span className="font-display text-2xl font-bold text-gray-900">{fmtPrice(199, currency)}</span>
                      <span className="font-sans text-sm text-muted">/ month</span>
                    </div>
                    <ul className="flex flex-1 flex-col gap-2 mt-4 mb-6">
                      {['Everything managed', 'Monthly reports', 'Priority support', 'Updates included'].map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                          <span className="font-sans text-sm text-muted">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/contact" className="inline-flex items-center justify-center min-h-[44px] rounded-md border border-border text-muted px-5 font-sans text-xs uppercase tracking-[0.1em] hover:border-gold/40 hover:text-gray-900 transition-colors">
                      Contact us
                    </Link>
                  </div>

                  {/* Agency */}
                  {(() => {
                    const t = TIERS.find((x) => x.key === 'agency')!
                    return (
                      <div className="flex flex-col rounded-lg border border-gold/30 bg-white p-6 shadow-sm">
                        <div className="mb-3">
                          <span className="rounded-sm border border-gold/30 px-2.5 py-0.5 font-sans text-[10px] uppercase tracking-[0.15em] text-gold">For agencies</span>
                        </div>
                        <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">{t.name}</p>
                        <div className="mt-2 mb-1 flex items-baseline gap-1.5">
                          <span className="font-display text-2xl font-bold text-gray-900">{fmtPrice(499, currency)}</span>
                          <span className="font-sans text-sm text-muted">/ month</span>
                        </div>
                        <ul className="flex flex-1 flex-col gap-2 mt-4 mb-6">
                          {t.features.map((f) => (
                            <li key={f} className="flex items-start gap-2">
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                              <span className="font-sans text-sm text-muted">{f}</span>
                            </li>
                          ))}
                        </ul>
                        <Link href={t.href} className="inline-flex items-center justify-center min-h-[44px] rounded-md border border-gold/40 text-gold px-5 font-sans text-xs uppercase tracking-[0.1em] hover:bg-gold hover:text-black transition-colors">
                          {t.cta}
                        </Link>
                      </div>
                    )
                  })()}
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
              </div>
            )}
          </div>

          {/* WhatsApp CTA */}
          <div className="mt-10 pt-8 border-t border-border text-center">
            <p className="font-sans text-sm text-muted mb-4">
              Not sure? Talk to us — we&apos;ll help you choose.
            </p>
            <a
              href="https://wa.me/36708564381?text=Hi%2C%20I%27m%20interested%20in%20RentalOS"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-[44px] rounded-md border border-border px-6 font-sans text-sm text-muted transition-colors hover:border-gold/40 hover:text-gray-900"
            >
              WhatsApp →
            </a>
          </div>

          <p className="mt-6 font-sans text-xs text-muted/50 text-center">
            Export all your data anytime from Admin → Settings.
            Bookings, customers, fleet — your CSV, your records.
          </p>
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Compare</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900">
              What&apos;s included
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
                    <th key={n} className="pb-4 font-sans text-xs uppercase tracking-[0.15em] text-gray-900 text-center">
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
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">One-time</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900">
              Prefer to own it outright?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {ONE_TIME.map(({ name, price, cadence: c, desc, cta, href }) => (
              <div key={name} className="flex flex-col gap-4 rounded-lg border border-border bg-white p-6 shadow-sm">
                <div>
                  <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">{name}</p>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="font-display text-3xl font-bold text-gray-900">{price}</span>
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
      <section className="bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-10">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Questions</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900">FAQ</h2>
          </div>
          <div className="divide-y divide-border">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="py-6">
                <p className="mb-2 font-sans text-sm font-medium text-gray-900">{q}</p>
                <p className="font-sans text-sm leading-relaxed text-muted">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
