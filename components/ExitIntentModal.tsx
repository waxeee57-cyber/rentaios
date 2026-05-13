'use client'

import { useEffect, useState, useRef } from 'react'
import { X } from 'lucide-react'
import { usePathname } from 'next/navigation'

const SESSION_KEY = 'exit_intent_shown'

export function ExitIntentModal() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const triggered = useRef(false)
  const pathname = usePathname()

  const isHu = pathname.startsWith('/hu')

  useEffect(() => {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY)) return

    function handleMouseLeave(e: MouseEvent) {
      if (triggered.current) return
      if (e.clientY <= 0) {
        triggered.current = true
        setOpen(true)
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [])

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, '1')
    setOpen(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'exit_intent', locale: isHu ? 'hu' : 'en' }),
      })
      if (res.ok) {
        setStatus('done')
        sessionStorage.setItem(SESSION_KEY, '1')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-2xl">
        <button
          onClick={dismiss}
          aria-label={isHu ? 'Bezárás' : 'Close'}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <X className="h-4 w-4" />
        </button>

        {status === 'done' ? (
          <div className="text-center py-4">
            <p className="font-display text-2xl font-bold text-gray-900 mb-2">
              {isHu ? 'Köszönjük!' : 'Thanks!'}
            </p>
            <p className="font-sans text-sm text-muted">
              {isHu
                ? 'Értesítünk, ha új funkciók vagy ajánlatok érkeznek.'
                : "We'll reach out when there's something worth sharing."}
            </p>
          </div>
        ) : (
          <>
            <p id="exit-modal-title" className="font-display text-2xl font-bold text-gray-900 mb-2">
              {isHu ? 'Mielőtt elmész…' : 'Before you go…'}
            </p>
            <p className="font-sans text-sm leading-relaxed text-muted mb-6">
              {isHu
                ? 'Iratkozz fel, és értesítünk az akciókról, új funkciókról és tippekről bérlési vállalkozásod automatizálásához.'
                : 'Get notified about updates, promotions, and tips for automating your rental business. No spam.'}
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isHu ? 'E-mail cím' : 'Your email'}
                className="h-11 rounded-md border border-border bg-gray-50 px-4 font-sans text-sm text-gray-900 placeholder:text-muted/60 focus:border-gold/50 focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="h-11 rounded-md bg-gold font-sans text-xs font-medium uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {status === 'loading'
                  ? (isHu ? 'Küldés…' : 'Sending…')
                  : (isHu ? 'Feliratkozás' : 'Notify me')}
              </button>
              {status === 'error' && (
                <p className="font-sans text-xs text-center text-red-500">
                  {isHu ? 'Hiba történt. Próbáld újra.' : 'Something went wrong. Please try again.'}
                </p>
              )}
            </form>
            <button
              onClick={dismiss}
              className="mt-4 w-full font-sans text-xs text-muted transition-colors hover:text-gray-900"
            >
              {isHu ? 'Nem, köszönöm' : 'No thanks'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
