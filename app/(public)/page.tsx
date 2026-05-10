import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, ArrowRight, ExternalLink, MessageCircle, Users, Star, Code2, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'RentalOS — Booking System for Car, Yacht & Villa Rentals',
  description:
    'A complete rental booking system for car, yacht, villa, and motorcycle businesses. Inquiry to confirmation in minutes. Admin panel, email notifications, mobile-first.',
  openGraph: {
    title: 'RentalOS — Booking System for Car, Yacht & Villa Rentals',
    description:
      'Complete rental booking system with admin panel, email notifications, and fleet management. Deploy in one day.',
  },
}

const FEATURES = [
  'Full Next.js App Router codebase',
  'Supabase schema, RLS policies, seed data',
  'Admin panel (bookings, fleet, dashboard)',
  'Email system (5 templates, Resend)',
  'Inquiry → Confirm → Pickup → Return flow',
  'Transfer/delivery feature',
  'Rate limiting + security hardened',
  'SEO optimized (sitemap, schema, robots)',
  'Vercel deploy ready',
  'Full documentation',
]

const PAIN_CARDS = [
  {
    Icon: MessageCircle,
    tag: 'Solo operators',
    headline: 'Inquiries lost in WhatsApp',
    copy: "A customer messages at midnight asking about your Ferrari. By morning they've booked with your competitor. You never saw the message.",
  },
  {
    Icon: Users,
    tag: 'Growing businesses',
    headline: "You can't delegate because there's no system",
    copy: "Everything lives in your head. Your staff can't confirm a booking without calling you. You're the bottleneck in your own business.",
  },
  {
    Icon: Star,
    tag: 'Premium fleets',
    headline: "Your cars are premium. Your booking process isn't.",
    copy: "Customers pay €1,500 a day to drive your Bentley. They deserve a confirmation email that matches that level. Not a WhatsApp voice note.",
  },
  {
    Icon: Code2,
    tag: 'Developers & agencies',
    headline: '3 weeks to build what should take 3 days',
    copy: "Every rental client needs the same things: booking flow, admin panel, email notifications, availability calendar. You've built it before. You'll build it again.",
  },
  {
    Icon: MapPin,
    tag: 'Multi-location operators',
    headline: 'No unified view across your locations',
    copy: 'Your Marbella fleet is in one spreadsheet. Ibiza in another. Someone always has the wrong information. A booking gets confirmed twice.',
  },
]

const FOR_WHO = [
  {
    scale: '1–5 vehicles',
    label: 'Solo operators',
    body: 'You manage everything yourself. RentalOS handles the admin so you can focus on the drives. Inquiries captured 24/7, confirmations sent automatically, no more chasing documents.',
    cta: 'See how it works →',
    href: '/demo',
  },
  {
    scale: '5–20 vehicles',
    label: 'Growing businesses',
    body: 'Your team needs a system they can follow without calling you. RentalOS gives everyone a clear view of every booking, every vehicle, every customer — from any device.',
    cta: 'Start free trial →',
    href: '/pricing',
  },
  {
    scale: '€150,000+ fleet value',
    label: 'Premium fleet operators',
    body: 'Your cars are €150,000+. Your booking experience should match. Branded confirmations, professional document handling, a system that reflects the quality of your fleet.',
    cta: 'See the admin panel →',
    href: '/demo/admin',
  },
  {
    scale: 'Build for clients',
    label: 'Freelancers & agencies',
    body: 'Stop rebuilding the same rental system for every client. Buy once, deploy many times. Full source code, commercial licence, documented and production-ready.',
    cta: 'Buy template — €299',
    href: '/sell',
  },
  {
    scale: 'Multiple sites',
    label: 'Multi-location operators',
    body: 'One admin panel. All your locations. Every booking visible from anywhere. Set up once, manage everything centrally.',
    cta: 'Contact us →',
    href: '/contact',
  },
]

