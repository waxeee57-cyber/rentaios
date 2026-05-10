export const revalidate = 3600

import { buildWhatsAppLink, isWhatsAppConfigured } from '@/lib/whatsapp'
import { MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'A personal, concierge luxury rental service. Every reservation confirmed personally. Every vehicle delivered to your location.',
}

export default function AboutPage() {
  const waConfigured = isWhatsAppConfigured()
  const whatsappHref = buildWhatsAppLink('Hi, I have a question about making a rental reservation.')
  return (
    <div className="min-h-screen bg-black py-24">
      <div className="mx-auto max-w-3xl px-6">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-4">About</p>
        <h1 className="font-display text-5xl font-light text-white tracking-tight mb-10">
          About us
        </h1>
        <div className="space-y-6 font-sans text-base leading-relaxed text-muted max-w-2xl">
          <p>
            We were founded to offer something the large rental companies cannot:
            a personal, unhurried experience in one of Europe's most beautiful destinations.
          </p>
          <p>
            Every reservation is confirmed personally. Every vehicle is delivered to your location.
            Every question is answered by a person, not an automated system.
          </p>
          <p>
            Our fleet is small by design. We would rather maintain a few exceptional vehicles
            perfectly than manage a large fleet poorly.
          </p>
          <p>
            If you have a question before booking, send us a message on WhatsApp. We reply
            promptly.
          </p>
        </div>

        {waConfigured && (
          <div className="mt-10">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-md bg-whatsapp px-6 py-3 font-sans text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="h-4 w-4 fill-white stroke-none" />
              Message us on WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
