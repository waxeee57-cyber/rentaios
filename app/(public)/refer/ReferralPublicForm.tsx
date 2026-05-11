'use client'

import { useState } from 'react'

export function ReferralPublicForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [link, setLink] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/referrals/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setLink(data.link)
      setState('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setState('error')
    }
  }

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="mx-auto max-w-lg px-6">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-3">Referral program</p>
        <h1 className="font-display text-4xl font-bold text-gray-900 mb-4 tracking-tight">Refer a rental business.</h1>
        <p className="font-sans text-sm leading-relaxed text-muted mb-12 max-w-sm">
          When they subscribe, you both get one month free.
          Enter your email to get your unique referral link.
        </p>

        {state !== 'success' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full min-h-[48px] rounded-md border border-border bg-white px-4
                font-sans text-sm text-gray-900 placeholder:text-muted
                focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/20
                transition-colors"
            />
            {state === 'error' && (
              <p className="font-sans text-sm text-red-400">{errorMsg}</p>
            )}
            <button
              type="submit"
              disabled={state === 'loading'}
              className="w-full min-h-[48px] rounded-md bg-gold font-sans text-sm font-medium
                text-white hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {state === 'loading' ? 'Getting your link...' : 'Get my referral link'}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <p className="font-sans text-sm text-muted">Your referral link:</p>
            <div className="flex gap-2">
              <input
                readOnly
                value={link}
                className="flex-1 min-h-[48px] rounded-md border border-border bg-surface px-4
                  font-sans text-sm text-gold font-mono focus:outline-none"
              />
              <button
                onClick={() => navigator.clipboard.writeText(link)}
                className="min-h-[48px] px-5 rounded-md border border-gold/30 font-sans text-xs
                  text-gold hover:bg-gold hover:text-white transition-colors"
              >
                Copy
              </button>
            </div>
            <p className="font-sans text-xs text-muted">
              We also sent it to {email}. Share it with any rental business owner.
            </p>
          </div>
        )}

        <div className="mt-16 border-t border-border pt-10">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-4">How it works</p>
          <div className="space-y-4">
            {[
              'Share your unique referral link with a rental business owner.',
              'They visit the link, start a free trial, and subscribe.',
              'You both get one month free — automatically applied.',
            ].map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="font-sans text-xs text-gold/50 mt-0.5 shrink-0">{i + 1}.</span>
                <p className="font-sans text-sm text-muted">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
