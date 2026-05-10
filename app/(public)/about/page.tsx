export const revalidate = 3600

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About — RentalOS',
  description: 'RentalOS is a complete booking system built for rental businesses. Car, yacht, villa, motorcycle — any fleet, any market.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'}/about`,
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black py-24">
      <div className="mx-auto max-w-3xl px-6">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-4">About</p>
        <h1 className="font-display text-5xl font-light text-white tracking-tight mb-10">
          Built for rental businesses
        </h1>
        <div className="space-y-6 font-sans text-base leading-relaxed text-muted max-w-2xl">
          <p>
            RentalOS started as a booking system for a single car rental company on the
            Costa del Sol. It handled every booking from first inquiry to return. The
            owner managed it entirely from a phone.
          </p>
          <p>
            We built the parts that rental businesses always struggle with: preventing
            double bookings, capturing every inquiry, sending professional confirmations,
            and tracking documents and deposits — all in one place.
          </p>
          <p>
            The same system is now available to any rental business. Car rental, yacht
            charter, villa rental, motorcycle hire. One admin panel. One booking flow.
            Your branding throughout.
          </p>
          <p>
            You can deploy it yourself in a few hours, or we handle everything for you
            within 48 hours. Either way, you get the same system.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/demo"
            className="inline-flex items-center justify-center rounded-sm bg-gold px-6 py-3 font-sans text-sm font-medium text-black hover:opacity-90 transition-opacity"
          >
            See it in action
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-sm border border-border px-6 py-3 font-sans text-sm text-muted hover:border-gold/40 hover:text-white transition-colors"
          >
            View pricing
          </Link>
        </div>
      </div>
    </div>
  )
}
