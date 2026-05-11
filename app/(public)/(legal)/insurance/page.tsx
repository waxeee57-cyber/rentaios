import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Insurance Policy',
  description: 'All vehicles are covered by comprehensive insurance. Insurance details are confirmed at booking.',
}

export default function InsurancePage() {
  return (
    <>
      <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-3">Legal</p>
      <h1 className="font-display text-4xl font-bold text-gray-900 mb-8">Insurance Policy</h1>
      <div className="font-sans text-sm leading-relaxed text-muted space-y-4">
        <p>
          All vehicles are covered by comprehensive insurance valid throughout Spain. Full
          insurance details are provided at the time of booking confirmation.
        </p>
        <p>
          For specific questions about coverage, contact us directly.
        </p>
      </div>
    </>
  )
}
