'use client'

import { useState } from 'react'

export function WaitlistForm({ vertical, source }: { vertical: string; source: string }) {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/waitlist/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, vertical, source_page: source }),
    }).catch(() => null)
    setDone(true)
  }

  if (done) {
    return <p className="font-sans text-sm text-gold">You're on the list. We'll be in touch.</p>
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 max-w-sm">
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 h-11 rounded-md border border-border bg-black/40 px-3 font-sans text-sm text-white placeholder:text-muted/40 focus:border-gold/40 focus:outline-none"
      />
      <button
        type="submit"
        className="min-h-[44px] rounded-md border border-gold/40 px-5 font-sans text-xs uppercase tracking-[0.15em] text-gold hover:bg-gold hover:text-black transition-colors"
      >
        Join waitlist
      </button>
    </form>
  )
}
