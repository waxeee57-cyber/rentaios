'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

type RentalType = 'car' | 'yacht' | 'villa' | 'motorcycle' | 'mixed'
type FleetSize = 'small' | 'medium' | 'large' | 'enterprise'
type SetupPref = 'self' | 'dfy'
type Rec = 'starter' | 'growth' | 'pro' | 'dfy'

function getRecommendation(setup: SetupPref, fleet: FleetSize): Rec {
  if (setup === 'dfy') return 'dfy'
  if (fleet === 'small') return 'starter'
  if (fleet === 'medium') return 'growth'
  return 'pro'
}

const RENTAL_LABELS: Record<RentalType, string> = {
  car: 'car rental',
  yacht: 'yacht charter',
  villa: 'villa rental',
  motorcycle: 'motorcycle rental',
  mixed: 'mixed fleet',
}
const FLEET_LABELS: Record<FleetSize, string> = {
  small: '1–3',
  medium: '4–10',
  large: '11–25',
  enterprise: '25+',
}

function personalCopy(rec: Rec, rt: RentalType, fs: FleetSize): string {
  const biz = RENTAL_LABELS[rt]
  const sz = FLEET_LABELS[fs]
  switch (rec) {
    case 'starter':
      return `Right-sized for a ${biz} with ${sz} items. Covers bookings, email, and your public listing — nothing unnecessary.`
    case 'growth':
      return `Designed for a growing ${biz} running ${sz} items. Adds transfer management and weekly performance reports.`
    case 'pro':
      return `For a serious ${biz} with ${sz} items. Custom domain, unlimited items, and agency eligibility.`
    case 'dfy':
      return `You focus on the ${biz} — we handle the setup. Your system is live within 48 hours.`
  }
}

type RecConfig = {
  name: string
  price: string
  features: [string, string, string]
  cta: string
}

const REC_CONFIG: Record<Rec, RecConfig> = {
  starter: {
    name: 'Starter',
    price: '€79 / month',
    features: ['Up to 5 items', 'Unlimited bookings', '14-day free trial'],
    cta: 'Start free trial',
  },
  growth: {
    name: 'Growth',
    price: '€149 / month',
    features: ['Up to 20 items', 'Unlimited bookings', 'Weekly automated report'],
    cta: 'Start free trial',
  },
  pro: {
    name: 'Pro',
    price: '€249 / month',
    features: ['Unlimited items', 'Custom domain setup included', 'Priority support'],
    cta: 'Start free trial',
  },
  dfy: {
    name: 'Done-for-you Setup',
    price: '€699 once',
    features: ['Full deployment within 48 hours', 'Every setting configured for you', 'Growth plan included for 1 month'],
    cta: 'Get started',
  },
}

const RENTAL_OPTIONS: { value: RentalType; label: string }[] = [
  { value: 'car', label: 'Car rental' },
  { value: 'yacht', label: 'Yacht charter' },
  { value: 'villa', label: 'Villa rental' },
  { value: 'motorcycle', label: 'Motorcycle rental' },
  { value: 'mixed', label: 'Mixed fleet' },
]

const FLEET_OPTIONS: { value: FleetSize; label: string; sub: string }[] = [
  { value: 'small', label: '1–3 items', sub: 'Getting started' },
  { value: 'medium', label: '4–10 items', sub: 'Growing operation' },
  { value: 'large', label: '11–25 items', sub: 'Established operation' },
  { value: 'enterprise', label: '25+ items', sub: 'Enterprise scale' },
]

const SETUP_OPTIONS: { value: SetupPref; label: string; desc: string }[] = [
  {
    value: 'self',
    label: 'I\'ll manage it myself',
    desc: 'You handle the day-to-day. We provide the platform.',
  },
  {
    value: 'dfy',
    label: 'Set it up for me',
    desc: 'We deploy your system within 48 hours. You manage bookings.',
  },
]

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex gap-2 mb-8" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={3}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${
            i < step
              ? 'bg-gold/40'
              : i === step
              ? 'bg-gold'
              : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

type CardButtonProps = {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}

