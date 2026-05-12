'use client'

import 'driver.js/dist/driver.css'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RotateCcw, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/formatters'
import { cn } from '@/lib/utils'

type BookingStatus = 'inquiry' | 'confirmed' | 'picked_up' | 'returned' | 'completed' | 'cancelled'
type CarStatus = 'available' | 'maintenance'
type AdminTab = 'dashboard' | 'bookings' | 'fleet' | 'settings'

const DEMO_STATS = {
  inquiries: 2,
  active: 2,
  upcoming: 2,
  monthlyRevenue: 12480,
}

const DEMO_BOOKINGS = [
  {
    id: 'b1',
    booking_code: 'CSL-2501',
    status: 'inquiry' as BookingStatus,
    start_at: '2026-05-28',
    end_at: '2026-06-02',
    days: 5,
    total_eur: 1750,
    car_label: 'Porsche 911 Carrera 2023',
    customer_name: 'James Harrington',
  },
  {
    id: 'b2',
    booking_code: 'CSL-2499',
    status: 'inquiry' as BookingStatus,
    start_at: '2026-06-10',
    end_at: '2026-06-14',
    days: 4,
    total_eur: 1160,
    car_label: 'Mercedes AMG C63 2022',
    customer_name: 'Sofia Delacroix',
  },
  {
    id: 'b3',
    booking_code: 'CSL-2496',
    status: 'confirmed' as BookingStatus,
    start_at: '2026-05-25',
    end_at: '2026-05-30',
    days: 5,
    total_eur: 1975,
    car_label: 'BMW M4 Competition 2023',
    customer_name: 'Marcus Antonescu',
  },
  {
    id: 'b4',
    booking_code: 'CSL-2491',
    status: 'confirmed' as BookingStatus,
    start_at: '2026-06-01',
    end_at: '2026-06-06',
    days: 5,
    total_eur: 1575,
    car_label: 'Audi RS6 Avant 2023',
    customer_name: 'Ekaterina Volkov',
  },
  {
    id: 'b5',
    booking_code: 'CSL-2488',
    status: 'picked_up' as BookingStatus,
    start_at: '2026-05-18',
    end_at: '2026-05-22',
    days: 4,
    total_eur: 1420,
    car_label: 'Audi RS6 Avant 2023',
    customer_name: 'Lena Petrov',
  },
  {
    id: 'b6',
    booking_code: 'CSL-2484',
    status: 'picked_up' as BookingStatus,
    start_at: '2026-05-19',
    end_at: '2026-05-24',
    days: 5,
    total_eur: 1250,
    car_label: 'Porsche Cayenne GTS 2022',
    customer_name: 'Alexander Müller',
  },
  {
    id: 'b7',
    booking_code: 'CSL-2479',
    status: 'returned' as BookingStatus,
    start_at: '2026-05-10',
    end_at: '2026-05-15',
    days: 5,
    total_eur: 1750,
    car_label: 'Porsche 911 Carrera 2023',
    customer_name: 'Isabelle Fontaine',
  },
  {
    id: 'b8',
    booking_code: 'CSL-2471',
    status: 'completed' as BookingStatus,
    start_at: '2026-05-01',
    end_at: '2026-05-06',
    days: 5,
    total_eur: 2100,
    car_label: 'Lamborghini Urus 2022',
    customer_name: 'Viktor Kozlov',
  },
]

const DEMO_CARS = [
  {
    id: 'c1',
    brand: 'Porsche',
    model: '911 Carrera',
    year: 2023,
    category: 'Sports',
    daily_price_eur: 350,
    deposit_eur: 2000,
    status: 'available' as CarStatus,
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 4,
    license_plate: 'MA-7723-PK',
  },
  {
    id: 'c2',
    brand: 'Mercedes',
    model: 'AMG C63',
    year: 2022,
    category: 'Sports',
    daily_price_eur: 290,
    deposit_eur: 1800,
    status: 'available' as CarStatus,
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    license_plate: 'MA-4411-RC',
  },
  {
    id: 'c3',
    brand: 'BMW',
    model: 'M4 Competition',
    year: 2023,
    category: 'Sports',
    daily_price_eur: 395,
    deposit_eur: 2200,
    status: 'available' as CarStatus,
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 4,
    license_plate: 'MA-9234-TG',
  },
  {
    id: 'c4',
    brand: 'Audi',
    model: 'RS6 Avant',
    year: 2023,
    category: 'Estate',
    daily_price_eur: 315,
    deposit_eur: 1900,
    status: 'available' as CarStatus,
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    license_plate: 'MA-5567-HJ',
  },
  {
    id: 'c5',
    brand: 'Porsche',
    model: 'Cayenne GTS',
    year: 2022,
    category: 'SUV',
    daily_price_eur: 280,
    deposit_eur: 1600,
    status: 'maintenance' as CarStatus,
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    license_plate: 'MA-3321-MN',
  },
]

