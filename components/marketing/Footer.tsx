import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { getBusinessConfig } from '@/lib/config'

const nav = [
  { href: '/fleet', label: 'Our Fleet' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
]

const legal = [
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/insurance', label: 'Insurance' },
  { href: '/cancellation', label: 'Cancellation' },
]

function isValidPhone(num: string): boolean {
  const clean = num.replace(/\D/g, '')
  return clean.length > 0 && !clean.startsWith('36')
}

export async function Footer() {
  const config = await getBusinessConfig()
  const phone = config.business_phone ?? ''
  const showPoweredBy = config.show_powered_by !== false

  return (
    <footer className="border-t border-border bg-black">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4">
            <Logo height={36} />
            <p className="max-w-xs text-xs font-sans leading-relaxed text-muted">
              {config.tagline}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-sans uppercase tracking-[0.15em] text-gold">Navigate</p>
            {nav.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-sans text-muted hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-sans uppercase tracking-[0.15em] text-gold">Contact</p>
            <a
              href={`mailto:${config.business_email}`}
              className="text-sm font-sans text-muted hover:text-white transition-colors"
            >
              {config.business_email}
            </a>
            {isValidPhone(phone) && (
              <a
                href={`tel:${phone}`}
                className="text-sm font-sans text-muted hover:text-white transition-colors"
              >
                {phone}
              </a>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-sans text-muted">
              © {new Date().getFullYear()} {config.business_name}. All rights reserved.
            </p>
            {showPoweredBy && (
              <a
                href="https://rentaios.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-sans text-muted/40 hover:text-muted/70 transition-colors mt-1 inline-block"
              >
                Powered by RentalOS
              </a>
            )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {legal.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs font-sans text-muted hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
