import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, ArrowRight, ExternalLink, MessageCircle, Users, Star, Code2, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: {
    absolute: 'RentalOS — Rental Booking System for Car, Yacht & Villa Rentals',
  },
  description: 'Stop managing rental bookings on WhatsApp. RentalOS automates every inquiry, confirmation, and follow-up. From €49/month or buy the template for €299.',
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
    copy: "A customer messages at midnight asking about your vehicle. By morning they've booked with your competitor. You never saw the message.",
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
    headline: "Your rentals command premium rates. Your booking process doesn't.",
    copy: "Your customers expect a professional response. They deserve a confirmation within seconds — not a WhatsApp voice note the next morning.",
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
    scale: 'Premium fleet',
    label: 'Premium fleet operators',
    body: 'Your fleet represents your business. A booking experience that reflects the standard you set — automatic confirmations, professional document handling, a system that earns the trust your operation deserves.',
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
    href: process.env.NEXT_PUBLIC_GUMROAD_URL || '/sell',
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
    <div className="min-h-screen bg-white">

      {/* ── Hero (dark) ────────────────────────────────────── */}
      <section className="hero-dark text-white flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 pb-20 pt-16 text-center">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8">

          <div className="flex items-center gap-2.5">
            <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-white/50">
              RentalOS
            </span>
          </div>

          <h1 className="font-display text-5xl font-extrabold leading-[1.04] tracking-[-0.025em] text-white md:text-6xl lg:text-[4.75rem]">
            While you slept, your competitor confirmed the booking you never saw.
          </h1>

          <div className="flex max-w-lg flex-col gap-1 text-center">
            <p className="font-sans text-lg font-medium text-white leading-snug">
              RentalOS captures every inquiry automatically. Every customer confirmed. Every booking tracked.
            </p>
            <p className="font-sans text-sm text-white/50">
              Next.js 15 · Supabase · Vercel · Full source code
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href="/demo/fleet"
              className="inline-flex items-center justify-center rounded-md bg-gold px-8 py-4 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              See it live →
            </a>
            <a
              href="https://wa.me/36708564381?text=Hi%2C%20I%27m%20interested%20in%20RentalOS"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md border border-white/20 px-8 py-4 font-sans text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Talk to us
            </a>
          </div>

          <a
            href="https://drivecostasol.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-sans text-xs text-white/30 underline-offset-2 transition-colors hover:text-white/60"
          >
            ↗ Running live in Marbella, Spain · drivecostasol.com
          </a>

          <a
            href="#problem"
            aria-label="Scroll to see the problem we solve"
            className="mt-2 text-white/30 transition-colors hover:text-white/60 focus-visible:outline-none focus-visible:text-white/60"
          >
            <ArrowRight className="h-5 w-5 rotate-90" />
          </a>
        </div>
      </section>

      {/* ── Pain & Solution (gray-50) ──────────────────────── */}
      <section id="problem" className="bg-gray-50 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">
              The problem
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Sound familiar?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-6">
            {PAIN_CARDS.slice(0, 3).map(({ Icon, tag, headline, copy }, i) => (
              <div
                key={tag}
                className="card-3d card-stagger md:col-span-2 flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                style={{ '--stagger': i } as React.CSSProperties}
              >
                <div className="flex items-start justify-between gap-3">
                  <Icon className="h-5 w-5 text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span className="rounded-sm border border-gold/20 bg-gold/5 px-2.5 py-0.5 font-sans text-[10px] uppercase tracking-[0.15em] text-gold/80 text-right">
                    {tag}
                  </span>
                </div>
                <div>
                  <h3 className="mb-2 font-display text-xl font-bold text-gray-900">{headline}</h3>
                  <p className="font-sans text-sm leading-relaxed text-muted">{copy}</p>
                </div>
              </div>
            ))}
            {PAIN_CARDS.slice(3).map(({ Icon, tag, headline, copy }, i) => (
              <div
                key={tag}
                className="card-3d card-stagger md:col-span-3 flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                style={{ '--stagger': i + 3 } as React.CSSProperties}
              >
                <div className="flex items-start justify-between gap-3">
                  <Icon className="h-5 w-5 text-gold shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span className="rounded-sm border border-gold/20 bg-gold/5 px-2.5 py-0.5 font-sans text-[10px] uppercase tracking-[0.15em] text-gold/80 text-right">
                    {tag}
                  </span>
                </div>
                <div>
                  <h3 className="mb-2 font-display text-xl font-bold text-gray-900">{headline}</h3>
                  <p className="font-sans text-sm leading-relaxed text-muted">{copy}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-14 text-center font-display text-2xl font-bold text-gold md:text-3xl">
            RentalOS solves all of this.
          </p>
        </div>
      </section>

      {/* ── CTA strip ──────────────────────────────────────── */}
      <section className="bg-slate-900 py-12">
        <div className="mx-auto max-w-6xl px-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl font-bold text-white">See how RentalOS solves this.</p>
            <p className="font-sans text-sm text-slate-400 mt-1">From inquiry to confirmation in seconds — automatically.</p>
          </div>
          <a
            href="/demo"
            className="shrink-0 inline-flex items-center justify-center rounded-md bg-gold px-6 py-3 font-sans text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            See it live →
          </a>
        </div>
      </section>

      {/* ── What's included (white) ────────────────────────── */}
      <section id="features" className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">
              What you get
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Everything to launch in a day
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-gold/30 bg-gold/10">
                  <Check className="h-3 w-3 text-gold" />
                </div>
                <span className="font-sans text-sm leading-relaxed text-muted">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ──────────────────────────────────────── */}
      <section className="bg-slate-900 py-12">
        <div className="mx-auto max-w-6xl px-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl font-bold text-white">Try the live demo.</p>
            <p className="font-sans text-sm text-slate-400 mt-1">A real car rental business running on RentalOS, right now.</p>
          </div>
          <a
            href="/demo/fleet"
            className="shrink-0 inline-flex items-center justify-center rounded-md bg-gold px-6 py-3 font-sans text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Visit the demo →
          </a>
        </div>
      </section>

      {/* ── Built for a real business (dark) ──────────────── */}
      <section className="bg-slate-900 text-white py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">

            <div>
              <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">
                See it live
              </p>
              <h2 className="mb-6 font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
                Built for a real business
              </h2>
              <p className="mb-8 font-sans text-sm leading-relaxed text-slate-300">
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
              className="group flex min-h-[200px] aspect-video items-center justify-center rounded-xl border border-slate-700 bg-slate-800 transition-all hover:border-gold/40 hover:shadow-lg focus-visible:outline-none focus-visible:border-gold/50"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="font-display text-3xl font-bold text-slate-400 transition-colors group-hover:text-white">
                  Demo →
                </span>
                <span className="font-sans text-xs uppercase tracking-[0.15em] text-slate-600">
                  /demo
                </span>
              </div>
            </a>

          </div>
        </div>
      </section>

      {/* ── Who it's for (gray-50) ─────────────────────────── */}
      <section className="bg-gray-50 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">
              Built for
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Who it&apos;s for
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-6">
            {FOR_WHO.slice(0, 3).map(({ scale, label, body, cta, href }) => (
              <div
                key={label}
                className="md:col-span-2 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold/60">{scale}</p>
                <h3 className="font-display text-xl font-semibold text-gray-900">{label}</h3>
                <p className="font-sans text-sm leading-relaxed text-muted flex-1">{body}</p>
                <Link
                  href={href}
                  className="mt-2 inline-flex items-center gap-1 font-sans text-xs text-gold underline-offset-4 hover:underline"
                >
                  {cta}
                </Link>
              </div>
            ))}
            {FOR_WHO.slice(3).map(({ scale, label, body, cta, href }) => (
              <div
                key={label}
                className="md:col-span-3 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold/60">{scale}</p>
                <h3 className="font-display text-xl font-semibold text-gray-900">{label}</h3>
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

      {/* ── Social proof / CostaSol (white) ────────────────── */}
      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-2xl px-6">
          <div className="rounded-xl border border-gold/20 bg-white px-8 py-10 shadow-lg ring-1 ring-gold/8">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-6">Built for a real business</p>
            <blockquote className="mb-6 font-display text-2xl font-bold leading-relaxed text-gray-900">
              Before RentalOS, we managed everything on WhatsApp and a shared spreadsheet. Now every inquiry gets a confirmation email within seconds. Our customers think we&apos;re a much bigger operation than we are.
            </blockquote>
            <div className="flex items-end justify-between gap-6 mb-8">
              <div>
                <p className="font-sans text-sm font-medium text-gray-900">CostaSol Car Rent</p>
                <p className="mt-0.5 font-sans text-xs text-muted">Marbella, Spain — running since 2026</p>
              </div>
              <a
                href="https://drivecostasol.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-sans text-xs text-muted hover:text-gold transition-colors"
              >
                drivecostasol.com <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="grid grid-cols-3 gap-px bg-gold/10 rounded-lg overflow-hidden mb-6">
              {[
                { value: '0', label: 'Double bookings since launch' },
                { value: '48h', label: 'Time to go live' },
                { value: '100%', label: 'Inquiries captured' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-white py-6 text-center">
                  <p className="font-display text-3xl font-bold text-gold">{value}</p>
                  <p className="mt-1 px-2 font-sans text-xs leading-snug text-muted">{label}</p>
                </div>
              ))}
            </div>
            <Link
              href="/demo/fleet"
              className="inline-flex items-center gap-1.5 font-sans text-sm text-gold hover:underline underline-offset-4"
            >
              Visit the demo →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing teaser (dark) ──────────────────────────── */}
      <section id="pricing" className="bg-slate-900 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">
              Pricing
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
              Choose how you get started
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-start">
            {PRICING.map(({ name, price, cadence, lines, licenceLink, cta, href, accent }) => (
              <div
                key={name}
                className={`flex flex-col rounded-xl border ${
                  accent
                    ? 'border-2 border-gold bg-white shadow-2xl shadow-gold/15 relative z-10 p-10'
                    : 'border-gray-200 bg-white shadow-sm p-8'
                }`}
              >
                {accent && (
                  <div className="mb-4 self-start">
                    <span className="rounded-sm bg-gold px-3 py-1 font-sans text-[10px] uppercase tracking-[0.15em] text-white">
                      Popular
                    </span>
                  </div>
                )}

                <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">
                  {name}
                </p>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-extrabold text-gray-900">{price}</span>
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
                  className={`inline-flex items-center justify-center rounded-md px-6 py-3 font-sans text-xs uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                    accent
                      ? 'bg-gold text-white hover:opacity-90'
                      : 'border border-border text-muted hover:border-gold/40 hover:text-gray-900'
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

      {/* ── FAQ (gray-50) ──────────────────────────────────── */}
      <section className="bg-gray-50 py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-14">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">
              Questions
            </p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              FAQ
            </h2>
          </div>

          <div className="divide-y divide-border">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="py-7">
                <p className="mb-2 font-sans text-sm font-medium text-gray-900">{q}</p>
                <p className="font-sans text-sm leading-relaxed text-muted">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA (dark) ───────────────────────────────── */}
      <section className="bg-slate-900 py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-8 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
            Ready to launch your rental business?
          </h2>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="/demo/fleet"
              className="inline-flex items-center justify-center rounded-md bg-gold px-8 py-4 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              See it live →
            </a>
            <a
              href="https://wa.me/36708564381?text=Hi%2C%20I%27m%20interested%20in%20RentalOS"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md border border-white/20 px-8 py-4 font-sans text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Talk to us →
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
