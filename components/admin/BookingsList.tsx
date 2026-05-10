'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { formatDistanceToNow, differenceInCalendarDays } from 'date-fns'
import { formatPrice, formatDate, formatDateRange } from '@/lib/formatters'
import { StatusPill } from '@/components/booking/StatusPill'
import { BookingDetail } from './BookingDetail'
import { cn } from '@/lib/utils'

type BookingStatus = 'inquiry' | 'confirmed' | 'picked_up' | 'returned' | 'completed' | 'cancelled'

interface BookingRow {
  id: string
  booking_code: string
  status: BookingStatus
  pickup_location: string
  start_at: string
  end_at: string
  days: number
  total_eur: number
  deposit_eur: number
  customer_message: string | null
  admin_notes: string | null
  license_doc_url: string | null
  id_doc_url: string | null
  return_notes: string | null
  source: string
  created_at: string
  updated_at: string
  status_history: Array<{ status: string; at: string; by: string }>
  transfer_requested: boolean
  transfer_address: string | null
  transfer_fee_eur: number | null
  car: { brand: string; model: string; year: number; slug: string } | null
  customer: { id: string; full_name: string; email: string; phone: string | null; country: string | null } | null
}

const FILTERS = [
  { key: 'inquiries',     label: 'New inquiries',       statusKey: 'inquiry' },
  { key: 'upcoming',      label: 'Upcoming',            statusKey: 'confirmed' },
  { key: 'today_pickups', label: "Today's pickups",     statusKey: null },
  { key: 'today_returns', label: "Today's returns",     statusKey: null },
  { key: 'active',        label: 'Active',              statusKey: 'picked_up' },
  { key: 'awaiting',      label: 'Awaiting completion', statusKey: 'returned' },
  { key: 'all',           label: 'All',                 statusKey: null },
  { key: 'cancelled',     label: 'Cancelled',           statusKey: 'cancelled' },
]

function isStaleInquiry(booking: BookingRow): boolean {
  if (booking.status !== 'inquiry') return false
  const created = new Date(booking.created_at)
  return Date.now() - created.getTime() > 2 * 60 * 60 * 1000
}

function isNewInquiry(booking: BookingRow): boolean {
  if (booking.status !== 'inquiry') return false
  const created = new Date(booking.created_at)
  return Date.now() - created.getTime() < 60 * 60 * 1000
}

interface BookingsListProps {
  bookings: BookingRow[]
  counts: Record<string, number>
  currentFilter: string
  selectedId?: string
}

export function BookingsList({ bookings, counts, currentFilter, selectedId: initialSelected }: BookingsListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [expandedId, setExpandedId] = useState<string | undefined>(initialSelected)

  const setFilter = (f: string) => {
    const p = new URLSearchParams(searchParams.toString())
    p.set('filter', f)
    p.delete('booking')
    router.push(`${pathname}?${p.toString()}`)
  }

  const toggleExpand = (id: string) => {
    const next = expandedId === id ? undefined : id
    setExpandedId(next)
    const p = new URLSearchParams(searchParams.toString())
    if (next) p.set('booking', next)
    else p.delete('booking')
    router.replace(`${pathname}?${p.toString()}`, { scroll: false })
  }

  const hasStaleInquiries = bookings.some(isStaleInquiry)

  return (
    <>
      {/* Filter chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map(({ key, label, statusKey }) => {
          const count = statusKey ? counts[statusKey] ?? 0 : null
          const isActive = currentFilter === key
          const stale = key === 'inquiries' && hasStaleInquiries

          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-[10px] font-sans uppercase tracking-[0.12em] transition-colors',
                isActive
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-border text-muted hover:border-gold/40 hover:text-white'
              )}
            >
              {label}
              {count !== null && count > 0 && (
                <span className={cn(
                  'rounded-sm px-1.5 py-0.5 text-[9px] font-medium',
                  isActive ? 'bg-gold/20 text-gold' : 'bg-white/10 text-muted'
                )}>
                  {count}
                </span>
              )}
              {stale && (
                <span className="h-1.5 w-1.5 rounded-full bg-danger" aria-label="Stale — follow up needed" />
              )}
            </button>
          )
        })}
      </div>

      {/* List */}
      {bookings.length === 0 ? (
        <div className="py-16 text-center font-sans text-sm text-muted">
          No bookings in this category.
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((b) => {
            const stale = isStaleInquiry(b)
            const isNew = isNewInquiry(b)
            const isExpanded = expandedId === b.id
            const daysUntilPickup = differenceInCalendarDays(new Date(b.start_at), new Date())

            return (
              <div
                key={b.id}
                className={cn(
                  'rounded-md border bg-graphite transition-all duration-150',
                  isExpanded ? 'border-gold/30' : 'border-border hover:border-gold/20'
                )}
              >
                {/* Row */}
                <button
                  className="w-full text-left px-4 py-4"
                  onClick={() => toggleExpand(b.id)}
                  aria-expanded={isExpanded}
                  aria-label={`${b.booking_code} — ${isExpanded ? 'collapse' : 'expand'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-sans text-xs font-medium tracking-widest text-white">
                          {b.booking_code}
                        </span>
                        <StatusPill status={b.status} mode="admin" />
                        {b.transfer_requested && (
                          <span className="rounded-sm border border-gold/60 px-1.5 py-0.5 text-[9px] font-sans uppercase tracking-wider text-gold">
                            Transfer
                          </span>
                        )}
                        {isNew && (
                          <span className="rounded-sm bg-gold/20 border border-gold/40 px-1.5 py-0.5 text-[9px] font-sans uppercase tracking-wider text-gold">
                            New
                          </span>
                        )}
                        {b.source === 'manual' && (
                          <span className="rounded-sm bg-white/5 px-1.5 py-0.5 text-[9px] font-sans uppercase tracking-wider text-muted">
                            manual
                          </span>
                        )}
                      </div>
                      <p className="font-sans text-sm text-white truncate">
                        {b.car?.brand} {b.car?.model} {b.car?.year}
                      </p>
                      <p className="font-sans text-xs text-muted">
                        {b.customer?.full_name} · {formatDateRange(b.start_at, b.end_at)} · {b.pickup_location}
                      </p>
                    </div>

                    <div className="text-right shrink-0 flex flex-col gap-1">
                      <p className="font-sans text-sm font-medium text-gold tabular-nums">
                        {formatPrice(b.total_eur)}
                      </p>
                      <p className="font-sans text-xs text-muted">{b.days}d</p>
                    </div>
                  </div>

                  {/* Status hints */}
                  <div className="mt-2">
                    {b.status === 'inquiry' && (
                      <p className={cn('font-sans text-[11px]', stale ? 'text-danger' : 'text-muted')}>
                        Received {formatDistanceToNow(new Date(b.created_at), { addSuffix: true })}
                        {stale && ' — follow up needed'}
                      </p>
                    )}
                    {b.status === 'confirmed' && daysUntilPickup >= 0 && (
                      <p className="font-sans text-[11px] text-muted">
                        Pickup in {daysUntilPickup} day{daysUntilPickup !== 1 ? 's' : ''}
                        {' '}· {formatDate(b.start_at)}
                      </p>
                    )}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-border">
                    <BookingDetail
                      booking={b}
                      onStatusChange={() => router.refresh()}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
