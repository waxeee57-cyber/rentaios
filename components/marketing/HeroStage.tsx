/* HeroStage — three-layer product demo (decorative, aria-hidden) */
/* Layer 1: blurred dashboard overview (background) */
/* Layer 2: booking inbox (middle) */
/* Layer 3: cycling toast notifications (foreground) */

const INBOX = [
  { id: 'new',       label: 'NEW INQUIRY',    vehicle: 'Toyota RAV4',  customer: 'M. Torres',    dates: '12–15 Jun', total: '€620', isNew: true  },
  { id: 'confirmed', label: 'CONFIRMED ✓',    vehicle: 'BMW 3 Series', customer: 'S. Laurent',   dates: '10–13 Jun', total: '€480', isNew: false },
  { id: 'picked_up', label: 'PICKED UP',      vehicle: 'Seat Ibiza',   customer: 'K. Andersen',  dates: '08–11 Jun', total: '€210', isNew: false },
  { id: 'returning', label: 'RETURNING TODAY',vehicle: 'VW Golf',      customer: 'P. Müller',    dates: '05–08 Jun', total: '€295', isNew: false },
]

const BADGE_CLASS: Record<string, string> = {
  new:       'bg-blue-50 text-blue-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  picked_up: 'bg-slate-100 text-slate-600',
  returning: 'bg-amber-50 text-amber-700',
}

const TOASTS = [
  { vehicle: 'Toyota RAV4',  customer: 'M. Torres',   amount: '€620', delay: '0s'    },
  { vehicle: 'BMW 3 Series', customer: 'S. Laurent',  amount: '€480', delay: '4.5s'  },
  { vehicle: 'Honda CB500',  customer: 'A. Kowalski', amount: '€185', delay: '9s'    },
  { vehicle: 'Audi Q5',      customer: 'R. Fernandez',amount: '€730', delay: '13.5s' },
]

