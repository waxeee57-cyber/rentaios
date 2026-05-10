import type { Metadata } from 'next'
import { Check, ArrowRight, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'RentalOS — Luxury Rental Booking System',
  description:
    'A complete luxury rental booking system. Inquiry, confirm, pickup, return — all in one mobile-first admin panel. Built for car rental, yacht, villa, and motorcycle businesses.',
  openGraph: {
    title: 'RentalOS — Luxury Rental Booking System',
    description:
      'Full Next.js booking system with admin panel, email notifications, and Supabase backend. Deploy in one day.',
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

const FOR_WHO = [
  {
    label: 'Freelancers',
    body: 'Building rental systems for clients. Skip 3 weeks of boilerplate and deliver a polished, production-ready product from day one.',
  },
  {
    label: 'Rental business owners',
    body: 'Stop managing bookings via WhatsApp and spreadsheets. Own your tech. Own your data. No monthly platform lock-in.',
  },
  {
    label: 'Developers',
    body: 'Launching your own rental SaaS. The hard parts — booking logic, overlap prevention, admin panel, email — are already done.',
  },
]

const PRICING = [
  {
    name: 'Template',
    price: '€299',
    cadence: 'once',
    lines: ['Full source code', 'Deploy yourself', 'MIT license', 'Free updates (git pull)'],
    cta: 'Buy now',
    href: '/sell',
    accent: false,
  },
  {
    name: 'Done-for-you',
    price: '€499',
    cadence: 'once',
    lines: ['We deploy it', 'Your domain', '30-day support', 'Everything configured'],
    cta: 'Get started',
    href: '/pricing',
    accent: true,
  },
  {
    name: 'White-glove',
    price: '€199',
    cadence: '/ month',
    lines: ['Everything managed', 'Monthly reports', 'Priority support', 'Updates included'],
    cta: 'Contact us',
    href: '/pricing',
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
    a: 'Yes. MIT license — use it however you like. Build client projects, charge for customisation, or launch your own SaaS on top of it.',
  },
  {
    q: 'Is there a demo?',
    a: 'Yes. Visit /demo to explore a live luxury car rental business running on this exact codebase.',
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
            A complete luxury rental booking system.{' '}
            <em className="italic text-gold">
              Ready to deploy in one day.
            </em>
          </h1>

          <p className="max-w-lg font-sans text-base leading-relaxed text-muted">
            Next.js · Supabase · Admin panel · Email notifications · Mobile-first
          </p>

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
            href="#features"
            aria-label="Scroll to features"
            className="mt-2 text-muted transition-colors hover:text-gold focus-visible:outline-none focus-visible:text-gold"
          >
            <ArrowRight className="h-5 w-5 rotate-90" />
          </a>
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
                A live luxury car rental business in Marbella is running this exact
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {FOR_WHO.map(({ label, body }) => (
              <div
                key={label}
                className="flex flex-col gap-3 rounded-md border border-border bg-black/40 p-6"
              >
                <h3 className="font-display text-xl font-medium text-white">{label}</h3>
                <p className="font-sans text-sm leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof ───────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p
            className="mb-4 font-display text-7xl leading-none text-gold/20 select-none"
            aria-hidden="true"
          >
            &ldquo;
          </p>
          <blockquote className="font-display text-2xl font-light italic leading-relaxed text-white md:text-3xl">
            Running in production at a luxury rental business in Marbella. Real bookings. Real customers.
          </blockquote>
          <p className="mt-6 font-sans text-xs uppercase tracking-[0.2em] text-muted">
            — Reference deployment
          </p>
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
            {PRICING.map(({ name, price, cadence, lines, cta, href, accent }) => (
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
