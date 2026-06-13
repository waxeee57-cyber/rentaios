import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { getBusinessConfig } from '@/lib/config'

const nav = [
  { href: '/fleet', label: 'Autóink' },
]

const legal = [
  { href: '/terms', label: 'ÁSZF' },
  { href: '/privacy', label: 'Adatkezelés' },
  { href: '/cookies', label: 'Sütik' },
  { href: '/insurance', label: 'Biztosítás' },
  { href: '/cancellation', label: 'Lemondás' },
]

export async function Footer() {
  const config = await getBusinessConfig()
  const _rawName = (process.env.NEXT_PUBLIC_BUSINESS_NAME ?? '').trim()
  const businessName = (_rawName && !_rawName.includes('http') && !_rawName.includes('.') && _rawName.length <= 30) ? _rawName : ''
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const isOwnSite = siteUrl.includes('domrol.com') || businessName === '' || businessName === 'RentalOS'
  const showPoweredBy = !isOwnSite && config.show_powered_by !== false
  const displayEmail = process.env.ADMIN_EMAIL || config.business_email
  const tagline = process.env.NEXT_PUBLIC_BUSINESS_TAGLINE || config.tagline || 'Megbízható autóbérlés.'
  const safeConfigName = (config.business_name && !config.business_name.includes('http') && !config.business_name.includes('.') && config.business_name.length <= 30) ? config.business_name : 'RentalOS'

  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4">
            <Logo dark />
            <p className="max-w-xs text-xs font-sans leading-relaxed text-muted">
              {tagline}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-sans uppercase tracking-[0.15em] text-gold">Menü</p>
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
            <p className="text-xs font-sans uppercase tracking-[0.15em] text-gold">Kapcsolat</p>
            <a
              href={`mailto:${displayEmail}`}
              className="text-sm font-sans text-muted hover:text-white transition-colors"
            >
              {displayEmail}
            </a>
            {config.business_phone && (
              <a
                href={`tel:${config.business_phone.replace(/\s/g, '')}`}
                className="text-sm font-sans text-muted hover:text-white transition-colors"
              >
                {config.business_phone}
              </a>
            )}
            {config.business_address && (
              <p className="max-w-xs text-sm font-sans text-muted">{config.business_address}</p>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-sans text-muted">
              © {new Date().getFullYear()} {safeConfigName}. Minden jog fenntartva.
            </p>
            {showPoweredBy && (
              <a
                href={process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rentaios.vercel.app'}
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