const PRICING = [
  {
    name: 'Template',
    price: '€299',
    cadence: 'once',
    lines: [
      'Full source code',
      'Deploy yourself',
      'RentalOS Commercial Licence',
      'Single deployment included',
      'Free updates (git pull)',
    ],
    licenceLink: true,
    cta: 'Buy now',
    href: '/sell',
    accent: false,
  },
  {
    name: 'Done-for-you',
    price: '€499',
    cadence: 'once',
    lines: ['We deploy it', 'Your domain', '30-day support', 'Everything configured'],
    licenceLink: false,
    cta: 'Get started',
    href: '/onboarding',
    accent: true,
  },
  {
    name: 'White-glove',
    price: '€199',
    cadence: '/ month',
    lines: ['Everything managed', 'Monthly reports', 'Priority support', 'Updates included'],
    licenceLink: false,
    cta: 'Contact us',
    href: '/contact',
    accent: false,
  },
]

const FAQ_ITEMS = [
  {
    q: 'What tech do I need?',
    a: 'Node.js 18+, a free Supabase account, and a free Vercel account. All free tiers are sufficient to launch and handle early traffic.',
  },
  {
    q: 'Can I resell to clients?',
    a: 'Yes. The commercial licence covers a single deployment. For agency/multi-client use, see the template listing for full terms.',
  },
  {
    q: 'Is there a demo?',
    a: 'Yes. Visit /demo to explore a live car rental business running on this exact codebase.',
  },
  {
    q: 'How long to deploy?',
    a: 'About 1–2 hours with the included setup guide. Fork the repo, connect Supabase and Vercel, set environment variables, push. Done.',
  },
  {
    q: 'Do you offer support?',
    a: 'Yes — see the Done-for-you plan. We deploy and configure everything for you, with 30 days of included support after handoff.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 pb-20 pt-16 text-center">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8">

          <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-graphite/60 px-4 py-1.5 backdrop-blur-sm">
            <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-muted">
              RentalOS
            </span>
          </div>

          <h1 className="font-display text-5xl font-light leading-[1.06] tracking-[-0.02em] text-white md:text-6xl lg:text-[4.5rem]">
            A complete rental booking system.{' '}
            <em className="italic text-gold">
              Ready to deploy in one day.
            </em>
          </h1>

          <div className="flex max-w-lg flex-col gap-1 text-center">
            <p className="font-sans text-lg font-medium text-white leading-snug">
              Stop managing bookings on WhatsApp. Automate everything.
            </p>
            <p className="font-sans text-sm text-muted">
              Next.js 15 · Supabase · Vercel · MIT licence · Full source code
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href="/pricing"
              className="inline-flex items-center justify-center rounded-md bg-gold px-8 py-4 font-sans text-sm font-medium text-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Start free trial
            </a>
            <a
              href="/sell"
              className="inline-flex items-center justify-center rounded-md border border-gold/30 px-8 py-4 font-sans text-sm font-medium text-white transition-colors hover:border-gold/60 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Buy template — €299
            </a>
          </div>

          <a
            href="#problem"
            aria-label="Scroll to see the problem we solve"
            className="mt-2 text-muted transition-colors hover:text-gold focus-visible:outline-none focus-visible:text-gold"
          >
            <ArrowRight className="h-5 w-5 rotate-90" />
          </a>
        </div>
      </section>

      {/* ── Pain & Solution ────────────────────────────────────── */}
      <section id="problem" className="border-t border-border py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">
              The problem
            </p>
            <h2 className="font-display text-4xl font-light tracking-tight text-white md:text-5xl">
              Sound familiar?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-6">
            {PAIN_CARDS.slice(0, 3).map(({ Icon, tag, headline, copy }) => (
              <div
                key={tag}
                className="md:col-span-2 flex flex-col gap-5 rounded-md border border-border bg-graphite/40 p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <Icon className="h-5 w-5 text-gold/50 shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span className="rounded-full border border-gold/20 bg-gold/5 px-2.5 py-0.5 font-sans text-[10px] uppercase tracking-[0.15em] text-gold/60 text-right">
                    {tag}
                  </span>
                </div>
                <div>
                  <h3 className="mb-2 font-display text-xl font-medium text-white">{headline}</h3>
                  <p className="font-sans text-sm leading-relaxed text-muted">{copy}</p>
                </div>
              </div>
            ))}
            {PAIN_CARDS.slice(3).map(({ Icon, tag, headline, copy }, i) => (
              <div
                key={tag}
                className={`md:col-span-3 ${i === 0 ? 'md:col-start-2' : ''} flex flex-col gap-5 rounded-md border border-border bg-graphite/40 p-6`}
              >
                <div className="flex items-start justify-between gap-3">
                  <Icon className="h-5 w-5 text-gold/50 shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span className="rounded-full border border-gold/20 bg-gold/5 px-2.5 py-0.5 font-sans text-[10px] uppercase tracking-[0.15em] text-gold/60 text-right">
                    {tag}
                  </span>
                </div>
                <div>
                  <h3 className="mb-2 font-display text-xl font-medium text-white">{headline}</h3>
                  <p className="font-sans text-sm leading-relaxed text-muted">{copy}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-14 text-center font-display text-2xl font-light italic text-gold md:text-3xl">
            RentalOS solves all of this.
          </p>
        </div>
      </section>

      {/* ── What's included ────────────────────────────────────── */}
      <section id="features" className="bg-graphite py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">
              What you get
            </p>
            <h2 className="font-display text-4xl font-light tracking-tight text-white md:text-5xl">
              Everything to launch in a day
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-gold/20 bg-gold/10">
                  <Check className="h-3 w-3 text-gold" />
                </div>
                <span className="font-sans text-sm leading-relaxed text-muted">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live demo ──────────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">

            <div>
              <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">
                See it live
              </p>
              <h2 className="mb-6 font-display text-4xl font-light tracking-tight text-white md:text-5xl">
                Built for a real business
              </h2>
              <p className="mb-8 font-sans text-sm leading-relaxed text-muted">
                A car rental business in Marbella is running this exact
                codebase in production. Same admin panel. Same booking flow. Your branding.
              </p>
              <a
                href="/demo"
                className="inline-flex items-center gap-1.5 font-sans text-sm text-gold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline"
              >
                Visit the demo <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <a
              href="/demo"
              className="group flex min-h-[200px] aspect-video items-center justify-center rounded-md border border-border bg-graphite transition-colors hover:border-gold/30 focus-visible:outline-none focus-visible:border-gold/50"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="font-display text-3xl font-light text-muted transition-colors group-hover:text-white">
                  Demo →
                </span>
                <span className="font-sans text-xs uppercase tracking-[0.15em] text-muted/50">
                  /demo
                </span>
              </div>
            </a>

          </div>
        </div>
      </section>

      {/* ── Who it's for ───────────────────────────────────────── */}
      <section className="bg-graphite py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">
              Built for
            </p>
            <h2 className="font-display text-4xl font-light tracking-tight text-white md:text-5xl">
              Who it&apos;s for
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-6">
            {FOR_WHO.slice(0, 3).map(({ scale, label, body, cta, href }) => (
              <div
                key={label}
                className="md:col-span-2 flex flex-col gap-3 rounded-md border border-border bg-black/40 p-6"
              >
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold/50">{scale}</p>
                <h3 className="font-display text-xl font-medium text-white">{label}</h3>
                <p className="font-sans text-sm leading-relaxed text-muted flex-1">{body}</p>
                <Link
                  href={href}
                  className="mt-2 inline-flex items-center gap-1 font-sans text-xs text-gold underline-offset-4 hover:underline"
                >
                  {cta}
                </Link>
              </div>
            ))}
            {FOR_WHO.slice(3).map(({ scale, label, body, cta, href }, i) => (
              <div
                key={label}
                className={`md:col-span-3 ${i === 0 ? 'md:col-start-2' : ''} flex flex-col gap-3 rounded-md border border-border bg-black/40 p-6`}
              >
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold/50">{scale}</p>
                <h3 className="font-display text-xl font-medium text-white">{label}</h3>
                <p className="font-sans text-sm leading-relaxed text-muted flex-1">{body}</p>
                <Link
                  href={href}
                  className="mt-2 inline-flex items-center gap-1 font-sans text-xs text-gold underline-offset-4 hover:underline"
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof ───────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-2xl px-6">
          <p
            className="mb-6 font-display text-6xl leading-none text-gold/15 select-none"
            aria-hidden="true"
          >
            &ldquo;
          </p>
          <blockquote className="mb-8 font-display text-2xl font-light italic leading-relaxed text-white md:text-3xl">
            Before RentalOS, we managed everything on WhatsApp and a shared spreadsheet. Now every inquiry gets a confirmation email within seconds. Our customers think we&apos;re a much bigger operation than we are.
          </blockquote>
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="font-sans text-sm font-medium text-white">CostaSol Car Rent</p>
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

          <div className="mt-16 grid grid-cols-3 gap-px bg-border">
            {[
              { value: '48h', label: 'Average deployment time' },
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

      {/* ── Pricing teaser ─────────────────────────────────────── */}
      <section id="pricing" className="bg-graphite py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">
              Pricing
            </p>
            <h2 className="font-display text-4xl font-light tracking-tight text-white md:text-5xl">
              Choose how you get started
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PRICING.map(({ name, price, cadence, lines, licenceLink, cta, href, accent }) => (
              <div
                key={name}
                className={`flex flex-col rounded-md border p-8 ${
                  accent
                    ? 'border-gold/40 bg-gold/5 ring-1 ring-gold/10'
                    : 'border-border bg-black/40'
                }`}
              >
                {accent && (
                  <div className="mb-4 self-start">
                    <span className="rounded-sm bg-gold/15 px-2.5 py-0.5 font-sans text-[10px] uppercase tracking-[0.15em] text-gold">
                      Popular
                    </span>
                  </div>
                )}

                <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">
                  {name}
                </p>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-light text-white">{price}</span>
                  <span className="font-sans text-sm text-muted">{cadence}</span>
                </div>

                <ul className="my-8 flex flex-1 flex-col gap-3">
                  {lines.map((line) => (
                    <li key={line} className="flex items-center gap-2.5">
                      <Check className="h-3.5 w-3.5 shrink-0 text-gold" />
                      <span className="font-sans text-sm text-muted">{line}</span>
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

                <a
                  href={href}
                  className={`inline-flex items-center justify-center rounded-md px-6 py-3 font-sans text-xs uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                    accent
                      ? 'bg-gold text-black hover:opacity-90'
                      : 'border border-border text-muted hover:border-gold/40 hover:text-white'
                  }`}
                >
                  {cta}
                </a>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a
              href="/pricing"
              className="inline-flex items-center gap-1.5 font-sans text-sm text-gold underline-offset-4 hover:underline"
            >
              See full pricing details <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-14">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">
              Questions
            </p>
            <h2 className="font-display text-4xl font-light tracking-tight text-white md:text-5xl">
              FAQ
            </h2>
          </div>

          <div className="divide-y divide-border">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="py-7">
                <p className="mb-2 font-sans text-sm font-medium text-white">{q}</p>
                <p className="font-sans text-sm leading-relaxed text-muted">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────── */}
      <section className="bg-graphite py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-8 font-display text-3xl font-light tracking-tight text-white md:text-4xl">
            Ready to launch your rental business?
          </h2>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="/pricing"
              className="inline-flex items-center justify-center rounded-md bg-gold px-8 py-4 font-sans text-sm font-medium text-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-graphite"
            >
              Start free trial
            </a>
            <a
              href="/sell"
              className="inline-flex items-center justify-center rounded-md border border-gold/30 px-8 py-4 font-sans text-sm font-medium text-white transition-colors hover:border-gold/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-graphite"
            >
              Buy template — €299
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