const STATUS_COLORS: Record<BookingStatus, string> = {
  inquiry: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-600',
  confirmed: 'border-blue-500/30 bg-blue-500/5 text-blue-600',
  picked_up: 'border-green-500/30 bg-green-500/5 text-green-600',
  returned: 'border-purple-500/30 bg-purple-500/5 text-purple-600',
  completed: 'border-border bg-surface text-muted',
  cancelled: 'border-red-500/30 bg-red-500/5 text-red-600',
}

const ADMIN_TABS: { key: AdminTab; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'fleet', label: 'Fleet' },
  { key: 'settings', label: 'Settings' },
]

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
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
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 rounded-md bg-gray-800 border border-gray-700 px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <p className="font-sans text-[10px] text-gray-300 text-center">Actions disabled in demo mode</p>
      </div>
    </div>
  )
}

export function DemoAdminClient() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')

  useEffect(() => {
    if (localStorage.getItem('rentalos_demo_tour_completed')) return

    void import('driver.js').then(({ driver }) => {
      const driverObj = driver({
        showProgress: true,
        allowClose: true,
        nextBtnText: 'Next →',
        prevBtnText: '← Back',
        doneBtnText: 'Start exploring',
        steps: [
          {
            popover: {
              title: 'Welcome to the RentalOS admin',
              description:
                'This is a live demo with sample data — feel free to explore. We&apos;ll walk you through the key features.',
              side: 'over' as const,
              align: 'center' as const,
            },
          },
          {
            element: '#demo-stats',
            popover: {
              title: 'Dashboard',
              description:
                'Track revenue, active bookings, and fleet utilization at a glance. Everything updates in real time.',
              side: 'bottom' as const,
              align: 'start' as const,
            },
          },
          {
            element: '#demo-bookings',
            popover: {
              title: 'Bookings',
              description:
                'Every inquiry, confirmed booking, pickup, and return — managed from one screen. Confirm or cancel in one click.',
              side: 'top' as const,
              align: 'start' as const,
            },
          },
          {
            element: '#demo-fleet',
            popover: {
              title: 'Fleet',
              description:
                'Add cars, set availability windows, upload photos, and configure pricing tiers. Per-car or per-category rates.',
              side: 'top' as const,
              align: 'start' as const,
            },
          },
          {
            element: '#demo-settings',
            popover: {
              title: 'Settings',
              description:
                'Connect Stripe, configure email templates, manage delivery zones, and set your business hours.',
              side: 'top' as const,
              align: 'start' as const,
            },
          },
          {
            element: '#demo-cta',
            popover: {
              title: 'Like what you see?',
              description:
                'Start your 14-day free trial — no card required. Your admin panel, your brand, live in 48 hours.',
              side: 'top' as const,
              align: 'center' as const,
            },
          },
        ],
        onDestroyed: () => {
          localStorage.setItem('rentalos_demo_tour_completed', '1')
        },
      })

      setTimeout(() => driverObj.drive(), 600)
    })
  }, [])

  function scrollTo(id: string, tab: AdminTab) {
    setActiveTab(tab)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function restartTour() {
    localStorage.removeItem('rentalos_demo_tour_completed')
    window.location.reload()
  }

  return (
    <div>
      {/* Admin-style header */}
      <div className="border-b border-border">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-base font-extrabold tracking-[-0.02em] text-gray-900">
              CostaSol
            </span>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold">Admin</span>
          </div>
          <span className="rounded-sm border border-border px-2 py-1 font-sans text-xs text-muted">
            Demo mode
          </span>
        </div>
      </div>

      {/* Admin nav tabs */}
      <div className="overflow-x-auto border-b border-border">
        <div className="mx-auto flex max-w-5xl px-4">
          {ADMIN_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => scrollTo(`demo-${tab.key}`, tab.key)}
              className={cn(
                'whitespace-nowrap border-b-2 px-4 py-3.5 font-sans text-xs uppercase tracking-[0.15em] transition-colors',
                activeTab === tab.key
                  ? 'border-gold text-gray-900'
                  : 'border-transparent text-muted hover:text-gray-900'
              )}
            >
              {tab.label}
            </button>
          ))}
          <div className="ml-auto flex items-center">
            <button
              onClick={restartTour}
              className="flex items-center gap-1.5 px-3 py-3.5 font-sans text-[10px] text-muted/50 transition-colors hover:text-muted"
            >
              <RotateCcw className="h-3 w-3" />
              Restart tour
            </button>
          </div>
        </div>
      </div>

      {/* Page content — all sections stacked */}
      <div className="mx-auto max-w-5xl space-y-20 px-4 py-8">

        {/* ── Dashboard ── */}
        <section id="demo-dashboard">
          <h2 className="mb-6 font-display text-2xl font-medium text-gray-900">Dashboard</h2>

          <div className="mb-6 rounded-sm border border-gold/20 bg-gold/5 px-4 py-3">
            <p className="font-sans text-xs text-gold/80">
              Everything you see here runs automatically. Your job is to confirm bookings. That&apos;s it.
            </p>
          </div>

          {/* Stats strip */}
          <div id="demo-stats" className="mb-8 flex items-stretch divide-x divide-border">
            <div className="pr-6">
              <p className="mb-1.5 font-sans text-[10px] uppercase tracking-[0.2em] text-muted">
                Inquiries
              </p>
              <p className="font-sans text-xl font-medium text-gray-900">{DEMO_STATS.inquiries}</p>
            </div>
            <div className="px-6">
              <p className="mb-1.5 font-sans text-[10px] uppercase tracking-[0.2em] text-muted">Active</p>
              <p className="font-sans text-xl font-medium text-gray-900">{DEMO_STATS.active}</p>
            </div>
            <div className="px-6">
              <p className="mb-1.5 font-sans text-[10px] uppercase tracking-[0.2em] text-muted">
                Upcoming
              </p>
              <p className="font-sans text-xl font-medium text-gray-900">{DEMO_STATS.upcoming}</p>
            </div>
            <div className="pl-6">
              <p className="mb-1.5 font-sans text-[10px] uppercase tracking-[0.2em] text-muted">
                This month
              </p>
              <p className="tabular-nums font-sans text-xl font-medium text-gray-900">
                {formatPrice(DEMO_STATS.monthlyRevenue)}
              </p>
            </div>
          </div>

          {/* Inquiry alert */}
          <div className="mb-6 flex items-center justify-between rounded-md border border-gold/40 bg-gold/5 px-4 py-3.5">
            <p className="font-sans text-sm text-gray-900">
              <span className="font-medium text-gold">{DEMO_STATS.inquiries}</span> inquiries waiting
              for a response
            </p>
            <ArrowRight className="h-4 w-4 shrink-0 text-gold" />
          </div>

          {/* Quick actions */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => scrollTo('demo-bookings', 'bookings')}
              className="flex min-h-[44px] items-center justify-center rounded-md border border-gold/40 px-4 py-2 font-sans text-xs uppercase tracking-[0.15em] text-gold transition-colors hover:bg-gold hover:text-white"
            >
              View all bookings
            </button>
            <button
              onClick={() => scrollTo('demo-fleet', 'fleet')}
              className="flex min-h-[44px] items-center justify-center rounded-md border border-border px-4 py-2 font-sans text-xs uppercase tracking-[0.15em] text-muted transition-colors hover:border-gold/30 hover:text-gray-900"
            >
              Manage fleet
            </button>
          </div>
        </section>

        {/* ── Bookings ── */}
        <section id="demo-bookings">
          <h2 className="mb-6 font-display text-2xl font-medium text-gray-900">Bookings</h2>
          <p className="mb-4 font-sans text-[10px] uppercase tracking-[0.2em] text-muted">
            All bookings
          </p>
          <div className="divide-y divide-border">
            {DEMO_BOOKINGS.map((booking) => (
              <div key={booking.id} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-3">
                      <span className="font-mono font-sans text-xs font-medium text-gray-900">
                        {booking.booking_code}
                      </span>
                      <span
                        className={cn(
                          'rounded-sm border px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.1em]',
                          STATUS_COLORS[booking.status]
                        )}
                      >
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="font-sans text-sm text-muted">{booking.car_label}</p>
                    <p className="font-sans text-xs text-muted/60">
                      {booking.customer_name} · {fmtDate(booking.start_at)} → {fmtDate(booking.end_at)}{' '}
                      · {formatPrice(booking.total_eur)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
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
        </section>

        {/* ── Fleet ── */}
        <section id="demo-fleet">
          <h2 className="mb-6 font-display text-2xl font-medium text-gray-900">Fleet</h2>
          <div className="space-y-3">
            {DEMO_CARS.map((car) => (
              <div
                key={car.id}
                className="rounded-md border border-border p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="font-sans text-sm font-medium text-gray-900">
                        {car.brand} {car.model} {car.year}
                      </span>
                      <span className="rounded-sm border border-border px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-[0.1em] text-muted">
                        {car.category}
                      </span>
                      <span
                        className={cn(
                          'rounded-sm border px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-[0.1em]',
                          car.status === 'available'
                            ? 'border-green-500/30 bg-green-500/5 text-green-600'
                            : 'border-yellow-500/30 bg-yellow-500/5 text-yellow-600'
                        )}
                      >
                        {car.status}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-muted">
                      {formatPrice(car.daily_price_eur)}/day · Deposit {formatPrice(car.deposit_eur)} ·{' '}
                      {car.transmission} · {car.fuel} · {car.seats} seats
                    </p>
                    <p className="mt-0.5 font-mono font-sans text-[11px] text-muted/50">
                      {car.license_plate}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <DisabledTooltipButton label="Edit" />
                    <DisabledTooltipButton label="Availability" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Settings ── */}
        <section id="demo-settings">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl font-medium text-gray-900">Settings</h2>
            <span className="rounded-sm border border-border px-2 py-1 font-sans text-xs text-muted/60">
              Read-only in demo
            </span>
          </div>

          <div className="space-y-8">
            {/* Business info */}
            <div>
              <p className="mb-4 font-sans text-[10px] uppercase tracking-[0.2em] text-muted">
                Business
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Business name', value: 'CostaSol Car Rent' },
                  { label: 'Admin email', value: 'admin@costasol.es' },
                  { label: 'Phone', value: '+34 952 100 200' },
                  { label: 'Location', value: 'Marbella, Spain' },
                ].map((f) => (
                  <div key={f.label} className="flex flex-col gap-1.5">
                    <label className="font-sans text-xs uppercase tracking-[0.12em] text-muted">
                      {f.label}
                    </label>
                    <div className="flex h-10 items-center rounded-md border border-border bg-surface px-3 font-sans text-sm text-muted/60">
                      {f.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div>
              <p className="mb-4 font-sans text-[10px] uppercase tracking-[0.2em] text-muted">
                Payment (Stripe)
              </p>
              <div className="rounded-md border border-green-500/20 bg-green-500/5 px-4 py-3">
                <p className="font-sans text-sm font-medium text-green-700">Stripe connected</p>
                <p className="mt-0.5 font-mono font-sans text-xs text-muted/60">
                  sk_live_••••••••••••••••••••••
                </p>
              </div>
            </div>

            {/* Notifications */}
            <div>
              <p className="mb-4 font-sans text-[10px] uppercase tracking-[0.2em] text-muted">
                Email notifications
              </p>
              <div className="space-y-2">
                {[
                  'Booking confirmation emails to customers',
                  'Admin alerts for new inquiries',
                  'Weekly revenue report (Monday 09:00)',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="text-xs text-green-600">✓</span>
                    <span className="font-sans text-sm text-muted">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery zones */}
            <div>
              <p className="mb-4 font-sans text-[10px] uppercase tracking-[0.2em] text-muted">
                Delivery zones
              </p>
              <div className="flex flex-wrap gap-2">
                {['Marbella', 'AGP Airport', 'Puerto Banús', 'Estepona', 'Sotogrande'].map((zone) => (
                  <span
                    key={zone}
                    className="rounded-sm border border-border px-2.5 py-1 font-sans text-xs text-muted"
                  >
                    {zone}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <div id="demo-cta" className="rounded-md border border-gold/40 bg-surface p-8">
          <h2 className="mb-2 font-display text-2xl font-bold text-gray-900">
            Like what you see?
          </h2>
          <p className="mb-6 font-sans text-sm leading-relaxed text-muted">
            Start your 14-day free trial — no card required.
            <br />
            Your admin panel, your brand, live in 48 hours.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/pricing"
              className="inline-flex min-h-[44px] items-center rounded-md bg-gold px-6 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Start free trial →
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex min-h-[44px] items-center rounded-md border border-border px-6 font-sans text-sm text-muted transition-colors hover:border-gold/30 hover:text-gray-900"
            >
              Done-for-you setup →
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
