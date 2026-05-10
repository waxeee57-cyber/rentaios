import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Setup request received — RentalOS',
  description: 'Your setup request has been received. Expect your system within 48 hours.',
  robots: { index: false },
}

export default function OnboardingThankYouPage() {
  return (
    <div className="min-h-screen bg-[#0F0F10] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <p className="font-sans text-xs uppercase tracking-[0.3em] text-gold mb-10">RentalOS</p>

        <div className="w-12 h-px bg-gold/40 mx-auto mb-10" />

        <h1 className="font-display text-4xl font-light text-white mb-6 tracking-tight">
          We have everything we need.
        </h1>

        <p className="font-sans text-sm leading-relaxed text-white/50 mb-4">
          Expect your system to be live within 48 hours.
        </p>
        <p className="font-sans text-sm leading-relaxed text-white/50 mb-12">
          Check your email for a confirmation with your reference number.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 font-sans text-sm text-gold hover:underline underline-offset-4"
        >
          Return to homepage
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  )
}
