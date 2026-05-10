'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { CodeEmailLookup } from '@/components/booking/CodeEmailLookup'
import { StatusPill } from '@/components/booking/StatusPill'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { formatDateRange, formatPriceDecimals, formatDate } from '@/lib/formatters'
import { buildStatusPageLink } from '@/lib/whatsapp'

type BookingStatus = 'inquiry' | 'confirmed' | 'picked_up' | 'returned' | 'completed' | 'cancelled'

interface BookingData {
  booking_code: string
  status: BookingStatus
  pickup_location: string
  start_at: string
  end_at: string
  days: number
  total_eur: number
  deposit_eur: number
  customer_message?: string
  customer: { full_name: string }
  car: { brand: string; model: string; year: number; slug: string; photos: Array<{url: string; alt: string}> } | null
  transfer_requested?: boolean
  transfer_address?: string | null
  transfer_fee_eur?: number | null
}

const STATUS_HEADLINES: Record<BookingStatus, (data: BookingData) => string> = {
  inquiry:   () => 'We have your request. The owner will be in touch shortly to confirm.',
  confirmed: (d) => {
    const now = new Date()
    const pickup = new Date(d.start_at)
    const daysUntil = Math.ceil((pickup.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntil > 0 ? `Your reservation is confirmed. Pickup in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}.` : 'Your reservation is confirmed. Pickup today.'
  },
  picked_up: () => "You're on the road. Enjoy the coast.",
  returned:  () => 'Vehicle returned. Finalising paperwork.',
  completed: () => 'Thank you for your reservation. We would love to see you again.',
  cancelled: () => 'This reservation has been cancelled.',
}

function NextStepsPanel({ status, booking }: { status: BookingStatus; booking: BookingData }) {
  if (status === 'inquiry') {
    return (
      <div className="rounded-md border border-border bg-graphite p-5 space-y-3">
        <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-gold">What happens next</p>
        <ol className="space-y-2">
          {[
            { text: "We'll WhatsApp or email you to confirm", active: true },
            { text: "At pickup: bring driver's license + passport" },
            { text: "At pickup: payment in person (card or bank transfer)" },
            { text: "We hold your refundable deposit" },
            { text: "Drive away" },
          ].map(({ text, active }, i) => (
            <li key={i} className={`flex gap-3 font-sans text-sm ${active ? 'text-white font-medium' : 'text-muted'}`}>
              <span className="font-medium text-gold shrink-0">{i + 1}.</span>
              {text}
            </li>
          ))}
        </ol>
      </div>
    )
  }

  if (status === 'confirmed') {
    return (
      <div className="rounded-md border border-border bg-graphite p-5 space-y-3">
        <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-gold">What happens next</p>
        <ol className="space-y-2">
          {[
            { text: "We'll WhatsApp or email you to confirm" },
            { text: `At pickup ${formatDate(booking.start_at)}: bring driver's license + passport`, active: true },
            { text: "At pickup: payment in person (card or bank transfer)", active: true },
            { text: "We hold your refundable deposit" },
            { text: "Drive away" },
          ].map(({ text, active }, i) => (
            <li key={i} className={`flex gap-3 font-sans text-sm ${active ? 'text-white font-medium' : 'text-muted'}`}>
              <span className="font-medium text-gold shrink-0">{i + 1}.</span>
              {text}
            </li>
          ))}
        </ol>
      </div>
    )
  }

  if (status === 'picked_up') {
    return (
      <div className="rounded-md border border-border bg-graphite p-5">
        <p className="font-sans text-sm text-muted">
          Currently active until {formatDate(booking.end_at)}.{' '}
          Need to extend? WhatsApp us.
        </p>
      </div>
    )
  }

  if (status === 'returned') {
    return (
      <div className="rounded-md border border-border bg-graphite p-5">
        <p className="font-sans text-sm text-muted">
          The owner is reviewing the return. You will receive a final confirmation shortly.
        </p>
      </div>
    )
  }

  return null
}

interface BookingStatusClientProps {
  code: string
  emailParam?: string
}

export function BookingStatusClient({ code, emailParam }: BookingStatusClientProps) {
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(!!emailParam)
  const [error, setError] = useState('')
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    if (emailParam) {
      fetch('/api/booking/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email: emailParam }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.booking_code) {
            setBooking(data)
            setAuthenticated(true)
          } else {
            setError(data.error ?? 'Could not load booking.')
          }
          setLoading(false)
        })
        .catch(() => {
          setError('Connection error.')
          setLoading(false)
        })
    }
  }, [code, emailParam])

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="font-sans text-sm text-muted">Loading...</div>
    </div>
  }

  if (!authenticated || !booking) {
    return (
      <div className="min-h-screen bg-black py-24">
        <div className="mx-auto max-w-md px-6">
          {error && <p className="mb-4 text-xs font-sans text-danger">{error}</p>}
          <CodeEmailLookup
            initialCode={code}
            title="Verify your booking"
          />
        </div>
      </div>
    )
  }

  const headline = STATUS_HEADLINES[booking.status](booking)
  const waLink = buildStatusPageLink({ bookingCode: booking.booking_code })

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="mx-auto max-w-3xl px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
          {/* Left column */}
          <div className="space-y-8">
            {/* Status + headline */}
            <div className="space-y-4">
              <StatusPill status={booking.status} mode="customer" />
              <h1 className="font-display text-3xl font-light text-white tracking-tight md:text-4xl">
                {headline}
              </h1>
            </div>

            {/* Next steps */}
            <NextStepsPanel status={booking.status} booking={booking} />

            {/* Trip details */}
            <div className="space-y-4">
              <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-gold">Trip details</p>
              <div className="rounded-md border border-border bg-graphite p-5 space-y-3">
                {booking.car && (
                  <div className="flex items-center gap-3 pb-3 border-b border-border">
                    {booking.car.photos?.[0] && (
                      <div className="relative h-14 w-20 overflow-hidden rounded-sm shrink-0">
                        <Image
                          src={booking.car.photos[0].url}
                          alt={booking.car.photos[0].alt}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-sans text-sm font-medium text-white">
                        {booking.car.brand} {booking.car.model}
                      </p>
                      <p className="font-sans text-xs text-muted">{booking.car.year}</p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 text-sm font-sans">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted mb-0.5">Dates</p>
                    <p className="text-white">{formatDateRange(booking.start_at, booking.end_at)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted mb-0.5">Pickup</p>
                    <p className="text-white">{booking.pickup_location}</p>
                    {booking.transfer_requested && booking.transfer_address && (
                      <p className="text-xs text-muted mt-0.5">{booking.transfer_address}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted mb-0.5">Duration</p>
                    <p className="text-white">{booking.days} day{booking.days !== 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted mb-0.5">Estimated total</p>
                    <p className="text-gold tabular-nums">{formatPriceDecimals(booking.total_eur)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted mb-0.5">Deposit at pickup</p>
                    <p className="text-white tabular-nums">{formatPriceDecimals(booking.deposit_eur)}</p>
                  </div>
                  {booking.transfer_requested && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-muted mb-0.5">Custom delivery fee</p>
                      <p className="text-white tabular-nums">
                        {booking.transfer_fee_eur != null
                          ? formatPriceDecimals(booking.transfer_fee_eur)
                          : 'To be confirmed'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Booking code */}
            <div className="rounded-md border border-border bg-graphite p-5 text-center">
              <p className="text-[10px] font-sans uppercase tracking-[0.2em] text-muted mb-2">Booking code</p>
              <p className="font-sans text-2xl font-medium text-white tracking-widest">{booking.booking_code}</p>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-12 rounded-md bg-whatsapp text-white text-sm font-sans font-medium hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="h-4 w-4 fill-white stroke-none" />
              WhatsApp Us
            </a>

            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <p className="text-center text-[11px] font-sans text-muted">
                Reference your booking code {booking.booking_code} in any message.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
