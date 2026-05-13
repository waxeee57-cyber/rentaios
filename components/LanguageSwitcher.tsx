'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function LanguageSwitcher() {
  const pathname = usePathname()

  const isHu = pathname.startsWith('/hu')
  const enHref = isHu ? (pathname === '/hu' ? '/' : pathname.replace(/^\/hu/, '')) : pathname
  const huHref = isHu ? pathname : `/hu${pathname === '/' ? '' : pathname}`

  return (
    <div className="flex items-center gap-0 rounded border border-border overflow-hidden">
      <Link
        href={enHref}
        className={`px-2.5 py-1 font-sans text-[10px] uppercase tracking-[0.1em] transition-colors ${
          !isHu ? 'bg-gold text-white' : 'text-muted hover:text-gray-900'
        }`}
      >
        EN
      </Link>
      <Link
        href={huHref}
        className={`px-2.5 py-1 font-sans text-[10px] uppercase tracking-[0.1em] transition-colors border-l border-border ${
          isHu ? 'bg-gold text-white' : 'text-muted hover:text-gray-900'
        }`}
      >
        HU
      </Link>
    </div>
  )
}
