'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

type State = 'idle' | 'loading' | 'success' | 'error'

export function DemoInquiryForm({ carName }: { carName: string }) {
  const [state, setState] = useState<State>('idle')
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function update(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/demo/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, car: carName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSubmittedEmail(form.email)
      setState('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="rounded-md border border-gold/30 bg-gold/5 px-5 py-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15">
            <Check className="h-4 w-4 text-gold" />
          </div>
          <p className="font-sans text-sm font-medium text-white">Inquiry sent</p>
        </div>
        <p className="font-sans text-sm text-muted leading-relaxed">Check your inbox at</p>
        <p className="font-sans text-sm font-medium text-white mt-0.5 mb-5">{submittedEmail}</p>
        <p className="font-sans text-xs text-muted leading-relaxed mb-5">
          This is a demo — no real booking was created. Ready to take real bookings for your own fleet?
        </p>
        <div className="flex flex-col gap-2.5">
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center min-h-[44px] rounded-md bg-gold px-5 font-sans text-xs uppercase tracking-[0.1em] text-black hover:opacity-90 transition-opacity"
          >
            Get this for my business →
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center min-h-[44px] rounded-md border border-border px-5 font-sans text-xs uppercase tracking-[0.1em] text-muted hover:border-gold/40 hover:text-white transition-colors"
          >
            See pricing
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-border bg-black/40 px-5 py-5">
      <p className="font-sans text-xs uppercase tracking-[0.15em] text-gold mb-1">Request this vehicle</p>
      <p className="font-sans text-xs text-muted mb-5 leading-relaxed">
        Try the full booking experience. No account needed — this is a demo.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Your name"
          value={form.name}
          onChange={e => update('name', e.target.value)}
          required
          className="w-full min-h-[44px] rounded-md border border-border bg-white/[0.03] px-3 font-sans text-sm text-white placeholder:text-muted/40 focus:border-gold/40 focus:outline-none transition-colors"
        />
        <input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={e => update('email', e.target.value)}
          required
          className="w-full min-h-[44px] rounded-md border border-border bg-white/[0.03] px-3 font-sans text-sm text-white placeholder:text-muted/40 focus:border-gold/40 focus:outline-none transition-colors"
        />
        <textarea
          placeholder="Dates of interest (optional)"
          value={form.message}
          onChange={e => update('message', e.target.value)}
          rows={2}
          className="w-full rounded-md border border-border bg-white/[0.03] px-3 py-2.5 font-sans text-sm text-white placeholder:text-muted/40 focus:border-gold/40 focus:outline-none resize-none transition-colors"
        />
        {state === 'error' && errorMsg && (
          <p className="font-sans text-xs" style={{ color: 'oklch(0.65 0.18 25)' }}>{errorMsg}</p>
        )}
        <button
          type="submit"
          disabled={state === 'loading'}
          className="w-full min-h-[44px] rounded-md bg-gold font-sans text-xs uppercase tracking-[0.1em] text-black hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === 'loading' ? 'Sending…' : 'Send inquiry →'}
        </button>
      </form>
      <p className="mt-3 font-sans text-[10px] text-muted/40 text-center leading-relaxed">
        Demo only — a confirmation email will arrive, no real booking created
      </p>
    </div>
  )
}
