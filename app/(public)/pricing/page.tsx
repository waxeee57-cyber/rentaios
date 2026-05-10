import type { Metadata } from 'next'
import { PricingClient } from './PricingClient'

export const metadata: Metadata = {
  title: 'Pricing — RentalOS',
  description: 'RentalOS plans from €49/month. 14-day free trial, no credit card required. Starter, Growth, Pro, and Agency tiers.',
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'}/pricing` },
}

const STRIPE_CONFIGURED = !!process.env.STRIPE_SECRET_KEY

export default function PricingPage() {
  return <PricingClient stripeConfigured={STRIPE_CONFIGURED} />
}
