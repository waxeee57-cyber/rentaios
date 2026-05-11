'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { BusinessConfig } from '@/lib/config'

type Status = 'idle' | 'saving' | 'saved' | 'error'

type SectionState = {
  values: Record<string, string | number | null>
  status: Status
  error: string | null
}

function useSection(initial: Record<string, string | number | null>) {
  const [state, setState] = useState<SectionState>({
    values: initial,
    status: 'idle',
    error: null,
  })

  function set(key: string, value: string | number | null) {
    setState((s) => ({ ...s, values: { ...s.values, [key]: value }, status: 'idle' }))
  }

  async function save() {
    setState((s) => ({ ...s, status: 'saving', error: null }))
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.values),
      })
      if (!res.ok) {
        const { error } = await res.json()
        setState((s) => ({ ...s, status: 'error', error: error ?? 'Save failed' }))
      } else {
        setState((s) => ({ ...s, status: 'saved' }))
        setTimeout(() => setState((s) => ({ ...s, status: 'idle' })), 2500)
      }
    } catch {
      setState((s) => ({ ...s, status: 'error', error: 'Network error' }))
    }
  }

  return { values: state.values, status: state.status, error: state.error, set, save }
}

function Field({
  label,
  id,
  value,
  onChange,
  type = 'text',
  placeholder,
  hint,
}: {
  label: string
  id: string
  value: string | number | null
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-sans text-xs uppercase tracking-[0.15em] text-muted">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-md border border-border bg-graphite/50 px-3 font-sans text-sm text-white placeholder:text-muted/40 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20 transition-colors"
      />
      {hint && <p className="font-sans text-xs text-muted/60">{hint}</p>}
    </div>
  )
}

function Textarea({
  label,
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string
  id: string
  value: string | null
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-sans text-xs uppercase tracking-[0.15em] text-muted">
        {label}
      </label>
      <textarea
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="rounded-md border border-border bg-graphite/50 px-3 py-2 font-sans text-sm text-white placeholder:text-muted/40 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20 transition-colors resize-none"
      />
    </div>
  )
}

function SaveRow({ status, error, onSave }: { status: Status; error: string | null; onSave: () => void }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        type="button"
        onClick={onSave}
        disabled={status === 'saving'}
        className="min-h-[40px] rounded-md border border-gold/40 px-5 font-sans text-xs uppercase tracking-[0.15em] text-gold hover:bg-gold hover:text-black transition-colors disabled:opacity-50"
      >
        {status === 'saving' ? 'Saving…' : 'Save'}
      </button>
      {status === 'saved' && (
        <span className="font-sans text-xs text-gold">Saved</span>
      )}
      {status === 'error' && (
        <span className="font-sans text-xs text-danger">{error}</span>
      )}
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-graphite/30 p-5 md:p-6">
      <h2 className="mb-5 font-sans text-xs uppercase tracking-[0.2em] text-gold">{title}</h2>
      {children}
    </div>
  )
}

