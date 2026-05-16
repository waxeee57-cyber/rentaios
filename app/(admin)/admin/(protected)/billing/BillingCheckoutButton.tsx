'use client'

import { useState } from 'react'

export function BillingCheckoutButton({
  plan,
  highlight,
}: {
  plan: 'starter' | 'growth' | 'pro'
  highlight?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Unable to start checkout. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`w-full min-h-[40px] rounded-md font-sans text-xs uppercase tracking-[0.1em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          highlight
            ? 'bg-gold text-black hover:opacity-90'
            : 'border border-gold/40 text-gold hover:bg-gold hover:text-black'
        }`}
      >
        {loading ? 'Redirecting…' : 'Start 14-day free trial'}
      </button>
      {error && <p className="mt-2 font-sans text-xs text-danger">{error}</p>}
    </div>
  )
}
