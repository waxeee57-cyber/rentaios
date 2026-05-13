import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { getBusinessConfig } from '@/lib/config'

const navEN = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/demo', label: 'Demo' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'About' },
]

const navHU = [
  { href: '/hu/pricing', label: 'Árak' },
  { href: '/demo', label: 'Bemutató' },
  { href: '/faq', label: 'GYIK' },
  { href: '/about', label: 'Rólunk' },
]

const legal = [
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/insurance', label: 'Insurance' },
  { href: '/cancellation', label: 'Cancellation' },
]

export async function Footer({ locale = 'en' }: { locale?: 'en' | 'hu' }) {
  const config = await getBusinessConfig()
  const _rawName = (process.env.NEXT_PUBLIC_BUSINESS_NAME ?? '').trim()
  const businessName = (_rawName && !_rawName.includes('http') && !_rawName.includes('.') && _rawName.length <= 30) ? _rawName : ''
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const isOwnSite = siteUrl.includes('domrol.com') || businessName === '' || businessName === 'RentalOS'
  const showPoweredBy = !isOwnSite && config.show_powered_by !== false
  const displayEmail = process.env.ADMIN_EMAIL || config.business_email
  const defaultTagline = locale === 'hu' ? 'Bérlési vállalkozásod, automatizálva.' : 'Your rental business, automated.'
  const tagline = process.env.NEXT_PUBLIC_BUSINESS_TAGLINE || defaultTagline
  const safeConfigName = (config.business_name && !config.business_name.includes('http') && !config.business_name.includes('.') && config.business_name.length <= 30) ? config.business_name : 'RentalOS'
  const nav = locale === 'hu' ? navHU : navEN

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
            <p className="text-xs font-sans uppercase tracking-[0.15em] text-gold">
              {locale === 'hu' ? 'Navigáció' : 'Navigate'}
            </p>
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
            <p className="text-xs font-sans uppercase tracking-[0.15em] text-gold">
              {locale === 'hu' ? 'Fejlesztőknek' : 'Developers'}
            </p>
            <Link href="/sell" className="text-sm font-sans text-muted hover:text-white transition-colors">
              {locale === 'hu' ? 'Forráskód →' : 'Source code →'}
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-sans uppercase tracking-[0.15em] text-gold">
              {locale === 'hu' ? 'Kapcsolat' : 'Contact'}
            </p>
            <a
              href={`mailto:${displayEmail}`}
              className="text-sm font-sans text-muted hover:text-white transition-colors"
            >
              {displayEmail}
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-sans text-muted">
              © {new Date().getFullYear()} {safeConfigName}. All rights reserved.
            </p>
            {showPoweredBy && (
              <a
                href={process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rentalos.vercel.app'}
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
