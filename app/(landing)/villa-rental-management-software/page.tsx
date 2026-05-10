import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Villa Rental Management Software — RentalOS',
  description: 'Manage villa rental bookings without the spreadsheet. Inquiry form, guest confirmations, admin panel. Deploy in one day. From €99/month.',
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'}/villa-rental-management-software` },
  openGraph: {
    title: 'Villa Rental Management Software — RentalOS',
    description: 'Holiday rental software for villa and vacation rental businesses. Full booking workflow, admin panel, email system.',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'RentalOS — Villa Rental',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '99', priceCurrency: 'EUR', priceSpecification: { priceType: 'monthly' } },
  description: 'Villa rental management software with inquiry form, guest confirmations, and admin panel.',
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'}/villa-rental-management-software`,
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can I manage multiple villa properties?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Add as many properties as you manage. Each has its own pricing, availability, and photo gallery.' },
    },
    {
      '@type': 'Question',
      name: 'Does it replace Airbnb or Booking.com?',
      acceptedAnswer: { '@type': 'Answer', text: 'It is designed for direct bookings — customers who contact you directly or come via your own website or Instagram. You own the relationship and pay no commission.' },
    },
    {
      '@type': 'Question',
      name: 'How do guests submit a booking request?',
      acceptedAnswer: { '@type': 'Answer', text: 'Via the inquiry form on your website. They choose dates, property, and submit their details. You confirm personally — keeping the high-touch luxury experience intact.' },
    },
    {
      '@type': 'Question',
      name: 'Is there a free trial?',
      acceptedAnswer: { '@type': 'Answer', text: '14 days, no credit card required. Or explore the live demo first.' },
    },
  ],
}

export default function VillaRentalManagementSoftwarePage() {
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
      <div className="mx-auto max-w-4xl px-6 pt-10 pb-2">
        <nav className="font-sans text-xs text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/sell" className="hover:text-white transition-colors">Software</Link>
          <span className="mx-2">›</span>
          <span className="text-white/60">Villa rental management software</span>
        </nav>
      </div>

      <section className="mx-auto max-w-4xl px-6 pt-16 pb-20">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-4">Villa rental software</p>
        <h1 className="font-display text-5xl font-light tracking-tight text-white mb-6 max-w-2xl">
          Your villas deserve better than a spreadsheet.
        </h1>
        <p className="font-sans text-base text-muted leading-relaxed max-w-xl mb-10">
          RentalOS is a complete booking system for independent villa and holiday rental businesses.
          Direct bookings, zero commission, full control.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="#how-it-works" className="inline-flex items-center gap-2 min-h-[48px] rounded-md bg-gold px-8 font-sans text-sm font-medium text-black hover:opacity-90 transition-opacity">
            See how it works
          </Link>
          <Link href="/demo" className="inline-flex items-center gap-2 min-h-[48px] rounded-md border border-white/20 px-8 font-sans text-sm text-white hover:border-gold/40 transition-colors">
            Explore live demo
          </Link>
        </div>
      </section>

      <section className="border-t border-white/5 mx-auto max-w-4xl px-6 py-20">
        <h2 className="font-display text-3xl font-light text-white mb-12">Sound familiar?</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            { number: '01', pain: 'Availability chaos across multiple properties', detail: 'Villa A booked on WhatsApp. Villa B on email. No single view. A double-booking waiting to happen.' },
            { number: '02', pain: 'Commission fees eating your margin', detail: 'Airbnb at 15%. Booking.com at 18%. For luxury villas at €3,000/week that is a significant number to pay away.' },
            { number: '03', pain: 'Guest admin that takes hours every booking', detail: 'Contract, check-in instructions, deposit, key handover, check-out. All managed manually, all on WhatsApp.' },
          ].map(item => (
            <div key={item.number}>
              <p className="font-sans text-xs text-gold/60 mb-3">{item.number}</p>
              <p className="font-sans text-sm font-medium text-white mb-2">{item.pain}</p>
              <p className="font-sans text-sm text-muted leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="border-t border-white/5 bg-white/[0.02] px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-light text-white mb-4">RentalOS handles it.</h2>
          <p className="font-sans text-sm text-muted mb-12 max-w-lg">Direct bookings. No commission. Your data.</p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { label: 'Direct inquiry capture', detail: 'Guests request dates on your website. No OTA, no algorithm, no commission. You confirm personally.' },
              { label: 'Availability at a glance', detail: 'All confirmed bookings block the calendar automatically. See exactly what is free across all properties.' },
              { label: 'Guest communication', detail: 'Automatic confirmation email with check-in details. Cancellation handled. All in your brand.' },
            ].map(item => (
              <div key={item.label}>
                <p className="font-sans text-sm font-medium text-white mb-2">{item.label}</p>
                <p className="font-sans text-sm text-muted leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 mx-auto max-w-4xl px-6 py-20">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-8">Built for villa managers</p>
        <div className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
          {[
            ['Multi-property support', 'Manage all your villas from one admin panel.'],
            ['Inquiry form', 'Embeds on your site. Collects dates, guest count, contact details.'],
            ['Email confirmations', 'Professional, branded emails go out automatically.'],
            ['Document storage', 'Attach contracts and IDs directly to each booking record.'],
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

      <section className="border-t border-white/5 bg-white/[0.02] px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <blockquote className="font-display text-2xl font-light text-white/80 italic mb-4">
            "A live luxury rental business on the Costa del Sol runs entirely on RentalOS."
          </blockquote>
          <p className="font-sans text-xs text-muted">Same system, adapted for villa management. Explore the live demo.</p>
        </div>
      </section>

      <section className="border-t border-white/5 mx-auto max-w-4xl px-6 py-20">
        <p className="font-sans text-sm text-muted mb-4">From €99/month. 14-day free trial. No credit card required.</p>
        <Link href="/pricing" className="font-sans text-sm text-gold hover:underline underline-offset-4">See all plans →</Link>
      </section>

      <section className="border-t border-white/5 mx-auto max-w-4xl px-6 py-20">
        <h2 className="font-display text-3xl font-light text-white mb-10">Questions</h2>
        <div className="space-y-8">
          {[
            ['Can I manage multiple villa properties?', 'Yes. Add as many as you manage. Each has its own pricing, availability, and photo gallery.'],
            ['Does it replace Airbnb or Booking.com?', 'It handles direct bookings — guests who come via your website or Instagram. You own the relationship and pay no commission.'],
            ['How do guests submit a request?', 'Via the inquiry form. They choose dates and submit their details. You confirm personally, keeping the high-touch experience.'],
            ['Is there a free trial?', '14 days, no credit card required. Or explore the live demo first.'],
          ].map(([q, a]) => (
            <div key={q} className="border-b border-white/5 pb-8 last:border-0">
              <p className="font-sans text-sm font-medium text-white mb-2">{q}</p>
              <p className="font-sans text-sm text-muted leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/5 bg-white/[0.02] px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-4xl font-light text-white mb-6">Ready to automate your bookings?</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/pricing" className="inline-flex items-center min-h-[48px] rounded-md bg-gold px-8 font-sans text-sm font-medium text-black hover:opacity-90 transition-opacity">Start free trial</Link>
            <Link href="/demo" className="inline-flex items-center min-h-[48px] rounded-md border border-white/20 px-8 font-sans text-sm text-white hover:border-gold/40 transition-colors">See live demo</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
