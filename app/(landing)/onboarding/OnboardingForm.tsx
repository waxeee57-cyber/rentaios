'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'

type FormData = {
  business_name: string
  contact_name: string
  contact_email: string
  business_type: string
  business_type_custom: string
  business_city: string
  business_country: string
  current_booking_method: string
  monthly_bookings_estimate: string
  vehicle_count: string
  domain_name: string
  preferred_language: string
  logo_url: string
  brand_color: string
  tagline: string
  delivery_location: string
  delivery_radius: string
  min_driver_age: string
  min_license_years: string
  max_rental_days: string
  cancellation_policy: string
  notes: string
  referral_source: string
}

const INITIAL: FormData = {
  business_name: '',
  contact_name: '',
  contact_email: '',
  business_type: '',
  business_type_custom: '',
  business_city: '',
  business_country: '',
  current_booking_method: '',
  monthly_bookings_estimate: '',
  vehicle_count: '',
  domain_name: '',
  preferred_language: 'English',
  logo_url: '',
  brand_color: '#C8A96B',
  tagline: '',
  delivery_location: '',
  delivery_radius: '25 km',
  min_driver_age: '25',
  min_license_years: '2',
  max_rental_days: '14',
  cancellation_policy: '',
  notes: '',
  referral_source: '',
}

const BUSINESS_TYPES = [
  { id: 'Car rental', label: 'Car rental' },
  { id: 'Yacht charter', label: 'Yacht charter' },
  { id: 'Villa rental', label: 'Villa rental' },
  { id: 'Motorcycle rental', label: 'Motorcycles' },
  { id: 'other', label: 'Other' },
]

const BOOKING_METHODS = ['WhatsApp', 'Email', 'Spreadsheet', 'Another booking system', 'Nothing yet']
const MONTHLY_ESTIMATES = ['Under 10', '10-30', '30-50', '50+']
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Italian', 'Other']
const RADIUS_OPTIONS = ['10 km', '25 km', '50 km', 'Nationwide / no limit']
const LICENSE_YEARS = [
  { value: '1', label: '1 year' },
  { value: '2', label: '2 years' },
  { value: '3', label: '3 years' },
]
const CANCELLATION_OPTIONS = [
  { id: 'flexible', label: 'Flexible', sub: 'Full refund if cancelled 7+ days before' },
  { id: 'moderate', label: 'Moderate', sub: '50% refund if cancelled 2-7 days before' },
  { id: 'strict', label: 'Strict', sub: 'No refund under 48 hours' },
  { id: 'custom', label: 'Custom', sub: "I'll explain in notes" },
]
const REFERRAL_SOURCES = [
  'Search engine', 'Social media', 'Referral from a colleague', 'Saw a live demo site', 'Other',
]
const STEP_TITLES = [
  'Your business', 'Current situation', 'Your new system',
  'Branding', 'Service area', 'Anything else',
]

function FieldLabel({ children, helper }: { children: React.ReactNode; helper?: string }) {
  return (
    <div className="mb-2">
      <span className="font-sans text-xs uppercase tracking-[0.15em] text-white/70">{children}</span>
      {helper && <p className="mt-1 font-sans text-xs text-white/40 leading-relaxed">{helper}</p>}
    </div>
  )
}

function TextInput({
  value, onChange, placeholder, type = 'text',
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full min-h-[48px] rounded-md border border-white/10 bg-white/5 px-4
        font-sans text-sm text-white placeholder:text-white/25
        focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/20
        transition-colors"
    />
  )
}