export function SettingsForm({ config }: { config: BusinessConfig }) {
  const info = useSection({
    business_name: config.business_name,
    business_city: config.business_city,
    business_country: config.business_country,
    business_address: config.business_address,
    tagline: config.tagline,
    about_text: config.about_text,
  })

  const contact = useSection({
    business_email: config.business_email,
    business_phone: config.business_phone,
    business_whatsapp: config.business_whatsapp,
  })

  const delivery = useSection({
    delivery_radius_km: config.delivery_radius_km,
    delivery_base_location: config.delivery_base_location,
  })

  const rules = useSection({
    min_driver_age: config.min_driver_age,
    min_license_years: config.min_license_years,
    max_rental_days: config.max_rental_days,
    currency_code: config.currency_code,
    currency_symbol: config.currency_symbol,
  })

  const appearance = useSection({
    primary_color: config.primary_color,
    logo_url: config.logo_url,
    hero_image_url: config.hero_image_url,
  })

  const cancellation = useSection({
    cancel_tier1_days: config.cancel_tier1_days,
    cancel_tier1_pct: config.cancel_tier1_pct,
    cancel_tier2_days: config.cancel_tier2_days,
    cancel_tier2_pct: config.cancel_tier2_pct,
    cancel_tier3_pct: config.cancel_tier3_pct,
  })

  return (
    <div className="flex flex-col gap-6">

      {/* Business Info */}
      <SectionCard title="Business Info">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Business Name" id="business_name"
            value={info.values.business_name} onChange={(v) => info.set('business_name', v)} />
          <Field label="City" id="business_city"
            value={info.values.business_city} onChange={(v) => info.set('business_city', v)} />
          <Field label="Country" id="business_country"
            value={info.values.business_country} onChange={(v) => info.set('business_country', v)} />
          <Field label="Address" id="business_address"
            value={info.values.business_address} onChange={(v) => info.set('business_address', v)}
            placeholder="Optional" />
          <div className="md:col-span-2">
            <Field label="Tagline" id="tagline"
              value={info.values.tagline} onChange={(v) => info.set('tagline', v)}
              placeholder="The Coast, Driven Beautifully" />
          </div>
          <div className="md:col-span-2">
            <Textarea label="About text" id="about_text"
              value={info.values.about_text as string | null}
              onChange={(v) => info.set('about_text', v || null)}
              placeholder="Short description of the business" rows={3} />
          </div>
        </div>
        <SaveRow status={info.status} error={info.error} onSave={info.save} />
      </SectionCard>

      {/* Contact */}
      <SectionCard title="Contact">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Business Email" id="business_email" type="email"
            value={contact.values.business_email}
            onChange={(v) => contact.set('business_email', v)} />
          <Field label="Phone" id="business_phone" type="tel"
            value={contact.values.business_phone}
            onChange={(v) => contact.set('business_phone', v || null)}
            placeholder="+34600000000" />
          <Field label="WhatsApp number" id="business_whatsapp"
            value={contact.values.business_whatsapp}
            onChange={(v) => contact.set('business_whatsapp', v || null)}
            placeholder="34600000000 (no +)"
            hint="Without the + prefix" />
        </div>
        <SaveRow status={contact.status} error={contact.error} onSave={contact.save} />
      </SectionCard>

      {/* Delivery */}
      <SectionCard title="Delivery">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Delivery radius (km)" id="delivery_radius_km" type="number"
            value={delivery.values.delivery_radius_km}
            onChange={(v) => delivery.set('delivery_radius_km', parseInt(v) || 0)} />
          <Field label="Base location" id="delivery_base_location"
            value={delivery.values.delivery_base_location}
            onChange={(v) => delivery.set('delivery_base_location', v)}
            hint="Where free delivery originates from" />
        </div>
        <SaveRow status={delivery.status} error={delivery.error} onSave={delivery.save} />
      </SectionCard>

      {/* Rental Rules */}
      <SectionCard title="Rental Rules">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Min driver age" id="min_driver_age" type="number"
            value={rules.values.min_driver_age}
            onChange={(v) => rules.set('min_driver_age', parseInt(v) || 0)} />
          <Field label="Min licence years" id="min_license_years" type="number"
            value={rules.values.min_license_years}
            onChange={(v) => rules.set('min_license_years', parseInt(v) || 0)} />
          <Field label="Max rental days" id="max_rental_days" type="number"
            value={rules.values.max_rental_days}
            onChange={(v) => rules.set('max_rental_days', parseInt(v) || 0)} />
          <Field label="Currency code" id="currency_code"
            value={rules.values.currency_code}
            onChange={(v) => rules.set('currency_code', v)}
            placeholder="EUR" />
          <Field label="Currency symbol" id="currency_symbol"
            value={rules.values.currency_symbol}
            onChange={(v) => rules.set('currency_symbol', v)}
            placeholder="€" />
        </div>
        <SaveRow status={rules.status} error={rules.error} onSave={rules.save} />
      </SectionCard>

      {/* Appearance */}
      <SectionCard title="Appearance">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Primary colour" id="primary_color"
            value={appearance.values.primary_color}
            onChange={(v) => appearance.set('primary_color', v)}
            placeholder="#C8A96B"
            hint="Hex code — affects email header accent" />
          <Field label="Logo URL" id="logo_url"
            value={appearance.values.logo_url}
            onChange={(v) => appearance.set('logo_url', v || null)}
            placeholder="https://..." />
          <div className="md:col-span-2">
            <Field label="Hero image URL" id="hero_image_url"
              value={appearance.values.hero_image_url}
              onChange={(v) => appearance.set('hero_image_url', v || null)}
              placeholder="https://images.unsplash.com/..." />
          </div>
        </div>
        <SaveRow status={appearance.status} error={appearance.error} onSave={appearance.save} />
      </SectionCard>

      {/* Review Requests */}
      <ReviewSection config={config} />

      {/* RentalOS Identity */}
      <IdentitySection config={config} />

      {/* Powered by badge */}
      <BadgeSection config={config} />

      {/* Public showcase */}
      <ShowcaseSection config={config} />

      {/* Cancellation Policy */}
      <SectionCard title="Cancellation Policy">
        <div className="mb-4 font-sans text-xs leading-relaxed text-muted">
          Tier 1: refund X% if cancelled ≥ N days before pickup.
          Tier 2: refund Y% if ≥ M days. Tier 3: refund Z% otherwise.
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Tier 1 — days notice" id="cancel_tier1_days" type="number"
            value={cancellation.values.cancel_tier1_days}
            onChange={(v) => cancellation.set('cancel_tier1_days', parseInt(v) || 0)} />
          <Field label="Tier 1 — refund %" id="cancel_tier1_pct" type="number"
            value={cancellation.values.cancel_tier1_pct}
            onChange={(v) => cancellation.set('cancel_tier1_pct', parseInt(v) || 0)} />
          <div />
          <Field label="Tier 2 — days notice" id="cancel_tier2_days" type="number"
            value={cancellation.values.cancel_tier2_days}
            onChange={(v) => cancellation.set('cancel_tier2_days', parseInt(v) || 0)} />
          <Field label="Tier 2 — refund %" id="cancel_tier2_pct" type="number"
            value={cancellation.values.cancel_tier2_pct}
            onChange={(v) => cancellation.set('cancel_tier2_pct', parseInt(v) || 0)} />
          <div />
          <Field label="Tier 3 — refund %" id="cancel_tier3_pct" type="number"
            value={cancellation.values.cancel_tier3_pct}
            onChange={(v) => cancellation.set('cancel_tier3_pct', parseInt(v) || 0)}
            hint="Applied when no other tier matches" />
        </div>
        <SaveRow status={cancellation.status} error={cancellation.error} onSave={cancellation.save} />
      </SectionCard>

    </div>
  )
}

