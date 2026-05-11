'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export function DemoConversionBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div className="hidden sm:flex fixed bottom-0 inset-x-0 z-50 items-center justify-between gap-6 bg-black/95 border-t border-white/10 px-8 py-4 backdrop-blur-sm">
      <p className="font-sans text-sm text-white">Like what you see?</p>
      <div className="flex items-center gap-3">
        <Link
          href="/onboarding"
          className="inline-flex items-center min-h-[44px] rounded-md bg-gold px-6 font-sans text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          Get this for your business →
        </Link>
        <Link
          href="/demo/admin"
          className="inline-flex items-center min-h-[44px] rounded-md border border-white/10 px-6 font-sans text-sm text-white transition-colors hover:border-gold/30"
        >
          View admin panel →
        </Link>
      </div>
    </div>
  )
}
