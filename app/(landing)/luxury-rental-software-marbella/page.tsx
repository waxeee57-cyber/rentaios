import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Car Rental Software Marbella — RentalOS',
  description: 'Luxury car rental software built and deployed in Marbella. The booking system powering Costa del Sol rental businesses. Available for any luxury rental operation.',
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'}/luxury-rental-software-marbella` },
  openGraph: {
    title: 'Car Rental Software Marbella — RentalOS',
    description: 'Luxury rental booking system, Costa del Sol. Live at a Marbella car rental business. Available for your operation.',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'RentalOS — Marbella',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '99', priceCurrency: 'EUR', priceSpecification: { priceType: 'monthly' } },
  description: 'Luxury rental booking software used by car rental businesses on the Costa del Sol.',
  url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'}/luxury-rental-software-marbella`,
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is RentalOS used by real businesses in Marbella?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. RentalOS is live at a luxury car rental business operating in Marbella and along the Costa del Sol.' },
    },
    {
      '@type': 'Question',
      name: 'Can you deploy this for my Marbella rental business?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. The done-for-you setup service (€499 one-time) deploys and configures everything for you within 48 hours.' },
    },
    {
      '@type': 'Question',
      name: 'Does it support multiple pickup locations across the Costa del Sol?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. You can list as many pickup locations as you offer. Delivery to custom addresses is also supported.' },
    },
    {
      '@type': 'Question',
      name: 'What languages does the booking system support?',
      acceptedAnswer: { '@type': 'Answer', text: 'The interface can be configured in English, Spanish, French, German, or Italian.' },
    },
  ],
}

export default function LuxuryRentalSoftwareMarbella() {
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
          <span className="text-white/60">Luxury rental software Marbella</span>
        </nav>
      </div>

      <section className="mx-auto max-w-4xl px-6 pt-16 pb-20">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-4">Built in Marbella</p>
        <h1 className="font-display text-5xl font-light tracking-tight text-white mb-6 max-w-2xl">
          The booking system behind Costa del Sol luxury rentals.
        </h1>
        <p className="font-sans text-base text-muted leading-relaxed max-w-xl mb-10">
          RentalOS was built for a luxury car rental business in Marbella. Now available for any
          rental operation on the Costa del Sol and beyond.
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
            { number: '01', pain: 'Bookings arriving in three different languages', detail: 'English, Spanish, German. Each customer needs different follow-up. Managing this manually across WhatsApp threads is exhausting.' },
            { number: '02', pain: 'Seasonal spikes overwhelming your process', detail: 'June to September is chaos. Every system you have breaks under volume. You need something that scales without adding admin hours.' },
            { number: '03', pain: 'No way to track your fleet across Marbella and beyond', detail: 'Car in Puerto Banús. Client in Málaga Airport. Delivery back via Estepona. No single view of where everything is.' },
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
          <p className="font-sans text-sm text-muted mb-12 max-w-lg">Proven in Marbella. Deployable anywhere.</p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { label: 'Multi-location pickup', detail: 'List every location you serve. Customers choose at booking. You see the pickup point in the admin immediately.' },
              { label: 'Delivery fee management', detail: 'Customers can request delivery to any address — airport, hotel, marina. You set the fee before confirming.' },
              { label: 'Seasonal scale', detail: 'The same system that handles 5 bookings a month handles 50. No extra setup, no extra cost.' },
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
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-8">Designed for the Costa del Sol</p>
        <div className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
          {[
            ['Multi-location pickup', 'Marbella, Puerto Banús, Málaga Airport — list them all.'],
            ['Delivery to custom address', 'Hotel, villa, marina. Any address, any distance.'],
            ['EU GDPR compliant', 'Data stored in EU Supabase region. Privacy policy included.'],
            ['Mobile-first admin', 'Manage bookings from your phone anywhere on the coast.'],
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
            "A live Marbella luxury car rental business runs entirely on RentalOS."
          </blockquote>
          <p className="font-sans text-xs text-muted">Real deployment. Costa del Sol. Running since 2024.</p>
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
            ['Is RentalOS used by real businesses in Marbella?', 'Yes. It is live at a luxury car rental business operating in Marbella and along the Costa del Sol.'],
            ['Can you deploy this for my business?', 'Yes. The done-for-you setup (€499 one-time) deploys and configures everything within 48 hours.'],
            ['Does it support multiple pickup locations across the Costa del Sol?', 'Yes. List as many locations as you serve. Delivery to custom addresses is also supported.'],
            ['What languages are supported?', 'English, Spanish, French, German, Italian — configurable per deployment.'],
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
