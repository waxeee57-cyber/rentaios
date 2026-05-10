import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Yacht Charter Booking System — RentalOS',
  description: 'A complete day charter booking system for yacht and boat rental businesses. Inquiry form, admin panel, email confirmations. Deploy in one day. From €99/month.',
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'}/yacht-charter-booking-system` },
  openGraph: {
    title: 'Yacht Charter Booking System — RentalOS',
    description: 'Day charter booking software for yacht and boat rentals. Full admin panel, email alerts, mobile-first.',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'RentalOS — Yacht Charter',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '99', priceCurrency: 'EUR', priceSpecification: { priceType: 'monthly' } },
  description: 'Booking system for yacht charter and day boat rental businesses.',
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'}/yacht-charter-booking-system`,
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Does RentalOS work for day charter businesses?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. The booking system handles single-day and multi-day charters equally well. You control the minimum and maximum duration.' },
    },
    {
      '@type': 'Question',
      name: 'Can I set different pricing for different vessels?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Each vessel has its own daily rate, deposit, and availability.' },
    },
    {
      '@type': 'Question',
      name: 'Can customers pay online?',
      acceptedAnswer: { '@type': 'Answer', text: 'Payment is collected in person or via bank transfer — most charter businesses prefer this. Stripe integration is available on the Pro plan.' },
    },
    {
      '@type': 'Question',
      name: 'How does delivery to a marina work?',
      acceptedAnswer: { '@type': 'Answer', text: 'Customers can request delivery to any marina or location. You set the fee before confirming the booking.' },
    },
  ],
}

export default function YachtCharterBookingSystemPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <LandingPage />
    </>
  )
}

