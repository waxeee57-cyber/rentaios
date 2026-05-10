export const revalidate = 60

import type { Metadata } from 'next'
import type { CSSProperties } from 'react'

export const metadata: Metadata = {
  title: 'Luxury Car Rental',
  description: 'Luxury car rental. Hotel delivery, personally confirmed reservations, comprehensive insurance included.',
}

import Image from 'next/image'
import { supabaseAdmin } from '@/lib/supabase'
import { HeroSearch } from '@/components/marketing/HeroSearch'
import { CarCard } from '@/components/marketing/CarCard'
import { TrustStrip } from '@/components/marketing/TrustStrip'
import { FAQ } from '@/components/marketing/FAQ'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

async function getAvailableCars() {
  const { data } = await supabaseAdmin
    .from('cars')
    .select('slug, brand, model, year, category, daily_price_eur, transmission, fuel, seats, photos')
    .eq('status', 'available')

  return data ?? []
}

async function getAvailableCarCount() {
  const { count } = await supabaseAdmin
    .from('cars')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'available')
  return count ?? 0
}

export default async function HomePage() {
  const [cars, count] = await Promise.all([getAvailableCars(), getAvailableCarCount()])

  const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? ''

  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? 'RentalOS'
  const businessEmail = process.env.ADMIN_EMAIL ?? 'hello@rentaios.com'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'

  const carRentalSchema = {
    '@context': 'https://schema.org',
    '@type': 'CarRental',
    name: businessName,
    description: 'Luxury vehicle rental. Concierge service with hotel delivery.',
    url: siteUrl,
    ...(phone && { telephone: phone }),
    email: businessEmail,
    areaServed: 'Available in multiple locations.',
    priceRange: '€€€',
    currenciesAccepted: 'EUR',
    paymentAccepted: 'Cash, Credit Card',
    openingHours: 'Mo-Su 09:00-20:00',
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does the booking process work?',
        acceptedAnswer: { '@type': 'Answer', text: 'Submit a request through the site or WhatsApp. We confirm personally, usually within the hour during business hours. We deliver the car to your hotel — payment and documents at pickup.' },
      },
      {
        '@type': 'Question',
        name: 'When and how do I pay?',
        acceptedAnswer: { '@type': 'Answer', text: 'Payment is made in person at pickup by card or bank transfer. We do not charge your card online. A refundable deposit is also held at pickup and returned when the car comes back in good condition.' },
      },
      {
        '@type': 'Question',
        name: 'Is a deposit required?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. A refundable security deposit is held at pickup. The amount depends on the vehicle. It is returned in full on the same day the car is returned undamaged.' },
      },
      {
        '@type': 'Question',
        name: 'What is included in the daily rate?',
        acceptedAnswer: { '@type': 'Answer', text: 'Comprehensive insurance, unlimited mileage within Spain, 24/7 roadside assistance, and delivery and collection within 25km of San Juan de los Terreros. Nothing hidden.' },
      },
      {
        '@type': 'Question',
        name: 'What are the age and license requirements?',
        acceptedAnswer: { '@type': 'Answer', text: 'Drivers must be at least 25 years old and hold a full driving licence issued at least 2 years ago. International licences are accepted.' },
      },
      {
        '@type': 'Question',
        name: 'What is the cancellation policy?',
        acceptedAnswer: { '@type': 'Answer', text: 'Cancellations must be made by contacting us directly via WhatsApp or email. Our cancellation policy is communicated at the time of booking confirmation.' },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(carRentalSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=2400&q=80"
            alt="Luxury sports car on the Costa del Sol"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/55" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
          {/* Live fleet badge */}
          <div className="flex items-center gap-2.5 rounded-full border border-border bg-black/60 px-4 py-2 backdrop-blur-sm">
            <span className="animate-pulse-dot h-2 w-2 rounded-full bg-gold" />
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-muted">
              Live availability
            </span>
          </div>

          {/* Tagline */}
          <h1 className="font-display text-5xl font-light leading-tight tracking-[-0.02em] text-white md:text-7xl lg:text-8xl lg:leading-[1.05]">
            The Coast,<br />Driven Beautifully
          </h1>

          <p className="max-w-md font-sans text-base leading-relaxed text-muted">
            Luxury car rental along the Costa del Sol. Every reservation
            personally confirmed. Every car delivered to your door.
          </p>

          {/* HeroSearch */}
          <div className="w-full max-w-3xl">
            <HeroSearch />
          </div>

          {/* Stats strip */}
          <div className="flex items-center gap-6 border-t border-border pt-6 text-center md:gap-12">
            <div>
              <p className="font-sans text-2xl font-medium text-gold">{count}</p>
              <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mt-0.5">Vehicles</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="font-sans text-sm uppercase tracking-[0.15em] text-muted">Concierge Service</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="font-sans text-sm uppercase tracking-[0.15em] text-muted">Hotel Delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <TrustStrip />

      {/* Featured fleet */}
      <section className="py-24 md:py-32 bg-black">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-3">The Fleet</p>
              <h2 className="font-display text-4xl font-light text-white tracking-tight md:text-5xl">
                Selected cars
              </h2>
            </div>
            <Link
              href="/fleet"
              className="hidden items-center gap-2 font-sans text-xs uppercase tracking-[0.15em] text-muted hover:text-white transition-colors md:flex"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className={`grid grid-cols-1 gap-6 ${cars.length === 3 ? 'md:grid-cols-3' : cars.length === 1 ? 'md:grid-cols-1' : 'md:grid-cols-2'}`}>
            {cars.map((car, index) => (
              <CarCard key={car.slug} car={car} priority={index === 0} />
            ))}
          </div>

          <div className="mt-8 flex md:hidden">
            <Link
              href="/fleet"
              className="font-sans text-xs uppercase tracking-[0.15em] text-muted hover:text-white transition-colors"
            >
              View all cars →
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 md:py-32 bg-graphite">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-3">The Process</p>
            <h2 className="font-display text-4xl font-light text-white tracking-tight md:text-5xl">
              How it works
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {[
              { step: '01', title: 'Browse', desc: 'Explore the fleet. Select dates and location. No account needed.' },
              { step: '02', title: 'Request', desc: 'Submit your inquiry through the site or WhatsApp. It takes just a couple of minutes.' },
              { step: '03', title: 'Personal confirmation', desc: 'We confirm personally, usually within the hour during business hours. You will always hear from us before your pickup.' },
              { step: '04', title: 'Drive', desc: 'We deliver the car to your hotel. Payment and paperwork at pickup.' },
            ].map(({ step, title, desc }, index) => (
              <div key={step} className="flex flex-col gap-4">
                <span
                  className="font-sans text-sm font-medium text-gold step-reveal"
                  style={{ '--step-index': index } as unknown as CSSProperties}
                >{step}</span>
                <h3 className="font-display text-2xl font-medium text-white">{title}</h3>
                <p className="font-sans text-sm leading-relaxed text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />
    </>
  )
}
