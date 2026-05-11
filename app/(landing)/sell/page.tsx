import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, ExternalLink, MessageCircle, Calendar, FileText } from 'lucide-react'
import { getBusinessConfig } from '@/lib/config'
import { Logo } from '@/components/brand/Logo'

export const revalidate = false

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'

export const metadata: Metadata = {
  title: { absolute: 'Buy RentalOS — Complete Rental Booking System from €299' },
  description:
    'Complete rental booking system for car, yacht, villa, and motorcycle businesses. Template from €299. Admin panel, email notifications, fleet management. Deploy in one day.',
  alternates: {
    canonical: `${SITE_URL}/sell`,
  },
  openGraph: {
    title: 'Buy RentalOS — Complete Rental Booking System from €299',
    description:
      'Complete rental booking system for car, yacht, villa, and motorcycle businesses. Template from €299. Admin panel, email notifications, fleet management. Deploy in one day.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80',
        width: 1200,
        height: 800,
        alt: 'RentalOS — Rental Booking System',
      },
    ],
  },
}

// ── Data ─────────────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  {
    Icon: MessageCircle,
    headline: 'Inquiries getting lost in WhatsApp',
    copy: "A customer messages at midnight. By morning they've booked with someone else. You never even saw it.",
  },
  {
    Icon: Calendar,
    headline: 'Double bookings you find out about at pickup',
    copy: 'Two customers, one car, same day. The conversation that follows is one nobody wants to have.',
  },
  {
    Icon: FileText,
    headline: 'Chasing documents and deposits manually',
    copy: "Every booking is a new thread of messages, reminders, and follow-ups that eats hours you don't have.",
  },
]

const SOLUTIONS = [
  {
    headline: 'Every inquiry captured',
    copy: 'Customers submit through your site or a WhatsApp link. You get an instant email alert. They get an immediate confirmation. Nothing is lost.',
  },
  {
    headline: 'Availability checked automatically',
    copy: 'The system prevents double bookings before they happen. Confirm with one click — the calendar updates instantly.',
  },
  {
    headline: 'Documents and deposits tracked',
    copy: 'Licence photos, deposit amounts, payment status — all in one place per booking. Every handover is clean.',
  },
]

const FEATURES = [
  {
    label: 'Customer-facing booking site',
    desc: 'Your own branded URL. Customers browse your fleet and submit inquiries directly.',
  },
  {
    label: 'Admin panel',
    desc: 'Manage every booking from inquiry to return. Confirm, update status, add notes — from your phone.',
  },
  {
    label: 'Automatic email confirmations',
    desc: "Every inquiry and confirmation triggers a branded email. You look professional before you've said a word.",
  },
  {
    label: 'Fleet management',
    desc: 'Add vehicles, set prices, upload photos, toggle availability. Your fleet, always up to date.',
  },
  {
    label: 'Transfer and delivery',
    desc: 'Customers can request hotel delivery. You set the fee and confirm — tracked separately from the booking.',
  },
  {
    label: 'Document capture',
    desc: 'Upload licence photos and ID at pickup directly in the admin. Everything stored per booking.',
  },
  {
    label: 'Customer history',
    desc: 'See every previous booking for a returning customer. Remember who they are before they arrive.',
  },
  {
    label: 'Weekly summary email',
    desc: 'Every Monday: inquiries, confirmed bookings, upcoming pickups, revenue. Your business at a glance without logging in.',
  },
  {
    label: 'SEO optimised',
    desc: 'Sitemap, schema markup, canonical URLs, Open Graph tags. Your fleet shows up in Google searches.',
  },
  {
    label: 'Mobile-first admin',
    desc: 'Designed for phone use. Confirm a booking while standing at the vehicle. No laptop required.',
  },
  {
    label: 'Secure and rate-limited',
    desc: 'Authentication, RLS policies, rate limiting on all public endpoints. No exposed data.',
  },
  {
    label: 'Full source code (Commercial licence)',
    desc: 'Own the code. Deploy it yourself or hand it to a developer. No vendor lock-in. Ever.',
  },
]

