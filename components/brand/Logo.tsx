import Link from 'next/link'

interface LogoProps {
  className?: string
  dark?: boolean
}

export function Logo({ className, dark = false }: LogoProps) {
  const _raw = (process.env.NEXT_PUBLIC_BUSINESS_NAME ?? '').trim()
  const name = (_raw && !_raw.includes('http') && !_raw.includes('.') && _raw.length <= 30)
    ? _raw
    : 'RentalOS'
  return (
    <Link href="/" aria-label={`${name} — Home`} className={className}>
      <span className={`font-display text-2xl font-extrabold tracking-[-0.02em] ${dark ? 'text-white' : 'text-gold'}`}>
        {name}
      </span>
    </Link>
  )
}