function LandingPage() {
  return (
    <div className="bg-black min-h-screen text-white">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-4xl px-6 pt-10 pb-2">
        <nav className="font-sans text-xs text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/sell" className="hover:text-white transition-colors">Software</Link>
          <span className="mx-2">›</span>
          <span className="text-white/60">Yacht charter booking system</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-20">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-4">Yacht charter software</p>
        <h1 className="font-display text-5xl font-light tracking-tight text-white mb-6 max-w-2xl">
          Your day charter business deserves better than WhatsApp.
        </h1>
        <p className="font-sans text-base text-muted leading-relaxed max-w-xl mb-10">
          RentalOS is a complete booking system for yacht and boat charter businesses.
          Inquiry to confirmation in minutes. Admin panel that works on the dock.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-2 min-h-[48px] rounded-md bg-gold px-8
              font-sans text-sm font-medium text-black hover:opacity-90 transition-opacity"
          >
            See how it works
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 min-h-[48px] rounded-md border border-white/20 px-8
              font-sans text-sm text-white hover:border-gold/40 transition-colors"
          >
            Explore live demo
          </Link>
        </div>
      </section>

      {/* Pain section */}
      <section className="border-t border-white/5 mx-auto max-w-4xl px-6 py-20">
        <h2 className="font-display text-3xl font-light text-white mb-12">Sound familiar?</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              number: '01',
              pain: 'Juggling charter requests across three different apps',
              detail: 'One customer on WhatsApp. Another by email. A third calling your mobile. No central record. Something gets missed.',
            },
            {
              number: '02',
              pain: 'Chasing documents and deposits before departure day',
              detail: 'Safety certificates. Passport copies. Skipper licence. All collected ad-hoc. The morning of the charter is chaos.',
            },
            {
              number: '03',
              pain: 'No way to see what\'s booked without checking each thread',
              detail: 'Is the 6th free? You have to scroll back through WhatsApp to find out. A shared calendar would help — but nobody updates it.',
            },
          ].map(item => (
            <div key={item.number}>
              <p className="font-sans text-xs text-gold/60 mb-3">{item.number}</p>
              <p className="font-sans text-sm font-medium text-white mb-2">{item.pain}</p>
              <p className="font-sans text-sm text-muted leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution section */}
      <section id="how-it-works" className="border-t border-white/5 bg-white/[0.02] px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-light text-white mb-4">RentalOS handles it.</h2>
          <p className="font-sans text-sm text-muted mb-12 max-w-lg">Built for charter businesses that live on the water, not behind a desk.</p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                label: 'All bookings in one place',
                detail: 'Every inquiry captured in the admin panel, regardless of how the customer first reached you. Nothing falls through.',
              },
              {
                label: 'Automatic availability control',
                detail: 'Confirmed charters block the vessel\'s calendar instantly. Overlap is prevented at the database level.',
              },
              {
                label: 'Custom delivery to any marina',
                detail: 'Set a delivery fee per booking. Customer sees it in their confirmation. You see it in the admin. Clean.',
              },
            ].map(item => (
              <div key={item.label}>
                <p className="font-sans text-sm font-medium text-white mb-2">{item.label}</p>
                <p className="font-sans text-sm text-muted leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features for yacht vertical */}
      <section className="border-t border-white/5 mx-auto max-w-4xl px-6 py-20">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-8">Built for charter businesses</p>
        <div className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
          {[
            ['Calendar blocking', 'Confirmed charters prevent any overlap at the database level.'],
            ['Inquiry form', 'Customer selects vessel, dates, departure point. You get an instant alert.'],
            ['Marina delivery', 'Charge extra for delivery to a specific marina or anchorage.'],
            ['Email alerts', 'You hear about every new inquiry immediately, even on a day at sea.'],
          ].map(([feat, desc]) => (
            <div key={feat} className="flex gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-gold/60 mt-2 shrink-0" />
              <div>
                <p className="font-sans text-sm font-medium text-white">{feat}</p>
                <p className="font-sans text-xs text-muted mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="border-t border-white/5 bg-white/[0.02] px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <blockquote className="font-display text-2xl font-light text-white/80 italic mb-4">
            "Built for CostaSol Car Rent, Marbella. Live at drivecostasol.com"
          </blockquote>
          <p className="font-sans text-xs text-muted">Same system, adapted for your business type. Explore the live demo.</p>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="border-t border-white/5 mx-auto max-w-4xl px-6 py-20">
        <p className="font-sans text-sm text-muted mb-4">From €99/month. 14-day free trial. No credit card required.</p>
        <Link href="/pricing" className="font-sans text-sm text-gold hover:underline underline-offset-4">See all plans →</Link>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/5 mx-auto max-w-4xl px-6 py-20">
        <h2 className="font-display text-3xl font-light text-white mb-10">Questions</h2>
        <div className="space-y-8">
          {[
            ['Does RentalOS work for day charter businesses?', 'Yes. It handles single-day and multi-day charters equally well. You control minimum and maximum duration.'],
            ['Can I set different pricing per vessel?', 'Yes. Each vessel has its own daily rate, deposit, and availability calendar.'],
            ['Can customers pay online?', 'Payment is collected in person or by bank transfer — most charter businesses prefer this. Stripe is available on the Pro plan.'],
            ['How does marina delivery work?', 'Customers can request departure from any location. You set the extra fee before confirming.'],
          ].map(([q, a]) => (
            <div key={q} className="border-b border-white/5 pb-8 last:border-0">
              <p className="font-sans text-sm font-medium text-white mb-2">{q}</p>
              <p className="font-sans text-sm text-muted leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-white/5 bg-white/[0.02] px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-4xl font-light text-white mb-6">Ready to automate your bookings?</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/pricing" className="inline-flex items-center min-h-[48px] rounded-md bg-gold px-8 font-sans text-sm font-medium text-black hover:opacity-90 transition-opacity">
              Start free trial
            </Link>
            <Link href="/demo" className="inline-flex items-center min-h-[48px] rounded-md border border-white/20 px-8 font-sans text-sm text-white hover:border-gold/40 transition-colors">
              See live demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
