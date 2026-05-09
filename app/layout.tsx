// rebuilt 2026-05-09
import type { Metadata } from 'next'
import { DM_Sans, Cormorant_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'),
  title: {
    default: 'RentalOS — Luxury Rental Booking System',
    template: '%s — RentalOS',
  },
  description:
    'A complete luxury rental booking system. Inquiry, confirm, pickup, return — all in one mobile-first admin panel. Built for car rental, yacht, villa, and motorcycle businesses.',
  keywords: [
    'luxury rental booking system',
    'car rental booking software',
    'nextjs rental saas',
    'luxury rental management',
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
        alt: 'RentalOS — Luxury Rental Booking System',
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
    <html lang="en" className={`${dmSans.variable} ${cormorant.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
