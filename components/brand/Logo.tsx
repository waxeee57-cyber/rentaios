import Link from 'next/link'

interface LogoProps {
  height?: number
  className?: string
}

export function Logo({ className }: LogoProps) {
  const name = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? 'RentalOS'
  return (
    <Link href="/" aria-label={`${name} — Home`} className={className}>
      <div className="flex flex-col leading-none">
        <span
          className="font-serif tracking-wide"
          style={{ color: '#C8A96B', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 600 }}
        >
          {name}
        </span>
        <span
          className="tracking-widest uppercase"
          style={{ color: '#C8A96B', fontFamily: 'DM Sans, sans-serif', fontSize: '0.55rem', fontWeight: 400, letterSpacing: '0.2em', opacity: 0.8 }}
        >
          Booking System
        </span>
      </div>
    </Link>
  )
}