// PRICING_PLANS is defined inside SellPage to access gumroadUrl

const FAQ_ITEMS = [
  {
    q: 'Do I need technical knowledge to set it up?',
    a: 'For the template: basic comfort with terminal commands and following documentation. For the done-for-you plan: none. We handle everything.',
  },
  {
    q: 'Can I use this for yacht or villa rentals, not just cars?',
    a: 'Yes. The system works for any rental business. The fleet management, booking flow, and admin panel are vehicle-agnostic.',
  },
  {
    q: 'Can I resell this to my clients?',
    a: 'Yes. The template includes a Commercial licence. You can deploy it for clients, charge for setup, and keep 100% of what you earn.',
  },
  {
    q: 'What happens after I buy the template?',
    a: 'You receive a ZIP file with the complete codebase and full documentation. Deployment takes 1–2 hours following the guide.',
  },
  {
    q: 'Is there ongoing support?',
    a: 'Template purchases include 30-day email support. Subscription plans include ongoing support as long as you subscribe.',
  },
  {
    q: 'What if I set it up and don\'t use it?',
    a: 'The 14-day trial is exactly for this. Set it up, run a test booking, decide if it fits. You pay nothing until day 15. If you don\'t upgrade, you walk away with nothing owed and nothing lost.',
  },
  {
    q: 'How is this different from generic booking software?',
    a: 'Generic booking platforms are built for any product that can be rented — furniture, equipment, cars, rooms. RentalOS is built specifically for vehicle, yacht, villa, and motorcycle rental: the booking flow, confirmation emails, and admin panel are designed around how these businesses actually operate. You use it as-is.',
  },
  {
    q: 'Can I see the code before buying?',
    a: 'The demo at /demo runs the exact codebase. For template buyers who want to review the source before purchase, contact us — we\'ll provide read-only GitHub access within 24 hours.',
  },
  {
    q: 'What if I need a feature that isn\'t included?',
    a: 'Template buyers have the full source code — add whatever you need. SaaS subscribers: email us. We\'re a small team and we build what customers actually use. If multiple people ask for the same thing, it ships.',
  },
  {
    q: 'Is my customer data private and secure?',
    a: 'Your customer data lives in your own Supabase database project. We do not have access to it. You are the data controller under GDPR — not us. The system uses Row Level Security on every table, rate limiting on every public endpoint, and no credentials are ever stored in client-side code.',
  },
]

// ── Admin panel mockup ────────────────────────────────────────────────────────

