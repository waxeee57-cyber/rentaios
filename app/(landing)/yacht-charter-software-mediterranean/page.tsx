import type { Metadata } from 'next'
import Link from 'next/link'
import { WaitlistForm } from '@/components/marketing/WaitlistForm'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'

export const metadata: Metadata = {
  title: 'Yacht Charter Software | Booking System for Charter Operators',
  description: 'Booking and management system for yacht charter businesses. Automate inquiries, send confirmations, manage your fleet. From €79/month. Built for Mediterranean operators.',
  alternates: { canonical: `${BASE}/yacht-charter-software-mediterranean` },
  keywords: ['yacht charter software', 'day charter booking system', 'sailing boat rental software', 'ibiza yacht charter management'],
  openGraph: {
    title: 'Yacht Charter Software | RentalOS',
    description: 'From inquiry to departure — automated. Built for Mediterranean charter operators.',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Does it work for day charters and multi-day voyages?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. The booking system handles any rental duration — from a half-day to a multi-week voyage. You set your minimum and maximum booking lengths.' },
    },
    {
      '@type': 'Question',
      name: 'Can I list multiple boats?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, unlimited boats on the Pro plan. Each vessel has its own availability calendar, pricing, and photo gallery.' },
    },
    {
      '@type': 'Question',
      name: 'What about weather cancellations?',
      acceptedAnswer: { '@type': 'Answer', text: 'Weather cancellation is handled manually — you cancel the booking in the admin panel and the customer receives an automatic notification. An automated weather cancellation policy is on the roadmap.' },
    },
  ],
}

const FEATURES = [
  {
    t: 'Inquiry to confirmation flow',
    d: 'Works for any charter type — day trip, sunset cruise, multi-day voyage. Customer submits dates, you confirm personally. No double bookings.',
  },
  {
    t: 'Transfer/delivery feature',
    d: 'Customer requests pickup from a marina, hotel, or custom address. You set the transfer fee before confirming. Works for any pickup location.',
  },
  {
    t: 'Fleet management',
    d: 'List your yachts exactly as you list cars — name, photos, specs, pricing. The same system, adapted to your vessel fleet.',
  },
  {
    t: 'Branded email notifications',
    d: 'Inquiry confirmation, booking confirmation, cancellation notice — all in your charter company branding. Professional from day one.',
  },
]

const FAQ = [
  {
    q: 'Does it work for day charters and multi-day voyages?',
    a: 'Yes. Any rental duration from a few hours to several weeks. You set your minimum and maximum booking lengths.',
  },
  {
    q: 'Can I list multiple boats?',
    a: 'Yes, unlimited vessels on the Pro plan. Each has its own availability, pricing, and photo gallery.',
  },
  {
    q: 'What about weather cancellations?',
    a: 'Cancel manually in the admin panel — the customer receives an automatic notification. Automated weather cancellation policy is on the roadmap.',
  },
]

export default function MediterraneanPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero */}
      <section className="bg-slate-900 text-white py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <p className="mb-4 font-sans text-xs uppercase tracking-[0.2em] text-gold">Yacht charter software</p>
          <h1 className="mb-6 font-display text-5xl font-light tracking-[-0.02em] text-white md:text-6xl">
            Your yacht charter bookings, finally under control.
          </h1>
          <p className="mb-8 font-sans text-base leading-relaxed text-muted max-w-xl">
            From inquiry to departure — automated.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/onboarding" className="inline-flex items-center justify-center min-h-[48px] rounded-md bg-gold px-8 font-sans text-xs uppercase tracking-[0.15em] text-white hover:opacity-90 transition-opacity">
              Start free trial
            </Link>
            <Link href="/demo" className="inline-flex items-center justify-center min-h-[48px] rounded-md border border-border px-8 font-sans text-xs uppercase tracking-[0.15em] text-muted hover:border-gold/40 hover:text-gray-900 transition-colors">
              See live demo
            </Link>
          </div>
        </div>
      </section>

      {/* Pain */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-3xl px-6">
          <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Sound familiar?</p>
          <h2 className="mb-8 font-display text-3xl font-bold text-gray-900 md:text-4xl">
            Running a €5,000/day charter on paper
          </h2>
          <div className="flex flex-col gap-4">
            {[
              'Paper logs and WhatsApp threads for a charter that costs more than a flight',
              'Customers calling to confirm what they already confirmed by email',
              'No easy way to track deposits across multiple boats',
            ].map((pain) => (
              <div key={pain} className="flex items-start gap-3 rounded-md border border-border bg-white shadow-sm px-4 py-3.5">
                <span className="text-gold font-sans text-sm shrink-0">—</span>
                <p className="font-sans text-sm text-muted">{pain}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-6">
          <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">How it works</p>
          <h2 className="mb-8 font-display text-3xl font-bold text-gray-900 md:text-4xl">RentalOS handles it</h2>
          <div className="flex flex-col gap-6">
            {[
              { num: '01', t: 'Customer submits a charter inquiry', d: 'Dates, group size, special requests — all captured in one clean form. No back-and-forth.' },
              { num: '02', t: 'You review and confirm', d: 'One-click confirmation from the admin panel. The customer gets an immediate branded confirmation email.' },
              { num: '03', t: 'Booking tracked end to end', d: 'From inquiry through departure and return — every status update recorded, every document stored.' },
            ].map(({ num, t, d }) => (
              <div key={num} className="flex gap-5">
                <span className="font-display text-2xl font-light text-gold/30 shrink-0 w-8">{num}</span>
                <div>
                  <p className="font-sans text-sm font-medium text-gray-900 mb-1">{t}</p>
                  <p className="font-sans text-sm leading-relaxed text-muted">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Built for charter operators</p>
          <h2 className="mb-8 font-display text-3xl font-bold text-gray-900 md:text-4xl">Features that fit your operation</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {FEATURES.map(({ t, d }) => (
              <div key={t} className="rounded-md border border-border bg-white shadow-sm p-5">
                <p className="font-sans text-sm font-medium text-gray-900 mb-2">{t}</p>
                <p className="font-sans text-sm leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming soon */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-md border border-gold/20 bg-gold/5 px-6 py-5">
            <p className="font-sans text-xs uppercase tracking-[0.15em] text-gold mb-2">Yacht-specific features in development</p>
            <p className="font-sans text-sm text-muted mb-4">
              Online deposit hold, crew scheduling, and automated weather cancellation policies are on the roadmap.
            </p>
            <WaitlistForm vertical="yacht" source="/yacht-charter-software-mediterranean" />
          </div>
        </div>
      </section>

      {/* Social proof + pricing */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-3xl px-6">
          <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Pricing</p>
          <h2 className="mb-4 font-display text-3xl font-bold text-gray-900 md:text-4xl">From €79/month</h2>
          <p className="mb-8 font-sans text-sm text-muted">14-day free trial, no credit card required.</p>
          <Link href="/onboarding" className="inline-flex items-center justify-center min-h-[48px] rounded-md bg-gold px-8 font-sans text-xs uppercase tracking-[0.15em] text-white hover:opacity-90 transition-opacity">
            Start free trial
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-6">
          <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Questions</p>
          <h2 className="mb-8 font-display text-3xl font-bold text-gray-900">FAQ</h2>
          <div className="divide-y divide-border">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="py-5">
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
