import { MapPin, Mail } from 'lucide-react'
import { CodeEmailLookup } from '@/components/booking/CodeEmailLookup'
import { isWhatsAppConfigured } from '@/lib/whatsapp'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact & Pickup Locations',
  description: 'Contact us for luxury rental enquiries. Email or message on WhatsApp. Delivery available to multiple locations.',
}

const PICKUP_LOCATIONS = [
  { name: 'Marbella', note: 'Delivery available — contact us' },
  { name: 'Puerto Banús', note: 'Delivery available — contact us' },
  { name: 'Málaga Airport', note: 'Delivery available — contact us' },
  { name: 'Estepona', note: 'Delivery available — contact us' },
  { name: 'Alicante', note: 'Delivery available — contact us' },
  { name: 'Almeria', note: 'Delivery available — contact us' },
  { name: 'San Juan de los Terreros', note: 'Free delivery within 25 km' },
]

export default function ContactPage() {
  const email = process.env.ADMIN_EMAIL ?? 'hello@rentaios.com'
  const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? ''
  const waConfigured = isWhatsAppConfigured()

  return (
    <div className="min-h-screen bg-black py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-16">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-3">Contact</p>
          <h1 className="font-display text-5xl font-light text-white tracking-tight">Get in touch</h1>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="space-y-10">
            {/* Contact details */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Mail className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-muted mb-1">Email</p>
                  <a href={`mailto:${email}`} className="font-sans text-sm text-white hover:text-gold transition-colors">
                    {email}
                  </a>
                  <p className="font-sans text-xs text-muted mt-1">We reply within 2 hours during business hours (9:00–20:00 CET).</p>
                </div>
              </div>

              {waConfigured && (
                <div className="flex items-start gap-4">
                  <div className="h-5 w-5 shrink-0 mt-0.5 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-whatsapp" />
                  </div>
                  <div>
                    <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-muted mb-2">WhatsApp</p>
                    <a
                      href={`https://wa.me/${process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP ?? ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 h-12 rounded-md bg-whatsapp px-6 text-sm font-sans font-medium text-white hover:opacity-90 transition-opacity"
                    >
                      Message us on WhatsApp
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Pickup locations */}
            <div>
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-4">Pickup locations</p>
              <div className="space-y-3">
                {PICKUP_LOCATIONS.map(({ name, note }) => (
                  <div key={name} className="flex items-center gap-3">
                    <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
                    <div>
                      <span className="font-sans text-sm text-white">{name}</span>
                      <span className="font-sans text-xs text-muted ml-2">— {note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lookup form */}
          <CodeEmailLookup title="Look up your reservation" />
        </div>
      </div>
    </div>
  )
}