function DashboardLayer() {
  return (
    <div
      className="dashboard-layer absolute inset-0 overflow-hidden rounded-xl"
      style={{ transform: 'perspective(900px) rotateY(-8deg) rotateX(2deg)' }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-3 border-b border-gray-200/60 bg-gray-100/90 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]/70" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]/70" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]/70" />
        </div>
        <p className="flex-1 text-center font-sans text-[10px] font-medium text-gray-400">
          Dashboard Overview
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-px bg-gray-100/80">
        {[
          { label: 'Active',   value: '12' },
          { label: 'Revenue',  value: '€4.2k' },
          { label: 'Fleet',    value: '8 / 14' },
        ].map((s) => (
          <div key={s.label} className="bg-white/80 px-3 py-3 text-center">
            <p className="font-sans text-[15px] font-bold tabular-nums text-gray-700">{s.value}</p>
            <p className="font-sans text-[9px] uppercase tracking-widest text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Calendar grid hint */}
      <div className="bg-white/70 px-3 py-2">
        <p className="mb-1.5 font-sans text-[9px] uppercase tracking-widest text-gray-400">May 2026</p>
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: 35 }).map((_, i) => {
            const day = i - 2
            const active = [4, 5, 6, 10, 11, 12, 17, 18, 22, 23, 24, 25].includes(day)
            const today  = day === 11
            return (
              <div
                key={i}
                className={`h-3.5 w-full rounded-[2px] ${
                  day < 1 || day > 31 ? 'bg-transparent' :
                  today  ? 'bg-blue-600/70' :
                  active ? 'bg-blue-200/80' :
                           'bg-gray-100'
                }`}
              />
            )
          })}
        </div>
      </div>

      {/* Sidebar hint bars */}
      <div className="space-y-1.5 bg-white/60 px-3 py-2">
        {[80, 55, 35, 65].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-300/60" />
            <div className="h-1.5 rounded-full bg-gray-200" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function InboxLayer() {
  return (
    <div className="inbox-layer overflow-hidden rounded-xl border border-white/10 shadow-[0_28px_60px_rgba(0,0,0,0.55),0_8px_24px_rgba(0,0,0,0.30)]">
      {/* Window chrome */}
      <div className="flex items-center gap-3 border-b border-gray-200/80 bg-gray-100 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <p className="flex-1 text-center font-sans text-[11px] font-medium text-gray-500">
          Bookings · Today
        </p>
        <p className="font-sans text-[10px] text-gray-400">Mon 11 May</p>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-2">
        <span className="font-sans text-[11px] font-medium text-gray-700">All bookings</span>
        <span className="rounded-sm bg-blue-600/10 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-blue-600">4</span>
      </div>

      {/* Booking rows */}
      <div className="divide-y divide-gray-50 bg-white">
        {INBOX.map((b) => (
          <div key={b.id} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              {b.isNew ? (
                <span className="inline-flex items-center gap-1 rounded-sm bg-blue-600/10 px-1.5 py-[3px] font-sans text-[9px] font-bold uppercase tracking-[0.1em] text-blue-600">
                  <span className="animate-pulse-dot h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-600" />
                  NEW INQUIRY
                </span>
              ) : (
                <span className={`inline-block rounded-sm px-1.5 py-[3px] font-sans text-[9px] font-semibold uppercase tracking-[0.1em] ${BADGE_CLASS[b.id]}`}>
                  {b.label}
                </span>
              )}
              <p className="mt-1 truncate font-sans text-[12.5px] font-semibold text-gray-900">{b.vehicle}</p>
              <p className="font-sans text-[10.5px] text-gray-400">{b.customer} · {b.dates}</p>
            </div>
            <p className="flex-shrink-0 pt-4 font-sans text-[13px] font-bold tabular-nums text-gray-900">{b.total}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2.5">
        <span className="font-sans text-[10px] text-gray-400">Total today</span>
        <span className="font-sans text-[11px] font-semibold tabular-nums text-gray-700">€1,605</span>
      </div>
    </div>
  )
}

function ToastLayer() {
  return (
    <>
      {/* Cycling toasts — CSS-only, no JS */}
      <div className="toast-container pointer-events-none absolute bottom-6 right-0 w-[240px]">
        {TOASTS.map((t, i) => (
          <div
            key={i}
            className="toast-item absolute inset-0 flex items-center gap-3 rounded-lg border border-white/20 bg-gray-900/95 px-3.5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            style={{ animationDelay: t.delay }}
          >
            <span className="animate-pulse-dot h-2 w-2 flex-shrink-0 rounded-full bg-amber-400" />
            <div className="min-w-0 flex-1">
              <p className="font-sans text-[11px] font-semibold text-white/90">{t.vehicle}</p>
              <p className="font-sans text-[10px] text-white/50">{t.customer} · {t.amount}</p>
            </div>
            <span className="flex-shrink-0 rounded-sm bg-amber-400/20 px-1.5 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider text-amber-300">
              New
            </span>
          </div>
        ))}
      </div>

      {/* Reduced-motion fallback: static badge */}
      <div className="toast-static pointer-events-none absolute bottom-6 right-0 flex items-center gap-2 rounded-lg border border-white/20 bg-gray-900/95 px-3.5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-amber-400" />
        <p className="font-sans text-[11px] font-semibold text-white/90">12 new today</p>
      </div>
    </>
  )
}

export function HeroStage() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none w-full"
    >
      {/* Outer aspect container — enough height for the layers */}
      <div className="relative mx-auto w-full max-w-[480px] lg:mx-0" style={{ height: '420px' }}>

        {/* Layer 1 — blurred dashboard (background) */}
        <div
          className="absolute inset-x-4 inset-y-0 opacity-40"
          style={{ filter: 'blur(2px)', zIndex: 0 }}
        >
          <DashboardLayer />
        </div>

        {/* Layer 2 — booking inbox (middle) */}
        <div
          className="absolute inset-x-0 inset-y-4"
          style={{ zIndex: 1 }}
        >
          <InboxLayer />
        </div>

        {/* Layer 3 — toast notifications (foreground) */}
        <div
          className="absolute inset-0"
          style={{ zIndex: 2 }}
        >
          <ToastLayer />
        </div>

      </div>
    </div>
  )
}
