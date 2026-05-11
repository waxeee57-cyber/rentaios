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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://rentaios.vercel.app'),
  title: {
    default: 'RentalOS — Rental Booking System',
    template: '%s — RentalOS',
  },
  description:
    'A complete rental booking system. Inquiry, confirm, pickup, return — all in one mobile-first admin panel. Built for car rental, yacht, villa, and motorcycle businesses.',
  keywords: [
    'rental booking system',
    'car rental booking software',
    'nextjs rental saas',
    'rental management software',
    'rental booking template',
  ],
  openGraph: {
    siteName: 'RentalOS',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80',
        width: 1200,
        height: 800,
        alt: 'RentalOS — Rental Booking System',
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
