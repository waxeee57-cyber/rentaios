import type { Metadata } from 'next'
import { PricingClient } from './PricingClient'

export const metadata: Metadata = {
  title: 'Pricing — RentalOS',
  description: 'RentalOS plans from €49/month. 14-day free trial, no credit card required. Starter, Growth, Pro, and Agency tiers.',
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'}/pricing` },
}

const STRIPE_CONFIGURED = !!process.env.STRIPE_SECRET_KEY

export default function PricingPage() {
  return (
    <PricingClient
      stripeConfigured={STRIPE_CONFIGURED}
      starterPriceId={process.env.STRIPE_STARTER_PRICE_ID ?? null}
      growthPriceId={process.env.STRIPE_GROWTH_PRICE_ID ?? null}
      proPriceId={process.env.STRIPE_PRO_PRICE_ID ?? null}
      starterAnnualPriceId={process.env.STRIPE_STARTER_ANNUAL_PRICE_ID ?? null}
      growthAnnualPriceId={process.env.STRIPE_GROWTH_ANNUAL_PRICE_ID ?? null}
      proAnnualPriceId={process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? null}
    />
  )
}
