import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Cancellation Policy',
  description: 'Cancellation policy. To cancel or modify your reservation, contact us directly via WhatsApp or email as early as possible.',
}

export default function CancellationPage() {
  return (
    <>
      <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-3">Legal</p>
      <h1 className="font-display text-4xl font-light text-white mb-8">Cancellation Policy</h1>
      <div className="font-sans text-sm leading-relaxed text-muted space-y-4">
        <p>
          Our cancellation policy is communicated and agreed at the time of booking confirmation.
          To cancel or modify a reservation, please contact us directly via WhatsApp or email
          as early as possible.
        </p>
      </div>
    </>
  )
}
