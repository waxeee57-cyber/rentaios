import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'RentalOS plans and pricing. Start with a 14-day free trial. No credit card required.',
}

const TIERS = [
  {
    name: 'Starter',
    price: '€99',
    cadence: '/ month',
    highlight: false,
    features: [
      'Up to 50 bookings per month',
      '1 vehicle category',
      'Email notifications',
      'Admin panel',
      'Mobile-friendly',
    ],
    cta: 'Start 14-day free trial',
    href: '/admin/billing',
  },
  {
    name: 'Pro',
    price: '€199',
    cadence: '/ month',
    highlight: true,
    badge: 'Most popular',
    features: [
      'Unlimited bookings',
      'Unlimited vehicles',
      'Everything in Starter',
      'Transfer/delivery feature',
      'Priority support',
    ],
    cta: 'Start 14-day free trial',
    href: '/admin/billing',
  },
  {
    name: 'White Glove',
    price: '€299',
    cadence: '/ month',
    highlight: false,
    features: [
      'Everything in Pro',
      'We handle setup and updates',
      'Monthly check-in call',
      'Custom domain setup',
    ],
    cta: 'Contact us',
    href: '/contact',
  },
]

const ONE_TIME = [
  {
    name: 'Template',
    price: '€299',
    cadence: 'once',
    desc: 'Full source code, deploy yourself, MIT licence.',
    cta: 'Buy template',
    href: '/sell',
  },
  {
    name: 'Done-for-you',
    price: '€499',
    cadence: 'once',
    desc: 'We deploy and configure everything, 30-day support.',
    cta: 'Get started',
    href: '#',
  },
]

const FAQ_ITEMS = [
  {
    q: 'Is there a free trial?',
    a: '14 days, no credit card required. Full access to all features on the plan you choose.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from the admin panel under Billing. Your data remains accessible until the end of your billing period.',
  },
  {
    q: 'What happens after the trial ends?',
    a: 'Choose a plan to continue. If you do not, your admin panel becomes read-only and no new bookings can be taken.',
  },
  {
    q: 'Do you offer refunds?',
    a: '30-day money-back guarantee. If you are not satisfied in your first 30 days on a paid plan, we will refund in full.',
  },
  {
    q: 'Can I upgrade or downgrade?',
    a: 'Yes, anytime from the Billing section in your admin panel. Changes take effect immediately and are prorated.',
  },
]

export default function PricingPage() {
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
            Start with a 14-day free trial. No credit card required.
            Cancel anytime.
          </p>
        </div>
      </section>

      {/* SaaS tiers */}
      <section className="bg-graphite py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TIERS.map(({ name, price, cadence, highlight, badge, features, cta, href }) => (
              <div
                key={name}
                className={`relative flex flex-col rounded-md border p-8 ${
                  highlight
                    ? 'border-gold/40 bg-gold/5 ring-1 ring-gold/10'
                    : 'border-border bg-black/40'
                }`}
              >
                {badge && (
                  <div className="mb-4 self-start">
                    <span className="rounded-sm bg-gold/15 px-2.5 py-0.5 font-sans text-[10px] uppercase tracking-[0.15em] text-gold">
                      {badge}
                    </span>
                  </div>
                )}

                <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">{name}</p>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-light text-white">{price}</span>
                  <span className="font-sans text-sm text-muted">{cadence}</span>
                </div>

                <ul className="my-8 flex flex-1 flex-col gap-3">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                      <span className="font-sans text-sm text-muted">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={href}
                  className={`inline-flex items-center justify-center rounded-md px-6 py-3 font-sans text-xs uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${
                    highlight
                      ? 'bg-gold text-black hover:opacity-90'
                      : 'border border-border text-muted hover:border-gold/40 hover:text-white'
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* One-time options */}
      <section className="bg-black py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">One-time</p>
            <h2 className="font-display text-3xl font-light tracking-tight text-white md:text-4xl">
              Prefer to own it outright?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {ONE_TIME.map(({ name, price, cadence, desc, cta, href }) => (
              <div
                key={name}
                className="flex flex-col gap-4 rounded-md border border-border bg-graphite/30 p-6"
              >
                <div>
                  <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">{name}</p>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="font-display text-3xl font-light text-white">{price}</span>
                    <span className="font-sans text-sm text-muted">{cadence}</span>
                  </div>
                </div>
                <p className="font-sans text-sm leading-relaxed text-muted">{desc}</p>
                <Link
                  href={href}
                  className="inline-flex items-center gap-1.5 font-sans text-sm text-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline"
                >
                  {cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-graphite py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-10">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Questions</p>
            <h2 className="font-display text-3xl font-light tracking-tight text-white md:text-4xl">FAQ</h2>
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
