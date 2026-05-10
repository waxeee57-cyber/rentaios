import Link from 'next/link'

interface LogoProps {
  height?: number
  className?: string
}

export function Logo({ className }: LogoProps) {
  const name = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? 'RentalOS'
  return (
    <Link href="/" aria-label={`${name} — Home`} className={className}>
      <span
        className="font-serif tracking-wide"
        style={{ color: '#C8A96B', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 600 }}
      >
        {name}
      </span>
    </Link>
  )
}
