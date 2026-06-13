import type { Metadata } from 'next'
import { Bricolage_Grotesque, Onest } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
})

const onest = Onest({
  subsets: ['latin'],
  variable: '--font-onest',
  display: 'swap',
})

const _bn = (process.env.NEXT_PUBLIC_BUSINESS_NAME ?? '').trim()
const BRAND = _bn && !_bn.includes('http') && _bn.length <= 40 ? _bn : 'RentalOS'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://rentaios.vercel.app'),
  title: {
    default: BRAND,
    template: `%s — ${BRAND}`,
  },
  description:
    process.env.NEXT_PUBLIC_BUSINESS_TAGLINE ||
    'Online autóbérlés gyors visszaigazolással.',
  keywords: [
    'autóbérlés',
    'autókölcsönző',
    'autóbérlés Szeged',
    'online foglalás',
  ],
  openGraph: {
    siteName: BRAND,
    locale: 'hu_HU',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80',
        width: 1200,
        height: 800,
        alt: BRAND,
      },
    ],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${onest.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
