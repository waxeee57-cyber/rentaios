import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Car Rental Booking Software',
  description: 'Stop managing car rental bookings on WhatsApp. RentalOS is a complete car hire management system: inquiry form, admin panel, email alerts, mobile-first. Deploy in one day.',
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'}/car-rental-booking-software` },
  openGraph: {
    title: 'Car Rental Booking Software — RentalOS',
    description: 'Complete car hire management system. Inquiry-to-return workflow, admin panel, email alerts.',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'RentalOS',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '99', priceCurrency: 'EUR', priceSpecification: { priceType: 'monthly' } },
  description: 'Car rental booking software with admin panel, email notifications, and mobile-first design.',
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'}/car-rental-booking-software`,
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Does this work for any size of car rental business?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. It works from 1 vehicle to 50+. The admin panel is designed to be used on a phone in the field.' },
    },
    {
      '@type': 'Question',
      name: 'Can I use it without a website developer?',
      acceptedAnswer: { '@type': 'Answer', text: 'If you choose the done-for-you option (€499 one-time), we handle everything. Otherwise the template requires basic technical knowledge to deploy.' },
    },
    {
      '@type': 'Question',
      name: 'Does it replace my current booking system?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. It replaces WhatsApp chaos, spreadsheet juggling, and expensive all-in-one platforms that charge per booking.' },
    },
    {
      '@type': 'Question',
      name: 'Is there a free trial?',
      acceptedAnswer: { '@type': 'Answer', text: '14 days, no credit card required. Or explore the live demo first.' },
    },
  ],
}

