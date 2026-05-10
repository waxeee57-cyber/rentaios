import Link from 'next/link'

type Tab = 'fleet' | 'admin'

const TABS: { key: Tab; label: string; href: string }[] = [
  { key: 'fleet', label: 'Fleet', href: '/demo/fleet' },
  { key: 'admin', label: 'Admin panel', href: '/demo/admin' },
]

export function DemoTabs({ active }: { active: Tab }) {
  return (
    <div className="flex gap-0 border-b border-white/5 mb-8">
      {TABS.map(tab => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`px-5 py-3 font-sans text-xs uppercase tracking-[0.15em] border-b-2 transition-colors ${
            active === tab.key
              ? 'border-gold text-white'
              : 'border-transparent text-muted hover:text-white'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