function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${checked ? 'bg-gold' : 'bg-border'}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
      <div>
        <p className="font-sans text-sm text-white">{label}</p>
        {hint && <p className="font-sans text-xs text-muted/60 mt-0.5">{hint}</p>}
      </div>
    </div>
  )
}

function ReviewSection({ config }: { config: BusinessConfig }) {
  const [url, setUrl] = useState(config.google_review_url ?? '')
  const [enabled, setEnabled] = useState(config.review_email_enabled !== false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setStatus('saving')
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ google_review_url: url || null, review_email_enabled: enabled }),
    })
    const data = await res.json()
    if (!res.ok) { setStatus('error'); setError(data.error ?? 'Save failed') }
    else { setStatus('saved'); setTimeout(() => setStatus('idle'), 2500) }
  }

  return (
    <SectionCard title="Review Requests">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="google_review_url" className="font-sans text-xs uppercase tracking-[0.15em] text-muted">
            Google Reviews URL
          </label>
          <input
            id="google_review_url"
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://g.page/r/..."
            className="h-10 rounded-md border border-border bg-graphite/50 px-3 font-sans text-sm text-white placeholder:text-muted/40 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20 transition-colors"
          />
          <p className="font-sans text-xs text-muted/60">Find this in Google Maps → Your business → Get reviews</p>
        </div>
        <Toggle
          label="Send review request after completed booking"
          checked={enabled}
          onChange={setEnabled}
          hint="Sent 24 hours after a booking is marked completed. Requires Google Reviews URL above."
        />
      </div>
      <SaveRow status={status} error={error} onSave={save} />
    </SectionCard>
  )
}

