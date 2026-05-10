import Image from 'next/image'
import Link from 'next/link'
import logoSrc from '@/public/brand/costasol_logo_transparent.png'

interface LogoProps {
  height?: number
  className?: string
}

export function Logo({ height = 40, className }: LogoProps) {
  const name = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? 'RentalOS'
  return (
    <Link href="/" aria-label={`${name} — Home`} className={className}>
      <Image
        src={logoSrc}
        alt={name}
        height={height}
        style={{ width: 'auto' }}
        priority
      />
    </Link>
  )
}
