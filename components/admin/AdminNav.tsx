'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

const links = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/bookings', label: 'Bookings', exact: false },
  { href: '/admin/cars', label: 'Fleet', exact: false },
  { href: '/admin/clients', label: 'Clients', exact: false },
  { href: '/admin/outreach', label: 'Outreach', exact: false },
  { href: '/admin/waitlist', label: 'Waitlist', exact: false },
  { href: '/admin/reseller', label: 'Reseller', exact: false },
  { href: '/admin/analytics', label: 'Analytics', exact: false },
  { href: '/admin/messages', label: 'Messages', exact: false },
  { href: '/admin/settings', label: 'Settings', exact: false },
  { href: '/admin/billing', label: 'Billing', exact: false },
]

export function AdminNav() {
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await fetch('/api/admin/chat/conversations')
        if (res.ok) {
          const data = await res.json()
          const total = (data.conversations ?? []).reduce(
            (sum: number, c: { unread_admin?: number }) => sum + (c.unread_admin ?? 0),
            0
          )
          setUnread(total)
        }
      } catch {}
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <nav className="border-b border-border bg-graphite/50 overflow-x-auto">
      <div className="mx-auto flex max-w-5xl px-4">
        {links.map((l) => {
          const isActive = l.exact ? pathname === l.href : pathname.startsWith(l.href)
          const isMessages = l.href === '/admin/messages'
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'relative whitespace-nowrap px-4 py-3.5 font-sans text-xs uppercase tracking-[0.15em] border-b-2 transition-colors',
                isActive
                  ? 'border-gold text-white'
                  : 'border-transparent text-muted hover:text-white'
              )}
            >
              {l.label}
              {isMessages && unread > 0 && (
                <span className="absolute right-1 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 font-sans text-[9px] font-bold text-white leading-none">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
