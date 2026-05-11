export const revalidate = 3600

import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About',
  description: 'RentalOS started as a booking system for a single car rental business on the Costa del Sol. Built by two people who would want this themselves.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'}/about`,
  },
}

const WA_HREF = 'https://wa.me/36708564381?text=Hi%2C%20I%27d%20like%20to%20learn%20more%20about%20RentalOS'
const CONTACT_EMAIL = process.env.ADMIN_EMAIL ?? 'hello@domrol.com'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-6">About</p>
          <h1 className="font-display text-5xl font-bold text-gray-900 tracking-tight leading-tight md:text-6xl max-w-3xl">
            Built by two people who&apos;d want this themselves.
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 border-t border-border">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-start">
            <div className="space-y-6 font-sans text-base leading-relaxed text-muted">
              <p>
                RentalOS started with a single car rental business on the Costa del Sol.
                The owner was managing every booking on WhatsApp, storing availability in a
                spreadsheet, and writing confirmation messages by hand.
              </p>
              <p>
                It worked — until it didn&apos;t. A double booking at pickup. A midnight
                inquiry that sat unseen until morning. A customer who expected a professional
                system and got a voice note instead.
              </p>
              <p>
                We built the system we would want if we were running that business. Not a
                generic platform that covers every industry and excels at none. A booking
                system designed specifically for how rental businesses operate — the inquiry
                flow, the handover documents, the deposit tracking, the weekly report.
              </p>
              <p>
                The same system is now available to any rental business. Car rental, yacht
                charter, villa rental, motorcycle hire. Deploy it yourself in a few hours,
                or let us handle everything in 48 hours.
              </p>
              <a
                href="https://drivecostasol.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-sans text-sm text-gold hover:underline underline-offset-4"
              >
                See the reference deployment — drivecostasol.com <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Photo placeholder */}
            <div className="rounded-lg bg-surface border border-border overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <div className="w-full h-full flex items-center justify-center min-h-[260px]">
                <div className="text-center px-6">
                  <p className="font-sans text-xs text-muted/30 uppercase tracking-[0.2em]">Team photo</p>
                  <p className="font-sans text-xs text-muted/20 mt-1">Costa del Sol, Spain</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact strip */}
      <section className="py-10 border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-sans text-sm text-muted">
              Questions about the product, licensing, or a custom build?
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-sans text-sm text-muted hover:text-gray-900 transition-colors"
              >
                {CONTACT_EMAIL}
              </a>
              <span className="hidden sm:block text-muted/30">·</span>
              <a
                href={WA_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-sm text-muted hover:text-gold transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 border-t border-border">
        <div className="mx-auto max-w-5xl px-6">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-10">How we work</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                title: 'Opinionated by design',
                body: "We made choices so you don't have to. The booking flow, the confirmation emails, the admin panel — built the way rental businesses actually operate.",
              },
              {
                title: 'You own everything',
                body: 'Your code. Your data. Your domain. If we disappeared tomorrow, your system would run unchanged. We built it this way deliberately.',
              },
              {
                title: 'Small team, personal support',
                body: "When you email us, a person who wrote every line of this code replies. We have never had a customer who couldn't get live.",
              },
            ].map(({ title, body }) => (
              <div key={title} className="flex flex-col gap-4 rounded-lg border border-border bg-white p-6 shadow-sm">
                <h3 className="font-sans text-sm font-medium text-gray-900">{title}</h3>
                <p className="font-sans text-sm leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAs */}
      <section className="py-16 border-t border-border">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/demo/fleet"
              className="inline-flex items-center justify-center rounded-md bg-gold px-6 py-3 font-sans text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              See it in action →
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 font-sans text-sm text-muted hover:border-gold/40 hover:text-gray-900 transition-colors"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
