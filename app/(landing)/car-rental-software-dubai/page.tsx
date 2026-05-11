import type { Metadata } from 'next'
import Link from 'next/link'
import { WaitlistForm } from '@/components/marketing/WaitlistForm'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'
const AED_RATE = parseFloat(process.env.NEXT_PUBLIC_AED_RATE ?? '4.1')

export const metadata: Metadata = {
  title: 'Car Rental Software Dubai | Manage Fleet & Bookings',
  description: 'Car rental management software built for Dubai and UAE operators. Automate bookings, send confirmations, manage your luxury fleet. From €49/month.',
  alternates: { canonical: `${BASE}/car-rental-software-dubai` },
  openGraph: {
    title: 'Car Rental Software Dubai | RentalOS',
    description: 'Automate your Dubai luxury car rental. Bookings, confirmations, fleet management — from €49/month.',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is the system available in Arabic?',
      acceptedAnswer: { '@type': 'Answer', text: 'Arabic language support is coming soon. Join the waitlist to be notified when it launches.' },
    },
    {
      '@type': 'Question',
      name: 'Can I manage multiple locations in Dubai?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, on the Pro plan you have unlimited vehicles and can note pickup/delivery addresses per booking.' },
    },
    {
      '@type': 'Question',
      name: 'Do you support WhatsApp integration for Dubai customers?',
      acceptedAnswer: { '@type': 'Answer', text: 'Every booking has a one-click WhatsApp button so you can message the customer instantly. Full automated integration is on the roadmap.' },
    },
  ],
}

const aedPrice = (eur: number) => Math.round(eur * AED_RATE)

const FEATURES = [
  {
    t: 'Instant email confirmations',
    d: 'Customers in Dubai expect a professional response immediately. Every inquiry gets an automatic confirmation email — in your branding.',
  },
  {
    t: 'Deposit management',
    d: 'Track deposits per booking. For high-value vehicles, this is non-negotiable. Know who has paid and who has not at a glance.',
  },
  {
    t: 'Mobile admin panel',
    d: 'Manage your fleet while at the venue, in traffic, or between meetings. The full admin panel works on your phone.',
  },
  {
    t: 'Multi-currency display',
    d: 'Show prices in AED on your site while billing is handled in EUR. Your Dubai customers see local prices.',
  },
]

const FAQ = [
  {
    q: 'Is the system available in Arabic?',
    a: 'Arabic language support is coming soon. Join the waitlist below to be notified first.',
  },
  {
    q: 'Can I manage multiple locations?',
    a: 'Yes, on the Pro plan you can have unlimited vehicles and manage delivery addresses per booking.',
  },
  {
    q: 'Do you support WhatsApp integration?',
    a: 'Every booking includes a one-click WhatsApp button so you can reach the customer instantly. Full automated WhatsApp integration is on the roadmap.',
  },
]

export default function DubaiPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero */}
      <section className="bg-slate-900 text-white py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <p className="mb-4 font-sans text-xs uppercase tracking-[0.2em] text-gold">Dubai & UAE</p>
          <h1 className="mb-6 font-display text-5xl font-light tracking-[-0.02em] text-white md:text-6xl">
            Manage your Dubai rental fleet without spreadsheets.
          </h1>
          <p className="mb-8 font-sans text-base leading-relaxed text-muted max-w-xl">
            Automated bookings, customer confirmations, and fleet management — built for luxury rental operators.
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
            Running a fleet on messages and memory
          </h2>
          <div className="flex flex-col gap-4">
            {[
              'WhatsApp inquiries getting lost between messages',
              'Double bookings because two people said yes at once',
              'Chasing deposit payments with no automated tracking',
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
              { num: '01', t: 'Customer submits an inquiry', d: 'They pick dates, enter their details, and submit. No back-and-forth needed to capture the basics.' },
              { num: '02', t: 'You receive an immediate alert', d: 'Email notification with all details. Review, confirm or decline in your admin panel.' },
              { num: '03', t: 'Customer gets a professional confirmation', d: 'Branded email confirmation sent automatically. You look professional without extra effort.' },
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
          <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Built for your market</p>
          <h2 className="mb-8 font-display text-3xl font-bold text-gray-900 md:text-4xl">Features that matter in Dubai</h2>
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

      {/* Social proof */}
      <section className="bg-surface py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="font-sans text-sm text-muted">
            Trusted by luxury rental operators across Europe and the Gulf.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-3xl px-6">
          <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Pricing</p>
          <h2 className="mb-4 font-display text-3xl font-bold text-gray-900 md:text-4xl">From €49/month</h2>
          <p className="mb-1 font-sans text-sm text-muted">
            Approximately AED {aedPrice(49)}/month. 14-day free trial, no credit card required.
          </p>
          <p className="mb-8 font-sans text-xs text-muted/60">Billed in EUR. AED conversion shown for reference.</p>
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

      {/* Arabic waitlist */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-3xl px-6">
          <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Arabic support coming soon</p>
          <p className="mb-6 font-sans text-sm text-muted">
            Join the waitlist to be notified when Arabic language support launches.
          </p>
          <WaitlistForm vertical="arabic" source="/car-rental-software-dubai" />
        </div>
      </section>
    </>
  )
}
