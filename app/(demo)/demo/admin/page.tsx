import type { Metadata } from 'next'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import { formatPrice } from '@/lib/formatters'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Demo Admin Panel — RentalOS',
  description: 'Explore the RentalOS admin panel in demo mode. See how bookings are managed.',
  robots: { index: false },
}

type DemoBooking = {
  id: string
  booking_code: string
  status: string
  start_at: string
  end_at: string
  days: number
  total_eur: number
  deposit_eur: number
  created_at: string
  car: { brand: string; model: string; year: number } | null
  customer: { full_name: string; email: string } | null
}

async function getDemoBookings(): Promise<DemoBooking[]> {
  const { data } = await supabaseAdmin
    .from('bookings')
    .select('id, booking_code, status, start_at, end_at, days, total_eur, deposit_eur, created_at, car:cars(brand, model, year), customer:customers(full_name, email)')
    .eq('is_demo', true)
    .order('created_at', { ascending: false })

  return (data ?? []).map((b) => ({
    ...b,
    car: Array.isArray(b.car) ? (b.car[0] ?? null) : b.car,
    customer: Array.isArray(b.customer) ? (b.customer[0] ?? null) : b.customer,
  })) as DemoBooking[]
}

const STATUS_COLORS: Record<string, string> = {
  inquiry: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
  confirmed: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
  picked_up: 'border-green-500/30 bg-green-500/5 text-green-400',
  returned: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
  completed: 'border-white/20 bg-white/5 text-muted',
  cancelled: 'border-red-500/30 bg-red-500/5 text-red-400',
}

function DisabledTooltipButton({ label }: { label: string }) {
  return (
    <div className="group relative inline-block">
      <button
        disabled
        className="min-h-[32px] rounded-sm border border-border px-3 font-sans text-xs text-muted/40 cursor-not-allowed"
      >
        {label}
      </button>
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 rounded-md
        bg-graphite border border-border px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <p className="font-sans text-[10px] text-muted text-center">Actions disabled in demo mode</p>
      </div>
    </div>
  )
}

export default async function DemoAdminPage() {
  const bookings = await getDemoBookings()

  const inquiries = bookings.filter(b => b.status === 'inquiry').length
  const active = bookings.filter(b => b.status === 'picked_up').length
  const revenue = bookings
    .filter(b => ['confirmed', 'picked_up', 'returned', 'completed'].includes(b.status))
    .reduce((sum, b) => sum + b.total_eur, 0)

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-medium text-white">Admin Panel</h1>
        <span className="font-sans text-xs text-muted rounded-sm border border-border px-2 py-1">Demo mode</span>
      </div>

      {/* Nav tabs (disabled) */}
      <div className="flex gap-1 mb-8 border-b border-border pb-0">
        {['Dashboard', 'Bookings', 'Fleet', 'Settings'].map(tab => (
          <div
            key={tab}
            className={`px-4 py-3 font-sans text-xs uppercase tracking-[0.15em] border-b-2 ${
              tab === 'Dashboard'
                ? 'border-gold text-white'
                : 'border-transparent text-muted/40 cursor-not-allowed'
            }`}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Stats strip */}
      <div className="flex items-stretch divide-x divide-border mb-8">
        <div className="pr-6">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-1.5">Inquiries</p>
          <p className="font-sans text-xl font-medium text-white">{inquiries}</p>
        </div>
        <div className="px-6">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-1.5">Active</p>
          <p className="font-sans text-xl font-medium text-white">{active}</p>
        </div>
        <div className="pl-6">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-1.5">Revenue (demo)</p>
          <p className="font-sans text-xl font-medium text-white tabular-nums">{formatPrice(revenue)}</p>
        </div>
      </div>

      {/* Bookings list */}
      <div>
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted mb-4">Demo bookings</p>
        {bookings.length === 0 && (
          <div className="rounded-sm border border-dashed border-border p-10 text-center">
            <p className="font-sans text-sm text-muted mb-2">Demo data not loaded yet.</p>
            <p className="font-sans text-xs text-muted/60 mb-6">
              Run <code className="font-mono text-gold">supabase/demo-seed.sql</code> to populate sample bookings.
            </p>
            <Link href="/pricing" className="inline-flex items-center min-h-[40px] rounded-md bg-gold px-6 font-sans text-sm font-medium text-black hover:opacity-90 transition-opacity">
              Start free trial — your data, not sample data
            </Link>
          </div>
        )}
        <div className="divide-y divide-border">
          {bookings.map(booking => (
            <div key={booking.id} className="py-4">
              <div className="flex flex-wrap items-start gap-3 justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-sans text-xs font-medium text-white font-mono">{booking.booking_code}</span>
                    <span className={`rounded-sm border px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.1em] ${STATUS_COLORS[booking.status] ?? 'border-border text-muted'}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="font-sans text-sm text-muted">
                    {booking.car ? `${booking.car.brand} ${booking.car.model} ${booking.car.year}` : 'Vehicle'}
                  </p>
                  <p className="font-sans text-xs text-muted/60">
                    {booking.customer?.full_name ?? 'Customer'} ·{' '}
                    {new Date(booking.start_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} →{' '}
                    {new Date(booking.end_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ·{' '}
                    {formatPrice(booking.total_eur)}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {booking.status === 'inquiry' && (
                    <>
                      <DisabledTooltipButton label="Confirm" />
                      <DisabledTooltipButton label="Cancel" />
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <DisabledTooltipButton label="Mark picked up" />
                  )}
                  {booking.status === 'picked_up' && (
                    <DisabledTooltipButton label="Mark returned" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 border-t border-white/5 pt-12">
        <p className="font-sans text-sm text-muted mb-4">
          This is what your real admin panel looks like. With your fleet, your bookings, your data.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/pricing" className="inline-flex items-center min-h-[40px] rounded-md bg-gold px-6 font-sans text-sm font-medium text-black hover:opacity-90 transition-opacity">
            Start free trial
          </Link>
          <Link href="/demo/fleet" className="inline-flex items-center min-h-[40px] rounded-md border border-white/10 px-6 font-sans text-sm text-white hover:border-gold/30 transition-colors">
            Browse demo fleet
          </Link>
        </div>
      </div>
    </div>
  )
}