export default function CarRentalBookingSoftwarePage() {
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
    <div className="bg-white min-h-screen text-gray-900">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-4xl px-6 pt-10 pb-2">
        <nav className="font-sans text-xs text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/sell" className="hover:text-gray-900 transition-colors">Software</Link>
          <span className="mx-2">›</span>
          <span className="text-muted">Car rental booking software</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-20">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-4">Car rental software</p>
        <h1 className="font-display text-5xl font-light tracking-tight text-white mb-6 max-w-2xl">
          Stop managing car rental bookings on WhatsApp.
        </h1>
        <p className="font-sans text-base text-muted leading-relaxed max-w-xl mb-10">
          RentalOS is a complete car hire management system. Inquiry form, confirmation emails,
          admin panel, mobile-first — deployed and live in one day.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-2 min-h-[48px] rounded-md bg-gold px-8
              font-sans text-sm font-medium text-gray-900 hover:opacity-90 transition-opacity"
          >
            See how it works
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 min-h-[48px] rounded-md border border-border px-8
              font-sans text-sm text-muted hover:border-gold/40 hover:text-gray-900 transition-colors"
          >
            Explore live demo
          </Link>
        </div>
      </section>

      {/* Pain section */}
      <section className="border-t border-border mx-auto max-w-4xl px-6 py-20">
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-12">Sound familiar?</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              number: '01',
              pain: 'Missed inquiries when you\'re busy on site',
              detail: 'A customer sends a WhatsApp at 3pm. You\'re handing back keys. By the time you reply it\'s gone to a competitor.',
            },
            {
              number: '02',
              pain: 'Double bookings because the calendar is in your head',
              detail: 'Two customers. Same car. Same weekend. An impossible conversation to have. Avoidable with the right system.',
            },
            {
              number: '03',
              pain: 'Hours lost chasing documents and payments',
              detail: 'Licence photos by WhatsApp. Deposit by bank transfer. Manual follow-ups. Every booking takes 30 minutes of admin.',
            },
          ].map(item => (
            <div key={item.number}>
              <p className="font-sans text-xs text-gold/60 mb-3">{item.number}</p>
              <p className="font-sans text-sm font-medium text-gray-900 mb-2">{item.pain}</p>
              <p className="font-sans text-sm text-muted leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution section */}
      <section id="how-it-works" className="border-t border-border bg-surface mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">RentalOS handles it.</h2>
          <p className="font-sans text-sm text-muted mb-12 max-w-lg">Built for exactly how car rental businesses actually work.</p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                label: 'Instant inquiry capture',
                detail: 'Customer submits dates, car, and contact details online. You get an email alert immediately. They get a confirmation with their booking reference.',
              },
              {
                label: 'One-tap confirmation',
                detail: 'Review the request in your admin panel on any device. Confirm with one click. Confirmation email sent automatically.',
              },
              {
                label: 'Full booking trail',
                detail: 'Every status change logged. Documents attached. Notes saved. The full history of every rental in one place.',
              },
            ].map(item => (
              <div key={item.label}>
                <p className="font-sans text-sm font-medium text-gray-900 mb-2">{item.label}</p>
                <p className="font-sans text-sm text-muted leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border mx-auto max-w-4xl px-6 py-20">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-8">What's included</p>
        <div className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
          {[
            ['Inquiry form', 'Embeds on any page. Collects dates, car choice, customer details.'],
            ['Email system', 'Inquiry receipt, booking confirmation, cancellation — all automated.'],
            ['Admin panel', 'Full booking management. Works on mobile. No laptop required.'],
            ['Fleet management', 'Add cars, set pricing, manage availability, upload photos.'],
            ['Transfer / delivery', 'Set delivery fees, track custom pickup addresses.'],
            ['Overlap prevention', 'Database-level constraint prevents double bookings.'],
            ['Document storage', 'Attach licence and ID photos directly to each booking.'],
            ['Vercel deploy', 'One-command deploy. Automatic HTTPS. Global edge.'],
          ].map(([feat, desc]) => (
            <div key={feat} className="flex gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-gold/60 mt-2 shrink-0" />
              <div>
                <p className="font-sans text-sm font-medium text-gray-900">{feat}</p>
                <p className="font-sans text-xs text-muted mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="border-t border-border bg-surface px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <blockquote className="font-display text-2xl font-light text-gray-700 italic mb-4">
            "A live luxury car rental business in Marbella runs entirely on RentalOS."
          </blockquote>
          <p className="font-sans text-xs text-muted">Real deployment. Real bookings. See the live system.</p>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="border-t border-border mx-auto max-w-4xl px-6 py-20">
        <p className="font-sans text-sm text-muted mb-4">From €99/month. 14-day free trial. No credit card required.</p>
        <Link href="/pricing" className="font-sans text-sm text-gold hover:underline underline-offset-4">
          See all plans →
        </Link>
      </section>

      {/* FAQ */}
      <section className="border-t border-border mx-auto max-w-4xl px-6 py-20">
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-10">Questions</h2>
        <div className="space-y-8">
          {[
            ['Does this work for any size of car rental business?', 'Yes. It works from 1 vehicle to 50+. The admin panel is designed to be used on a phone in the field.'],
            ['Can I use it without a developer?', 'If you choose the done-for-you option (€499 one-time), we handle everything. Otherwise the template requires basic technical knowledge.'],
            ['Does it replace my current booking system?', 'Yes. It replaces WhatsApp chaos, spreadsheet juggling, and expensive platforms that charge per booking.'],
            ['Is there a free trial?', '14 days, no credit card required. Or explore the live demo first.'],
          ].map(([q, a]) => (
            <div key={q} className="border-b border-border pb-8 last:border-0">
              <p className="font-sans text-sm font-medium text-gray-900 mb-2">{q}</p>
              <p className="font-sans text-sm text-muted leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-surface px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-gray-900 mb-6">Ready to automate your bookings?</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center min-h-[48px] rounded-md bg-gold px-8
                font-sans text-sm font-medium text-gray-900 hover:opacity-90 transition-opacity"
            >
              Start free trial
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center min-h-[48px] rounded-md border border-border px-8
                font-sans text-sm text-muted hover:border-gold/40 hover:text-gray-900 transition-colors"
            >
              See live demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