function AdminPanelMockup() {
  const bookings = [
    {
      vehicle: 'Mercedes E-Class',
      dates: 'Jul 12–14',
      status: 'Confirmed',
      pill: 'bg-success/10 text-success border-success/20',
    },
    {
      vehicle: 'Jeep Wrangler',
      dates: 'Jul 15–18',
      status: 'Inquiry',
      pill: 'bg-gold/10 text-gold border-gold/20',
    },
    {
      vehicle: 'BMW 5 Series',
      dates: 'Jul 10–12',
      status: 'Picked up',
      pill: 'bg-white/5 text-muted border-border',
    },
  ]

  return (
    <div
      className="w-full overflow-hidden border border-border"
      style={{
        backgroundColor: '#141415',
        boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,169,107,0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-gold" />
          <span className="font-sans text-xs uppercase tracking-[0.2em] text-muted">
            Bookings
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-sm border border-gold/15 bg-gold/10 px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          <span className="font-sans text-[11px] font-medium text-gold">3 new inquiries</span>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {bookings.map(({ vehicle, dates, status, pill }) => (
          <div key={vehicle} className="flex items-center justify-between px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-sans text-sm font-medium text-white">{vehicle}</span>
              <span className="font-sans text-[11px] text-muted/60">{dates}</span>
            </div>
            <span className={`rounded-sm border px-2.5 py-0.5 font-sans text-[11px] font-medium ${pill}`}>
              {status}
            </span>
          </div>
        ))}
        {/* Document expiry alert row */}
        <div className="flex items-center gap-2 px-5 py-3" style={{ background: 'rgba(251,191,36,0.05)' }}>
          <span className="font-sans text-[11px] text-gold/70">⚠</span>
          <span className="font-sans text-xs text-gold/80 flex-1">Insurance expiring — Mercedes E-Class</span>
          <span className="font-sans text-[11px] text-gold/70 tabular-nums">12 days</span>
        </div>
      </div>
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 font-sans text-[10px] uppercase tracking-[0.4em] text-gold">
      {children}
    </p>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function SellPage() {
  const config = await getBusinessConfig()
  const adminEmail = config.business_email
  const gumroadUrl = process.env.NEXT_PUBLIC_GUMROAD_URL || '#'

  const PRICING_PLANS: {
    tag: string
    name: string
    price: string
    cadence: string
    sub: string
    features: string[]
    cta: string
    href: string
    accent: boolean
    external?: boolean
    licenceLink?: boolean
    belowCta?: string
  }[] = [
    {
      tag: 'One-time',
      name: 'Template',
      price: '€299',
      cadence: '',
      sub: 'Pay once. Own forever.',
      features: [
        'Full source code (Next.js)',
        'Deploy to any host',
        'RentalOS Commercial Licence',
        'Single deployment included',
        'Complete documentation',
        '30-day email support',
      ],
      cta: 'Buy on Gumroad',
      href: gumroadUrl,
      accent: false,
      external: true,
      licenceLink: true,
      belowCta: 'Instant download · Full source code · Commercial licence',
    },
    {
      tag: 'Most popular',
      name: 'Starter',
      price: '€49',
      cadence: '/month',
      sub: '1–3 vehicles. Up to 30 bookings/month.',
      features: [
        'Everything hosted for you',
        'Admin panel included',
        'Email notifications',
        'Updates included',
        '14-day free trial',
      ],
      cta: 'Start free trial',
      href: '/pricing',
      accent: true,
      belowCta: '14 days free · No credit card required',
    },
    {
      tag: 'Service',
      name: 'Done for you',
      price: '€499',
      cadence: '',
      sub: 'One-time. Ready in 48 hours.',
      features: [
        'We deploy everything',
        'Your domain configured',
        'Admin account created',
        'Your vehicles added',
        '30-day support included',
      ],
      cta: 'Get started',
      href: '/onboarding',
      accent: false,
      belowCta: 'We handle everything · Ready in 48 hours',
    },
  ]

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-black text-white">

        {/* ── Nav ──────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-50 border-b border-border bg-black/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-3">
            <Logo />
            <div className="flex items-center gap-6">
              <Link href="/demo" className="font-sans text-sm text-muted transition-colors hover:text-white hidden sm:block">Demo</Link>
              <Link href="/pricing" className="font-sans text-sm text-muted transition-colors hover:text-white hidden sm:block">Pricing</Link>
              <Link href="/about" className="font-sans text-sm text-muted transition-colors hover:text-white hidden sm:block">About</Link>
              <Link
                href="/pricing"
                className="rounded-sm bg-gold px-4 py-2 font-sans text-xs font-medium text-black transition-opacity hover:opacity-90"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </nav>

        {/* ─────────────────────────────────────────── 1. HERO ── */}
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-20 pt-28 text-center">
          {/* Radial gold glow behind headline */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(200,169,107,0.08) 0%, transparent 70%)',
            }}
          />

          <div className="relative mx-auto flex max-w-[800px] flex-col items-center gap-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-graphite/60 px-4 py-1.5">
              <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-muted">
                RentalOS
              </span>
            </div>

            {/* H1 */}
            <h1 className="font-display text-5xl font-light leading-[1.05] tracking-[-0.02em] text-white md:text-6xl lg:text-7xl">
              The booking that arrived at 11pm.
              The one you missed because you had no system.
            </h1>

            {/* Sub */}
            <p className="max-w-[480px] font-sans text-base leading-relaxed text-muted">
              RentalOS sends the confirmation automatically.
              Your customer knows they&apos;re confirmed.
              You wake up to a done deal.
            </p>

            {/* CTAs */}
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <a
                href="#pricing"
                className="btn-3d inline-flex items-center justify-center rounded-sm bg-gold px-8 py-4 font-sans text-sm font-medium text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Get the system — €299
              </a>
              <a
                href="/demo"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-3d inline-flex items-center justify-center gap-2 rounded-sm border border-gold/30 px-8 py-4 font-sans text-sm font-medium text-white transition-colors hover:border-gold/60 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                See it live <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* Social proof micro-line */}
            <p className="font-sans text-xs text-muted/50">
              Running live in Marbella, Spain
              <span className="mx-2 text-muted/25">·</span>
              <a
                href="https://drivecostasol.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 underline-offset-2 transition-colors hover:text-gold hover:underline"
              >
                drivecostasol.com <ExternalLink className="h-3 w-3" />
              </a>
            </p>

            {/* Admin panel mockup */}
            <div className="mt-2 w-full max-w-[600px]">
              <AdminPanelMockup />
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────── 2. PAIN ── */}
        <section className="py-24 md:py-32" style={{ backgroundColor: '#0F0F10' }}>
          <div className="mx-auto max-w-[1100px] px-6">
            <Label>Sound familiar?</Label>

            <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-3">
              {PAIN_POINTS.map(({ Icon, headline, copy }) => (
                <div
                  key={headline}
                  className="group flex flex-col gap-6 p-8 transition-all duration-300"
                  style={{ backgroundColor: '#1a1a1b' }}
                >
                  <Icon
                    className="h-6 w-6 text-gold/50 transition-colors duration-300 group-hover:text-gold/80"
                    strokeWidth={1.5}
                  />
                  <div>
                    <h3 className="mb-2.5 font-display text-xl font-medium leading-snug text-white">
                      {headline}
                    </h3>
                    <p className="font-sans text-sm leading-relaxed text-muted">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CUSTOMER BRIDGE (Objection 6) ── */}
        <section className="py-12 border-b border-border" style={{ backgroundColor: '#0F0F10' }}>
          <div className="mx-auto max-w-[1100px] px-6">
            <p className="font-sans text-base leading-relaxed text-muted max-w-2xl">
              Your customers booked their flight on their phone.
              They chose their hotel on their phone at midnight.
            </p>
            <p className="mt-3 font-sans text-base leading-relaxed text-muted max-w-2xl">
              They&apos;ll try to book your vehicle the same way.
              The only question is whether you&apos;re ready when they do.
            </p>
          </div>
        </section>

        {/* ───────────────────────────────────────── 3. SOLUTION ── */}
        <section className="py-24 md:py-32 bg-graphite">
          <div className="mx-auto max-w-[1100px] px-6">
            <Label>RentalOS handles it</Label>
            <h2 className="mb-16 font-display text-4xl font-light tracking-tight text-white md:text-5xl">
              From inquiry to pickup — automated.
            </h2>

            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              {SOLUTIONS.map(({ headline, copy }, i) => (
                <div key={headline} className="flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <span className="font-sans text-xs tabular-nums text-gold/40">0{i + 1}</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <h3 className="font-display text-2xl font-medium leading-snug text-white">
                    {headline}
                  </h3>
                  <p className="font-sans text-sm leading-relaxed text-muted">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────── 4. DEMO STRIP ── */}
        <section className="py-24 md:py-32" style={{ backgroundColor: '#0A0A0B' }}>
          <div className="mx-auto max-w-[1100px] px-6 text-center">
            <h2 className="mb-5 font-display text-4xl font-light tracking-tight text-white md:text-5xl">
              See it working right now.
            </h2>
            <p className="mx-auto mb-10 max-w-md font-sans text-base leading-relaxed text-muted">
              Not a slideshow. Not a video. A live system with real data
              you can click through — no signup required.
            </p>
            <a
              href="/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-3d inline-flex items-center gap-2.5 rounded-sm bg-gold px-10 py-4 font-sans text-sm font-medium text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
            >
              Open live demo <ExternalLink className="h-4 w-4" />
            </a>
            <p className="mt-5 font-sans text-xs text-muted/35">
              Resets daily. Data is sample only.
            </p>
          </div>
        </section>

        {/* ──────────────────────────────────────── 5. FEATURES ── */}
        <section className="py-24 md:py-32 bg-graphite">
          <div className="mx-auto max-w-[1100px] px-6">
            <Label>Everything you need</Label>
            <h2 className="mb-16 font-display text-4xl font-light tracking-tight text-white md:text-5xl">
              One system. No missing pieces.
            </h2>

            <div className="grid grid-cols-1 gap-x-16 gap-y-9 sm:grid-cols-2">
              {FEATURES.map(({ label, desc }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-gold/20 bg-gold/8">
                    <Check className="h-3 w-3 text-gold" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="mb-1 font-sans text-sm font-medium text-white">{label}</p>
                    <p className="font-sans text-sm leading-relaxed text-muted">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CASE STUDY ── */}
        <section className="py-24 md:py-32" style={{ backgroundColor: '#0F0F10' }}>
          <div className="mx-auto max-w-[1100px] px-6">
            <Label>Built for a real business</Label>
            <h2 className="mb-10 font-display text-4xl font-light tracking-tight text-white md:text-5xl">
              CostaSol Car Rent — the reference deployment.
            </h2>

            <div className="rounded-sm border-l-2 border-gold bg-gold/5 px-8 py-8 max-w-2xl">
              <blockquote className="mb-6 font-display text-xl font-light italic leading-relaxed text-white">
                We were managing everything through WhatsApp and a spreadsheet.
                Now every inquiry gets a confirmation email within seconds.
                Our customers think we&apos;re a much bigger operation than we are.
              </blockquote>
              <div className="flex items-end justify-between gap-6 mb-8">
                <div>
                  <p className="font-sans text-sm font-medium text-white">CostaSol Car Rent</p>
                  <p className="mt-0.5 font-sans text-xs text-muted">Marbella, Spain — running since 2026</p>
                </div>
                <a
                  href="https://drivecostasol.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-sans text-xs text-muted/50 hover:text-gold transition-colors"
                >
                  drivecostasol.com <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="grid grid-cols-3 gap-px bg-gold/10 overflow-hidden mb-6">
                {[
                  { value: '0', label: 'Double bookings since launch' },
                  { value: '48h', label: 'Time to go live' },
                  { value: '100%', label: 'Inquiries captured' },
                ].map(({ value, label }) => (
                  <div key={label} className="bg-black/50 py-6 text-center">
                    <p className="font-display text-3xl font-light text-gold">{value}</p>
                    <p className="mt-1 px-2 font-sans text-xs leading-snug text-muted">{label}</p>
                  </div>
                ))}
              </div>
              <a
                href="/demo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-sans text-sm text-gold hover:underline underline-offset-4"
              >
                Visit the live demo <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* ─── FREE TOOLS COMPARISON ── */}
        <section className="py-24 md:py-32 bg-graphite">
          <div className="mx-auto max-w-[1100px] px-6">
            <Label>But I can do this for free with...</Label>
            <h2 className="mb-4 font-display text-4xl font-light tracking-tight text-white md:text-5xl">
              You can. You just can&apos;t do <em>this</em>.
            </h2>
            <p className="mb-14 font-sans text-base leading-relaxed text-muted max-w-xl">
              Each of these tools does one thing well. None of them are a rental booking system.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-4 pr-6 text-left font-sans text-xs uppercase tracking-[0.15em] text-muted w-1/3">
                      What you need
                    </th>
                    {['Calendly', 'Google Forms', 'Notion', 'WhatsApp', 'RentalOS'].map((tool, i) => (
                      <th key={tool} className={`pb-4 font-sans text-xs uppercase tracking-[0.15em] text-center ${i === 4 ? 'text-gold' : 'text-muted'}`}>
                        {tool}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { feature: 'Customer-facing booking page', vals: [false, false, false, false, true] },
                    { feature: 'Fleet / vehicle listing', vals: [false, false, false, false, true] },
                    { feature: 'Prevents double bookings', vals: [false, false, false, false, true] },
                    { feature: 'Automatic confirmation email', vals: [true, false, false, false, true] },
                    { feature: 'Admin panel for bookings', vals: [false, false, false, false, true] },
                    { feature: 'Document & deposit tracking', vals: [false, false, false, false, true] },
                    { feature: 'Built for rental businesses', vals: [false, false, false, false, true] },
                  ].map(({ feature, vals }) => (
                    <tr key={feature}>
                      <td className="py-3.5 pr-6 font-sans text-sm text-muted">{feature}</td>
                      {vals.map((v, i) => (
                        <td key={i} className="py-3.5 text-center">
                          {v
                            ? <Check className={`h-4 w-4 mx-auto ${i === 4 ? 'text-gold' : 'text-muted/40'}`} />
                            : <span className="font-sans text-sm text-muted/25">—</span>
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-8 font-display text-lg font-light italic text-muted max-w-xl">
              Free tools are free because they do a fraction of what you actually need.
              RentalOS does the whole job.
            </p>
          </div>
        </section>

        {/* ─── COMPARISON (Objection 3) ── */}
        <section className="py-24 md:py-32" style={{ backgroundColor: '#0A0A0B' }}>
          <div className="mx-auto max-w-[1100px] px-6">
            <Label>What most rental businesses use</Label>
            <h2 className="mb-16 font-display text-4xl font-light tracking-tight text-white md:text-5xl">
              The hidden cost of &ldquo;good enough&rdquo;
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
              <div className="flex flex-col gap-4 rounded-sm border border-border bg-black/40 p-6">
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted">WhatsApp + phone</p>
                <ul className="flex flex-col gap-3">
                  {[
                    'No 24/7 coverage — you miss what arrives overnight',
                    'No shared calendar — double bookings happen',
                    'Customer history starts fresh every booking',
                    'Every confirmation is a manual message you write',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-danger/50" />
                      <span className="font-sans text-sm text-muted/70">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-4 rounded-sm border border-border bg-black/40 p-6">
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted">Spreadsheet + email</p>
                <ul className="flex flex-col gap-3">
                  {[
                    'No customer-facing booking page',
                    'Availability is whatever you last updated it to',
                    'Confirmation emails you write one by one',
                    "Breaks the moment you're away from your desk",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-danger/50" />
                      <span className="font-sans text-sm text-muted/70">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-4 rounded-sm border border-border bg-black/40 p-6">
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted">Generic booking platform</p>
                <ul className="flex flex-col gap-3">
                  {[
                    'Built for every business — optimised for none',
                    'Your data on their servers, not yours',
                    'Monthly fee whether you use it or not',
                    'No vehicle document management',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-danger/50" />
                      <span className="font-sans text-sm text-muted/70">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-4 rounded-sm border border-gold/20 bg-gold/5 p-6">
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold">RentalOS</p>
                <ul className="flex flex-col gap-3">
                  {[
                    'Customer-facing booking site, your brand',
                    'Automatic confirmations, 24/7',
                    'Your data, your servers, your control',
                    'Built specifically for rental businesses',
                    'Done-for-you option available',
                    'Own it for €299 or subscribe from €49/month',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={2.5} />
                      <span className="font-sans text-sm text-muted">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-12 text-center font-display text-xl font-light italic text-muted">
              Most people who buy RentalOS weren&apos;t looking for new software.
              They were tired of the workaround they had.
            </p>
          </div>
        </section>

        {/* ─── SUPPORT CARD (Objection 1) ── */}
        <section className="py-16" style={{ backgroundColor: '#0F0F10' }}>
          <div className="mx-auto max-w-[1100px] px-6">
            <div className="rounded-sm border-l-2 border-gold bg-gold/5 px-8 py-7 max-w-2xl">
              <p className="mb-3 font-sans text-[10px] uppercase tracking-[0.3em] text-gold">
                What if I get stuck?
              </p>
              <p className="font-sans text-sm leading-relaxed text-muted">
                Every template purchase includes 30 days of personal email support.
                Not a chatbot. Not a help centre.
              </p>
              <p className="mt-2 font-sans text-sm leading-relaxed text-muted">
                A person who wrote every line of this code will reply personally within 24 hours.
                We have never had a customer who couldn&apos;t get live.
              </p>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────── 6. SOCIAL PROOF ── */}
        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-[1100px] px-6">
            <div className="mx-auto max-w-2xl">
              <p
                className="mb-6 select-none font-display text-6xl leading-none text-gold/15"
                aria-hidden="true"
              >
                &ldquo;
              </p>
              <blockquote className="mb-8 font-display text-2xl font-light italic leading-relaxed text-white md:text-3xl">
                We were managing everything through WhatsApp and a spreadsheet.
                Now every inquiry gets a confirmation email within seconds.
                Our customers think we&apos;re a much bigger operation than we are.
              </blockquote>
              <div className="flex items-end justify-between gap-6">
                <div>
                  <p className="font-sans text-sm font-medium text-white">Car rental business</p>
                  <p className="mt-0.5 font-sans text-xs text-muted">Marbella, Spain</p>
                </div>
                <a
                  href="https://drivecostasol.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-sans text-xs text-muted/50 underline-offset-2 transition-colors hover:text-gold"
                >
                  Visit drivecostasol.com <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Trust stats */}
            <div className="mx-auto mt-20 grid max-w-lg grid-cols-3 gap-px bg-border">
              {[
                { value: '48h', label: 'Average setup time' },
                { value: '0', label: 'Double bookings since launch' },
                { value: '100%', label: 'Inquiries captured automatically' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-black py-8 text-center">
                  <p className="font-display text-4xl font-light tabular-nums text-gold">{value}</p>
                  <p className="mt-2 px-2 font-sans text-xs leading-snug text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── VENDOR LOCK-IN (Objection 2) ── */}
        <section className="py-24 md:py-32" style={{ backgroundColor: '#0A0A0B' }}>
          <div className="mx-auto max-w-[1100px] px-6">
            <div className="max-w-2xl">
              <h3 className="mb-6 font-display text-3xl font-light text-white md:text-4xl">
                What happens if RentalOS disappears tomorrow?
              </h3>
              <p className="mb-6 font-sans text-sm leading-relaxed text-muted">
                Nothing. Because you own the code.
              </p>
              <div className="flex flex-col gap-3 mb-8">
                {[
                  'Template: complete Next.js codebase on your GitHub.',
                  'Your data: in your Supabase database. We never touch it.',
                  'Your domain: pointed to your Vercel deployment.',
                  'Your customers: in your email system.',
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={2.5} />
                    <span className="font-sans text-sm text-muted">{item}</span>
                  </div>
                ))}
              </div>
              <p className="font-sans text-sm leading-relaxed text-muted">
                If we disappear tonight, your system runs tomorrow. And the day after. And forever.
              </p>
              <p className="mt-3 font-sans text-sm leading-relaxed text-muted">
                We built it this way deliberately.
                We would want the same thing if we were the customer.
              </p>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────── 7. PRICING ── */}
        <section id="pricing" className="py-24 md:py-32 bg-graphite">
          <div className="mx-auto max-w-[1100px] px-6">
            <Label>Simple pricing</Label>
            <h2 className="mb-16 font-display text-4xl font-light tracking-tight text-white md:text-5xl">
              Own it outright or subscribe monthly.
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {PRICING_PLANS.map(({ tag, name, price, cadence, sub, features, cta, href, accent, external, licenceLink, belowCta }) => (
                <div
                  key={name}
                  className={`flex flex-col p-8 ${
                    accent
                      ? 'border border-gold/50 bg-gold/5 shadow-[0_0_0_1px_rgba(200,169,107,0.08),0_24px_48px_rgba(0,0,0,0.4)]'
                      : 'border border-border bg-black/40'
                  }`}
                >
                  {/* Tag + name */}
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-muted">
                      {name}
                    </p>
                    <span
                      className={`shrink-0 rounded-sm px-2.5 py-0.5 font-sans text-[10px] uppercase tracking-[0.15em] ${
                        accent ? 'bg-gold/20 text-gold' : 'bg-border text-muted'
                      }`}
                    >
                      {tag}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-1 flex items-baseline gap-1">
                    <span className="font-display text-5xl font-light tabular-nums text-white">
                      {price}
                    </span>
                    {cadence && (
                      <span className="font-sans text-sm text-muted">{cadence}</span>
                    )}
                  </div>
                  <p className="mb-8 font-sans text-xs text-muted/60">{sub}</p>

                  {/* Features */}
                  <ul className="mb-5 flex flex-1 flex-col gap-3.5">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={2.5} />
                        <span className="font-sans text-sm text-muted">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {licenceLink && (
                    <Link
                      href="/terms"
                      className="mb-5 font-sans text-xs text-muted/50 underline-offset-2 hover:text-gold hover:underline"
                    >
                      See licence terms →
                    </Link>
                  )}

                  {/* CTA */}
                  <a
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className={`btn-3d inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3.5 font-sans text-xs font-medium uppercase tracking-[0.1em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${
                      accent
                        ? 'bg-gold text-black'
                        : 'border border-border text-muted transition-colors hover:border-gold/40 hover:text-white'
                    }`}
                  >
                    {cta}
                    {external && <ExternalLink className="h-3.5 w-3.5" />}
                  </a>

                  {belowCta && (
                    <p className="mt-3 text-center font-sans text-[11px] text-muted/40">{belowCta}</p>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-8 text-center font-sans text-xs text-muted/40">
              All plans include the complete system. No hidden fees.
              Starter plan: cancel anytime from your admin panel.
            </p>
          </div>
        </section>

        {/* ─────────────────────────────────────────── 8. FAQ ── */}
        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-[1100px] px-6">
            <Label>Questions</Label>
            <h2 className="mb-14 font-display text-4xl font-light tracking-tight text-white md:text-5xl">
              Before you buy.
            </h2>

            <div className="max-w-2xl divide-y divide-border">
              {FAQ_ITEMS.map(({ q, a }) => (
                <details key={q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                    <span className="font-sans text-sm font-medium text-white transition-colors duration-200 group-open:text-gold">
                      {q}
                    </span>
                    <span className="shrink-0 font-sans text-lg leading-none text-muted/40 transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="pb-6 font-sans text-sm leading-relaxed text-muted">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────── 9. FINAL CTA ── */}
        <section className="py-24 md:py-32 bg-graphite">
          <div className="mx-auto max-w-[1100px] px-6 text-center">
            <h2 className="mb-10 font-display text-4xl font-light tracking-tight text-white md:text-5xl lg:text-6xl">
              Ready to run your rentals properly?
            </h2>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="#pricing"
                className="btn-3d inline-flex items-center justify-center rounded-sm bg-gold px-10 py-4 font-sans text-sm font-medium text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70"
              >
                Get the system — €299
              </a>
              <a
                href="/demo"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-3d inline-flex items-center justify-center gap-2 rounded-sm border border-gold/30 px-10 py-4 font-sans text-sm font-medium text-white transition-colors hover:border-gold/60 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
              >
                See it live first <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            {adminEmail && (
              <p className="mt-8 font-sans text-xs text-muted/40">
                Questions?{' '}
                <a
                  href={`mailto:${adminEmail}`}
                  className="underline-offset-2 transition-colors hover:text-muted hover:underline"
                >
                  {adminEmail}
                </a>
              </p>
            )}
          </div>
        </section>

        {/* ─────────────────────────────────────────── FOOTER ── */}
        <footer className="border-t border-border py-10">
          <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-3 px-6 text-center md:flex-row md:justify-between md:text-left">
            <p className="font-sans text-xs text-muted/35">
              © {new Date().getFullYear()} RentalOS. All rights reserved.
            </p>
            {adminEmail && (
              <a
                href={`mailto:${adminEmail}`}
                className="font-sans text-xs text-muted/35 transition-colors hover:text-muted"
              >
                {adminEmail}
              </a>
            )}
          </div>
        </footer>
      </div>
    </>
  )
}
