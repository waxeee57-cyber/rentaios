import { Mail } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact — RentalOS',
  description: 'Get in touch with the RentalOS team. Questions about setup, pricing, or the done-for-you service.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'}/contact`,
  },
}

export default function ContactPage() {
  const email = process.env.ADMIN_EMAIL ?? 'hello@rentaios.com'

  return (
    <div className="min-h-screen bg-black py-24">
      <div className="mx-auto max-w-3xl px-6">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-4">Contact</p>
        <h1 className="font-display text-5xl font-light text-white tracking-tight mb-10">
          Get in touch
        </h1>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="space-y-8">
            {/* Email */}
            <div className="flex items-start gap-4">
              <Mail className="h-5 w-5 text-gold mt-0.5 shrink-0" />
              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-muted mb-1">Email</p>
                <a
                  href={`mailto:${email}`}
                  className="font-sans text-sm text-white hover:text-gold transition-colors"
                >
                  {email}
                </a>
                <p className="font-sans text-xs text-muted mt-1">
                  We reply within 2 hours during business hours (09:00–20:00 CET).
                </p>
              </div>
            </div>

            {/* What we can help with */}
            <div>
              <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-gold mb-4">
                What we can help with
              </p>
              <ul className="space-y-2.5">
                {[
                  'Questions about the template or self-hosted setup',
                  'Done-for-you service enquiries',
                  'Subscription and billing',
                  'Feature requests',
                  'Technical support',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold/40" />
                    <span className="font-sans text-sm text-muted">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-gold mb-4">
              Before you write
            </p>
            <div className="space-y-3">
              {[
                { label: 'Read the FAQ', href: '/faq', note: 'Most questions answered here' },
                { label: 'See the demo', href: '/demo', note: 'Live system, no signup required' },
                { label: 'View pricing', href: '/pricing', note: 'Plans from €49/month' },
                { label: 'Done-for-you setup', href: '/onboarding', note: '€499 — ready in 48 hours' },
              ].map(({ label, href, note }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col gap-0.5 rounded-sm border border-border bg-graphite/30 p-4 hover:border-gold/30 transition-colors"
                >
                  <span className="font-sans text-sm font-medium text-white">{label}</span>
                  <span className="font-sans text-xs text-muted">{note}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