function RadioCard({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex items-center justify-center min-h-[48px] rounded-md border px-3 py-2 text-center
        font-sans text-sm transition-colors ${
          checked
            ? 'border-gold bg-gold/10 text-white'
            : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/80'
        }`}
    >
      {label}
    </button>
  )
}

export function OnboardingForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  useEffect(() => {
    trackEvent('form_start', '/onboarding')
  }, [])
  const [form, setForm] = useState<FormData>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const TOTAL = 6

  function update(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function canAdvance(): boolean {
    if (step === 1) {
      const typeOk = form.business_type !== 'other' || !!form.business_type_custom
      return !!(form.business_name && form.contact_name && form.contact_email &&
                form.business_type && form.business_city && form.business_country && typeOk)
    }
    if (step === 2) {
      return !!(form.current_booking_method && form.monthly_bookings_estimate && form.vehicle_count)
    }
    if (step === 5) {
      return !!(form.delivery_location && form.delivery_radius && form.cancellation_policy)
    }
    return true
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          vehicle_count: parseInt(form.vehicle_count) || undefined,
          min_driver_age: parseInt(form.min_driver_age) || 25,
          min_license_years: parseInt(form.min_license_years) || 2,
          max_rental_days: parseInt(form.max_rental_days) || 14,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      router.push('/onboarding/thank-you')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const progress = (step / TOTAL) * 100

  return (
    <div className="min-h-screen bg-[#0F0F10] flex flex-col">
      {/* Header bar */}
      <div className="border-b border-white/5">
        <div className="mx-auto max-w-lg px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-sans text-xs uppercase tracking-[0.3em] text-gold">
            RentalOS
          </Link>
          <span className="font-sans text-xs text-white/30">Step {step} of {TOTAL}</span>
        </div>
        <div className="h-px bg-white/5">
          <div className="h-px bg-gold transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Reassurance banner */}
      <div className="border-b border-gold/10 bg-gold/5 px-6 py-4">
        <div className="mx-auto max-w-lg">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold mb-2">
            You don&apos;t need to do anything technical.
          </p>
          <div className="flex flex-col gap-1.5">
            {[
              { day: 'Day 0', text: 'You fill in this form (5 minutes)' },
              { day: 'Day 0–1', text: 'We read it and clarify if needed' },
              { day: 'Day 1–2', text: 'We deploy your complete system' },
              { day: 'Day 2', text: 'Your login details arrive by email' },
            ].map(({ day, text }) => (
              <div key={day} className="flex items-center gap-2">
                <span className="font-sans text-[10px] tabular-nums text-gold/50 shrink-0 w-12">{day}</span>
                <span className="font-sans text-xs text-muted/80">{text}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 font-sans text-[10px] text-muted/50">No servers. No code. No configuration.</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 mx-auto w-full max-w-lg px-6 py-12">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-4">Setup — {step}/{TOTAL}</p>
        <h1 className="font-display text-3xl font-light text-white mb-10">{STEP_TITLES[step - 1]}</h1>

        <div className="space-y-7">

          {/* ── Step 1 ── */}
          {step === 1 && (
            <>
              <div>
                <FieldLabel>Business name</FieldLabel>
                <TextInput value={form.business_name} onChange={v => update('business_name', v)} placeholder="e.g. Riviera Prestige Cars" />
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <FieldLabel>Your full name</FieldLabel>
                  <TextInput value={form.contact_name} onChange={v => update('contact_name', v)} placeholder="James Harrington" />
                </div>
                <div>
                  <FieldLabel>Email address</FieldLabel>
                  <TextInput value={form.contact_email} onChange={v => update('contact_email', v)} type="email" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <FieldLabel>Business type</FieldLabel>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {BUSINESS_TYPES.map(t => (
                    <RadioCard key={t.id} label={t.label} checked={form.business_type === t.id} onChange={() => update('business_type', t.id)} />
                  ))}
                </div>
                {form.business_type === 'other' && (
                  <div className="mt-3">
                    <TextInput value={form.business_type_custom} onChange={v => update('business_type_custom', v)} placeholder="Describe your rental type" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>City</FieldLabel>
                  <TextInput value={form.business_city} onChange={v => update('business_city', v)} placeholder="Marbella" />
                </div>
                <div>
                  <FieldLabel>Country</FieldLabel>
                  <TextInput value={form.business_country} onChange={v => update('business_country', v)} placeholder="Spain" />
                </div>
              </div>
            </>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <>
              <div>
                <FieldLabel>How do you manage bookings now?</FieldLabel>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {BOOKING_METHODS.map(m => (
                    <RadioCard key={m} label={m} checked={form.current_booking_method === m} onChange={() => update('current_booking_method', m)} />
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>Monthly bookings estimate</FieldLabel>
                <div className="grid grid-cols-4 gap-2">
                  {MONTHLY_ESTIMATES.map(e => (
                    <RadioCard key={e} label={e} checked={form.monthly_bookings_estimate === e} onChange={() => update('monthly_bookings_estimate', e)} />
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>Number of vehicles or units</FieldLabel>
                <TextInput type="number" value={form.vehicle_count} onChange={v => update('vehicle_count', v)} placeholder="e.g. 8" />
              </div>
            </>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <>
              <div>
                <FieldLabel helper="Leave blank if you don't have one yet. We can advise.">Domain name (optional)</FieldLabel>
                <TextInput value={form.domain_name} onChange={v => update('domain_name', v)} placeholder="yourcompany.com" />
              </div>
              <div>
                <FieldLabel>Preferred language</FieldLabel>
                <select
                  value={form.preferred_language}
                  onChange={e => update('preferred_language', e.target.value)}
                  className="w-full min-h-[48px] rounded-md border border-white/10 bg-white/5 px-4
                    font-sans text-sm text-white focus:border-gold/60 focus:outline-none
                    focus:ring-1 focus:ring-gold/20 transition-colors"
                >
                  {LANGUAGES.map(l => <option key={l} value={l} className="bg-[#1B1B1D]">{l}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel helper="Paste a direct image URL. Leave blank to use a text logo.">Logo URL (optional)</FieldLabel>
                <TextInput value={form.logo_url} onChange={v => update('logo_url', v)} placeholder="https://example.com/logo.png" type="url" />
              </div>
            </>
          )}

          {/* ── Step 4 ── */}
          {step === 4 && (
            <>
              <div>
                <FieldLabel helper="Your accent color — buttons, highlights, links.">Primary brand color</FieldLabel>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.brand_color}
                    onChange={e => update('brand_color', e.target.value)}
                    className="h-12 w-12 shrink-0 rounded-md border border-white/10 bg-transparent cursor-pointer"
                  />
                  <TextInput
                    value={form.brand_color}
                    onChange={v => {
                      const hex = v.startsWith('#') ? v : `#${v}`
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(hex)) update('brand_color', hex)
                    }}
                    placeholder="#C8A96B"
                  />
                  <div
                    className="h-12 w-12 shrink-0 rounded-md border border-white/10"
                    style={{ background: /^#[0-9A-Fa-f]{6}$/.test(form.brand_color) ? form.brand_color : '#C8A96B' }}
                  />
                </div>
              </div>
              <div>
                <FieldLabel helper="Short phrase that appears on your homepage. Leave blank for default.">Tagline (optional, max 80 chars)</FieldLabel>
                <TextInput
                  value={form.tagline}
                  onChange={v => v.length <= 80 && update('tagline', v)}
                  placeholder="e.g. The Coast, Driven Beautifully"
                />
                <p className="mt-1.5 font-sans text-xs text-white/30 text-right">{form.tagline.length}/80</p>
              </div>
            </>
          )}

          {/* ── Step 5 ── */}
          {step === 5 && (
            <>
              <div>
                <FieldLabel helper="Where free delivery applies from — your home base.">Base delivery location</FieldLabel>
                <TextInput value={form.delivery_location} onChange={v => update('delivery_location', v)} placeholder="e.g. Marbella city centre" />
              </div>
              <div>
                <FieldLabel>Free delivery radius</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {RADIUS_OPTIONS.map(r => (
                    <RadioCard key={r} label={r} checked={form.delivery_radius === r} onChange={() => update('delivery_radius', r)} />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <FieldLabel>Min driver age</FieldLabel>
                  <TextInput type="number" value={form.min_driver_age} onChange={v => update('min_driver_age', v)} placeholder="25" />
                </div>
                <div>
                  <FieldLabel>Licence held for</FieldLabel>
                  <select
                    value={form.min_license_years}
                    onChange={e => update('min_license_years', e.target.value)}
                    className="w-full min-h-[48px] rounded-md border border-white/10 bg-white/5 px-4
                      font-sans text-sm text-white focus:border-gold/60 focus:outline-none
                      focus:ring-1 focus:ring-gold/20 transition-colors"
                  >
                    {LICENSE_YEARS.map(y => <option key={y.value} value={y.value} className="bg-[#1B1B1D]">{y.label}</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel>Max rental days</FieldLabel>
                  <TextInput type="number" value={form.max_rental_days} onChange={v => update('max_rental_days', v)} placeholder="14" />
                </div>
              </div>
              <div>
                <FieldLabel>Cancellation policy</FieldLabel>
                <div className="space-y-2">
                  {CANCELLATION_OPTIONS.map(o => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => update('cancellation_policy', o.id)}
                      className={`w-full text-left rounded-md border px-4 py-3 transition-colors ${
                        form.cancellation_policy === o.id
                          ? 'border-gold bg-gold/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <p className={`font-sans text-sm font-medium ${form.cancellation_policy === o.id ? 'text-white' : 'text-white/70'}`}>{o.label}</p>
                      <p className="font-sans text-xs text-white/40 mt-0.5">{o.sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Step 6 ── */}
          {step === 6 && (
            <>
              <div>
                <FieldLabel>Special requirements or notes (optional)</FieldLabel>
                <textarea
                  value={form.notes}
                  onChange={e => e.target.value.length <= 500 && update('notes', e.target.value)}
                  placeholder="Any integrations, languages, or special features you need..."
                  rows={5}
                  className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3
                    font-sans text-sm text-white placeholder:text-white/25 resize-none
                    focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/20
                    transition-colors"
                />
                <p className="mt-1.5 font-sans text-xs text-white/30 text-right">{form.notes.length}/500</p>
              </div>
              <div>
                <FieldLabel>How did you hear about us? (optional)</FieldLabel>
                <select
                  value={form.referral_source}
                  onChange={e => update('referral_source', e.target.value)}
                  className="w-full min-h-[48px] rounded-md border border-white/10 bg-white/5 px-4
                    font-sans text-sm text-white focus:border-gold/60 focus:outline-none
                    focus:ring-1 focus:ring-gold/20 transition-colors"
                >
                  <option value="" className="bg-[#1B1B1D]">Select...</option>
                  {REFERRAL_SOURCES.map(s => <option key={s} value={s} className="bg-[#1B1B1D]">{s}</option>)}
                </select>
              </div>
              {error && (
                <div className="rounded-md border border-red-500/30 bg-red-500/5 px-4 py-3">
                  <p className="font-sans text-sm text-red-400">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Navigation buttons */}
        <div className={`mt-10 flex gap-3 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="min-h-[48px] px-6 rounded-md border border-white/10 font-sans text-sm
                text-white/60 hover:text-white hover:border-white/20 transition-colors"
            >
              Back
            </button>
          )}
          {step < TOTAL ? (
            <button
              type="button"
              onClick={() => canAdvance() && setStep(s => s + 1)}
              disabled={!canAdvance()}
              className="min-h-[48px] px-8 rounded-md bg-gold font-sans text-sm font-medium
                text-black transition-opacity disabled:opacity-40 hover:opacity-90"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="min-h-[48px] px-8 rounded-md bg-gold font-sans text-sm font-medium
                text-black transition-opacity disabled:opacity-60 hover:opacity-90"
            >
              {loading ? 'Sending...' : 'Submit setup request'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
