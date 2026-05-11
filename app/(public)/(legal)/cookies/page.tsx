import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'We use only essential cookies required for basic functionality. No advertising or tracking cookies.',
}

export default function CookiesPage() {
  const email = process.env.ADMIN_EMAIL ?? 'hello@domrol.com'
  return (
    <>
      <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-3">Legal</p>
      <h1 className="font-display text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
      <div className="font-sans text-sm leading-relaxed text-muted space-y-4">
        <p>
          This site uses only essential cookies required for basic functionality. We do not
          use advertising or tracking cookies.
        </p>
        <p>
          For questions, contact us at{' '}
          <a href={`mailto:${email}`} className="text-gold hover:underline underline-offset-4">{email}</a>.
        </p>
      </div>
    </>
  )
}
