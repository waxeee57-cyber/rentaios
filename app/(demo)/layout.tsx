import Link from 'next/link'

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Demo banner */}
      <div className="sticky top-0 z-50 border-b border-gold/20 bg-gold/10 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-display text-lg font-bold text-gold shrink-0">
              RentalOS
            </Link>
            <div className="hidden sm:flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
              <p className="font-sans text-xs text-gold">
                Live demo — data resets daily
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 rounded-md bg-gold px-4 py-1.5
              font-sans text-xs font-medium text-white hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Start free trial
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
      {children}
    </div>
  )
}
