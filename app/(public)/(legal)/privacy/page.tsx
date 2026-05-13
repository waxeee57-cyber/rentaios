import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Privacy Policy', description: 'Privacy Policy' }

export default function PrivacyPage() {
  const email = process.env.ADMIN_EMAIL ?? 'info@domrol.com'
  return (
    <>
      <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-3">Legal</p>
      <h1 className="font-display text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <div className="font-sans text-sm leading-relaxed text-muted space-y-4">
        <p>
          We are committed to protecting your privacy. Our full Privacy Policy
          is being finalised in accordance with GDPR and Spanish LSSI requirements, and will
          be published shortly.
        </p>
        <p>
          We collect only the information necessary to process your reservation. We do not
          sell or share your data with third parties.
        </p>
        <p>
          For any questions, contact us at{' '}
          <a href={`mailto:${email}`} className="text-gold hover:underline underline-offset-4">{email}</a>.
        </p>
      </div>
    </>
  )
}
