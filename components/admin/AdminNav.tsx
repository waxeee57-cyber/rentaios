'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/bookings', label: 'Bookings', exact: false },
  { href: '/admin/cars', label: 'Cars', exact: false },
  { href: '/admin/settings', label: 'Settings', exact: false },
  { href: '/admin/billing', label: 'Billing', exact: false },
]

export function AdminNav() {
  const pathname = usePathname()
  return (
    <nav className="border-b border-border bg-graphite/50 overflow-x-auto">
      <div className="mx-auto flex max-w-5xl px-4">
        {links.map((l) => {
          const isActive = l.exact ? pathname === l.href : pathname.startsWith(l.href)
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'whitespace-nowrap px-4 py-3.5 font-sans text-xs uppercase tracking-[0.15em] border-b-2 transition-colors',
                isActive
                  ? 'border-gold text-white'
                  : 'border-transparent text-muted hover:text-white'
              )}
            >
              {l.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