function CardButton({ selected, onClick, children }: CardButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full min-h-[44px] rounded-md border p-4 text-left transition-colors duration-150 ${
        selected
          ? 'border-gold/60 bg-gold/5'
          : 'border-border bg-white hover:border-gold/40'
      }`}
    >
      {children}
    </button>
  )
}

type Props = {
  starterPriceId: string | null
  growthPriceId: string | null
  proPriceId: string | null
  stripeConfigured: boolean
}

export function PlanQuiz({ starterPriceId, growthPriceId, proPriceId, stripeConfigured }: Props) {
  const [step, setStep] = useState(0)
  const [rentalType, setRentalType] = useState<RentalType | null>(null)
  const [fleetSize, setFleetSize] = useState<FleetSize | null>(null)
  const [setupPref, setSetupPref] = useState<SetupPref | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  function advance(nextStep: number) {
    setTimeout(() => setStep(nextStep), 150)
  }

  function selectRentalType(v: RentalType) {
    setRentalType(v)
    trackEvent('quiz_q1', undefined, { value: v })
    advance(1)
  }

  function selectFleetSize(v: FleetSize) {
    setFleetSize(v)
    trackEvent('quiz_q2', undefined, { value: v })
    advance(2)
  }

  function selectSetupPref(v: SetupPref) {
    setSetupPref(v)
    trackEvent('quiz_q3', undefined, { value: v })
    advance(3)
  }

  function goBack() {
    if (step === 3) {
      setRentalType(null)
      setFleetSize(null)
      setSetupPref(null)
      setStep(0)
    } else {
      setStep(step - 1)
    }
  }

  async function handleCheckout(priceId: string) {
    setCheckoutLoading(true)
    setCheckoutError(null)
    try {
      trackEvent('cta_click', undefined, { cta: 'quiz_checkout', priceId })
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setCheckoutError('Unable to start checkout. Please try again.')
      }
    } catch {
      setCheckoutError('Network error. Please check your connection and try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const rec = step === 3 && setupPref && fleetSize ? getRecommendation(setupPref, fleetSize) : null
  const cfg = rec ? REC_CONFIG[rec] : null

  return (
    <div className="mx-auto max-w-lg">
      {/* Q1 — Rental type */}
      {step === 0 && (
        <div key="step-0" className="animate-page-enter">
          <ProgressDots step={0} />
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted mb-3">Question 1 of 3</p>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
            What type of rental do you run?
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {RENTAL_OPTIONS.map((opt) => (
              <CardButton
                key={opt.value}
                selected={rentalType === opt.value}
                onClick={() => selectRentalType(opt.value)}
              >
                <span className="font-sans text-sm text-gray-900">{opt.label}</span>
              </CardButton>
            ))}
          </div>
        </div>
      )}

      {/* Q2 — Fleet size */}
      {step === 1 && (
        <div key="step-1" className="animate-page-enter">
          <ProgressDots step={1} />
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted mb-3">Question 2 of 3</p>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
            How many items do you rent out?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {FLEET_OPTIONS.map((opt) => (
              <CardButton
                key={opt.value}
                selected={fleetSize === opt.value}
                onClick={() => selectFleetSize(opt.value)}
              >
                <p className="font-sans text-sm text-gray-900">{opt.label}</p>
                <p className="font-sans text-xs text-muted mt-0.5">{opt.sub}</p>
              </CardButton>
            ))}
          </div>
          <button
            type="button"
            onClick={goBack}
            className="mt-6 font-sans text-xs text-muted hover:text-gray-900 transition-colors"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Q3 — Setup preference */}
      {step === 2 && (
        <div key="step-2" className="animate-page-enter">
          <ProgressDots step={2} />
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted mb-3">Question 3 of 3</p>
          <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
            How would you like to get started?
          </h2>
          <div className="flex flex-col gap-3">
            {SETUP_OPTIONS.map((opt) => (
              <CardButton
                key={opt.value}
                selected={setupPref === opt.value}
                onClick={() => selectSetupPref(opt.value)}
              >
                <p className="font-sans text-sm font-medium text-gray-900">{opt.label}</p>
                <p className="font-sans text-xs text-muted mt-1">{opt.desc}</p>
              </CardButton>
            ))}
          </div>
          <button
            type="button"
            onClick={goBack}
            className="mt-6 font-sans text-xs text-muted hover:text-gray-900 transition-colors"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Recommendation */}
      {step === 3 && rec && cfg && rentalType && fleetSize && (
        <div key="step-3" className="animate-page-enter">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted mb-4">Your plan</p>
          <p
            className="font-display font-light text-gold leading-none mb-3"
            style={{ fontSize: '3.5rem' }}
          >
            {cfg.name}
          </p>
          <p className="font-sans text-base text-gray-900 mb-2">{cfg.price}</p>
          <p className="font-sans text-sm text-muted leading-relaxed mb-6">
            {personalCopy(rec, rentalType, fleetSize)}
          </p>
          <ul className="flex flex-col gap-2.5 mb-8">
            {cfg.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                <span className="font-sans text-sm text-muted">{f}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          {rec === 'dfy' ? (
            <Link
              href="/onboarding"
              className="inline-flex w-full items-center justify-center min-h-[44px] rounded-md bg-gold px-8 font-sans text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              {cfg.cta}
            </Link>
          ) : stripeConfigured && (
            rec === 'starter' ? starterPriceId :
            rec === 'growth' ? growthPriceId :
            proPriceId
          ) ? (
            <button
              type="button"
              disabled={checkoutLoading}
              onClick={() => {
                const pid =
                  rec === 'starter' ? starterPriceId :
                  rec === 'growth' ? growthPriceId :
                  proPriceId
                if (pid) handleCheckout(pid)
              }}
              className="inline-flex w-full items-center justify-center min-h-[44px] rounded-md bg-gold px-8 font-sans text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? 'Redirecting…' : cfg.cta}
            </button>
          ) : (
            <Link
              href="/contact?subject=Subscribe"
              className="inline-flex w-full items-center justify-center min-h-[44px] rounded-md bg-gold px-8 font-sans text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              {cfg.cta}
            </Link>
          )}

          {checkoutError && (
            <p className="mt-3 font-sans text-xs text-center" style={{ color: 'oklch(0.65 0.18 25)' }}>
              {checkoutError}
            </p>
          )}

          <p className="mt-4 text-center">
            <a
              href="#pricing-table"
              className="font-sans text-xs text-muted hover:text-gray-900 transition-colors underline-offset-4 hover:underline"
            >
              Or browse all plans below ↓
            </a>
          </p>

          <button
            type="button"
            onClick={goBack}
            className="mt-6 font-sans text-xs text-muted hover:text-gray-900 transition-colors"
          >
            ← Start over
          </button>
        </div>
      )}
    </div>
  )
}
