import { MessageCircle } from 'lucide-react'

export default function MaintenancePage() {
  const wa = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP ?? ''

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
      <div className="space-y-6 max-w-md">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold">{process.env.NEXT_PUBLIC_BUSINESS_NAME ?? 'RentalOS'}</p>
        <h1 className="font-display text-5xl font-light text-white tracking-tight">
          We'll be back shortly
        </h1>
        <p className="font-sans text-sm leading-relaxed text-muted">
          The site is currently undergoing scheduled maintenance.
          For urgent enquiries, please reach us on WhatsApp.
        </p>
        {wa && (
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-whatsapp px-8 py-4 text-sm font-sans font-medium uppercase tracking-widest text-white hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="h-4 w-4 fill-white stroke-none" />
            WhatsApp Us
          </a>
        )}
      </div>
    </div>
  )
}
