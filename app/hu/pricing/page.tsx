import type { Metadata } from 'next'
import { HuPricingClient } from './HuPricingClient'

export const metadata: Metadata = {
  title: 'Árak',
  description:
    'Egyszerű, átlátható árazás bérlési vállalkozásoknak. 14 napos ingyenes próba, bankkártya nélkül. Havi 29 000 Ft-tól.',
  alternates: {
    canonical: '/hu/pricing',
    languages: { en: '/pricing' },
  },
}

export default function HuPricingPage() {
  return <HuPricingClient />
}
