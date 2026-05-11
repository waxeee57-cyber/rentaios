import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Terms & Conditions', description: 'Terms and Conditions' }

export default function TermsPage() {
  const email = process.env.ADMIN_EMAIL ?? 'hello@domrol.com'
  return (
    <>
      <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-3">Legal</p>
      <h1 className="font-display text-4xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
      <div className="font-sans text-sm leading-relaxed text-muted space-y-4">
        <p>
          Our full Terms and Conditions are being finalised and will be published shortly.
          For any questions, please contact us directly at{' '}
          <a href={`mailto:${email}`} className="text-gold hover:underline underline-offset-4">{email}</a>
          {' '}or via WhatsApp.
        </p>
      </div>
    </>
  )
}
