'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  const reject = () => {
    localStorage.setItem('cookie-consent', 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] border-t border-border bg-graphite"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <p className="font-sans text-xs leading-relaxed text-muted max-w-xl">
          Csak a működéshez szükséges sütiket használunk. Nincs nyomkövető vagy hirdetési süti.{' '}
          <Link href="/cookies" className="text-gold hover:underline underline-offset-4">
            Süti tájékoztató
          </Link>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={reject}
            className="rounded-sm border border-border px-4 py-2 font-sans text-xs uppercase tracking-[0.12em] text-muted hover:text-white transition-colors"
          >
            Elutasítom
          </button>
          <button
            onClick={accept}
            className="rounded-sm bg-gold px-4 py-2 font-sans text-xs uppercase tracking-[0.12em] text-black hover:bg-gold-hover transition-colors"
          >
            Elfogadom
          </button>
        </div>
      </div>
    </div>
  )
}
