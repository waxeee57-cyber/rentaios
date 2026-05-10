'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function DemoError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[demo error]', error.digest ?? error.message)
  }, [error])

  return (
    <div className="mx-auto max-w-5xl px-6 py-32 text-center">
      <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-4">Demo</p>
      <h1 className="font-display text-3xl font-light text-white mb-4">
        Demo temporarily unavailable
      </h1>
      <p className="font-sans text-sm text-muted mb-8 max-w-md mx-auto">
        The demo is initialising. This usually resolves within a few seconds.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={reset}
          className="inline-flex items-center min-h-[44px] rounded-md border border-white/10 px-8 font-sans text-sm text-white hover:border-gold/30 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/pricing"
          className="inline-flex items-center min-h-[44px] rounded-md bg-gold px-8 font-sans text-sm font-medium text-black hover:opacity-90 transition-opacity"
        >
          Start free trial
        </Link>
      </div>
    </div>
  )
}