function IdentitySection({ config }: { config: BusinessConfig }) {
  const [slug, setSlug] = useState(config.business_slug ?? '')
  const [locked, setLocked] = useState(config.slug_locked ?? false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [copied, setCopied] = useState(false)

  const slugUrl = slug ? `${slug}.domrol.com` : ''

  async function confirmSlug() {
    setStatus('saving')
    setError(null)
    const res = await fetch('/api/admin/settings/slug', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_slug: slug }),
    })
    const data = await res.json()
    if (!res.ok) { setStatus('error'); setError(data.error ?? 'Failed to save') }
    else { setStatus('saved'); setLocked(true); setShowConfirm(false); setTimeout(() => setStatus('idle'), 2500) }
  }

  return (
    <SectionCard title="Your RentalOS Identity">
      <div className="flex flex-col gap-4">
        {locked ? (
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-muted mb-1.5">Your RentalOS URL</p>
            <div className="flex items-center gap-2 rounded-md border border-border bg-black/40 px-3 py-2.5">
              <span className="font-sans text-sm text-white">{slugUrl}</span>
              <button
                onClick={() => { navigator.clipboard.writeText(slugUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                className="ml-1 text-muted hover:text-gold transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="font-sans text-xs text-muted/60 mt-1.5">Your URL is locked. Contact support to change it.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs uppercase tracking-[0.15em] text-muted">Your RentalOS URL</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="your-business"
                  maxLength={30}
                  className="flex-1 h-10 rounded-l-md border border-r-0 border-border bg-graphite/50 px-3 font-sans text-sm text-white placeholder:text-muted/40 focus:border-gold/40 focus:outline-none"
                />
                <span className="h-10 flex items-center rounded-r-md border border-border bg-black/40 px-3 font-sans text-sm text-muted">
                  .domrol.com
                </span>
              </div>
              <p className="font-sans text-xs text-muted/60">Choose carefully — this can only be set once. Lowercase letters, numbers, hyphens only.</p>
            </div>
            {showConfirm ? (
              <div className="rounded-md border border-gold/30 bg-gold/5 p-4">
                <p className="font-sans text-sm text-white mb-3">Once set, your slug cannot be changed. Confirm <strong>{slugUrl}</strong>?</p>
                <div className="flex gap-3">
                  <button
                    onClick={confirmSlug}
                    disabled={status === 'saving'}
                    className="min-h-[36px] rounded-md bg-gold px-4 font-sans text-xs uppercase tracking-[0.15em] text-black hover:opacity-90 disabled:opacity-50 transition-colors"
                  >
                    {status === 'saving' ? 'Saving…' : 'Confirm and lock slug'}
                  </button>
                  <button onClick={() => setShowConfirm(false)} className="font-sans text-xs text-muted hover:text-white">Cancel</button>
                </div>
                {status === 'error' && <p className="font-sans text-xs text-danger mt-2">{error}</p>}
              </div>
            ) : (
              <button
                onClick={() => slug.length >= 3 && setShowConfirm(true)}
                disabled={slug.length < 3}
                className="self-start min-h-[36px] rounded-md border border-gold/40 px-4 font-sans text-xs uppercase tracking-[0.15em] text-gold hover:bg-gold hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm and lock slug
              </button>
            )}
            {status === 'saved' && <p className="font-sans text-xs text-gold">Slug saved and locked.</p>}
          </>
        )}
      </div>
    </SectionCard>
  )
}

function BadgeSection({ config }: { config: BusinessConfig }) {
  const [showPoweredBy, setShowPoweredBy] = useState(config.show_powered_by !== false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const canRemove = config.white_label_fee_paid

  async function save(value: boolean) {
    setStatus('saving')
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ show_powered_by: value }),
    })
    setStatus(res.ok ? 'saved' : 'error')
    if (res.ok) setTimeout(() => setStatus('idle'), 2500)
  }

  return (
    <SectionCard title="Powered by RentalOS Badge">
      <div className="flex flex-col gap-3">
        {canRemove ? (
          <Toggle
            label='Show "Powered by RentalOS" in footer'
            checked={showPoweredBy}
            onChange={(v) => { setShowPoweredBy(v); save(v) }}
            hint="Uncheck to hide the attribution badge from your public site footer."
          />
        ) : (
          <div>
            <Toggle label='Show "Powered by RentalOS" in footer' checked={true} onChange={() => {}} />
            <p className="font-sans text-xs text-muted/60 mt-3">
              Upgrade to Pro or{' '}
              <a href="/contact?subject=White-label+fee" className="text-gold hover:underline underline-offset-4">
                pay the one-time €99 white-label fee
              </a>{' '}
              to remove the badge.
            </p>
          </div>
        )}
        {status === 'saved' && <p className="font-sans text-xs text-gold">Saved.</p>}
        {status === 'error' && <p className="font-sans text-xs text-danger">Save failed.</p>}
      </div>
    </SectionCard>
  )
}

function ShowcaseSection({ config }: { config: BusinessConfig }) {
  const [featured, setFeatured] = useState(config.featured_on_showcase ?? false)
  const [vehicleType, setVehicleType] = useState(config.showcase_vehicle_type ?? '')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  async function save() {
    setStatus('saving')
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured_on_showcase: featured, showcase_vehicle_type: vehicleType || null }),
    })
    setStatus(res.ok ? 'saved' : 'error')
    if (res.ok) setTimeout(() => setStatus('idle'), 2500)
  }

  return (
    <SectionCard title="Public Showcase">
      <div className="flex flex-col gap-4">
        <Toggle
          label="Feature my business on domrol.com/customers"
          checked={featured}
          onChange={setFeatured}
          hint="Your business name, location, and vehicle type will be shown publicly on the RentalOS customers page."
        />
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-xs uppercase tracking-[0.15em] text-muted">Vehicle type</label>
          <select
            value={vehicleType}
            onChange={e => setVehicleType(e.target.value)}
            className="h-10 rounded-md border border-border bg-graphite/50 px-3 font-sans text-sm text-white focus:border-gold/40 focus:outline-none"
          >
            <option value="">Select type</option>
            <option value="car">Car rental</option>
            <option value="yacht">Yacht charter</option>
            <option value="villa">Villa rental</option>
            <option value="motorcycle">Motorcycle rental</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <SaveRow status={status} error={null} onSave={save} />
    </SectionCard>
  )
}
