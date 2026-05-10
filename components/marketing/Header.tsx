'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/demo', label: 'Demo' },
  { href: '/sell', label: 'Buy template' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo height={56} className="animate-logo-reveal" />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'nav-link font-sans text-xs uppercase tracking-[0.15em] transition-colors duration-200',
                pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href.replace('/#features', '')))
                  ? 'text-gold'
                  : 'text-muted hover:text-white'
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/pricing"
            className="rounded-md bg-gold px-5 py-2 font-sans text-xs font-medium uppercase tracking-[0.1em] text-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Start free trial
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="flex h-11 w-11 items-center justify-center text-muted md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-nav"
        className={cn(
          'border-t border-border bg-black transition-all duration-200 md:hidden',
          open ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        )}
      >
        <nav className="flex flex-col px-6 py-4 gap-4">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                'font-sans text-sm uppercase tracking-[0.15em] py-1 transition-colors duration-200',
                pathname === l.href ? 'text-gold' : 'text-muted hover:text-white'
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className="mt-1 inline-flex items-center justify-center rounded-md bg-gold px-5 py-2.5 font-sans text-xs font-medium uppercase tracking-[0.1em] text-black transition-opacity hover:opacity-90"
          >
            Start free trial
          </Link>
        </nav>
      </div>
    </header>
  )
}
