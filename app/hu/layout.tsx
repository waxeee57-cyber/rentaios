import type { Metadata } from 'next'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { CookieBanner } from '@/components/brand/CookieBanner'
import { ExitIntentModal } from '@/components/ExitIntentModal'

export const metadata: Metadata = {
  title: {
    default: 'RentalOS — Bérlési Foglalórendszer',
    template: '%s — RentalOS',
  },
  description:
    'Teljes bérlési foglalórendszer autó-, jacht-, villa- és motorbérlő vállalkozásoknak. Havi 29 000 Ft-tól.',
  openGraph: {
    siteName: 'RentalOS',
    locale: 'hu_HU',
    type: 'website',
  },
  alternates: {
    canonical: '/hu',
    languages: { en: '/' },
  },
}

export default function HuLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-nav">Ugrás a tartalomra</a>
      <Header />
      <main id="main-content" className="flex-1 pt-16 animate-page-enter">{children}</main>
      <Footer />
      <ChatWidget />
      <CookieBanner />
      <ExitIntentModal />
    </>
  )
}
