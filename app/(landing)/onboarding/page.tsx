import type { Metadata } from 'next'
import { OnboardingForm } from './OnboardingForm'

export const metadata: Metadata = {
  title: 'System Setup',
  description: 'Complete your setup in under 5 minutes. We deploy your rental booking system within 48 hours.',
  robots: { index: false },
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  return <OnboardingForm type={type} />
}
