type Booking = {
  id: string
  label: string
  vehicle: string
  customer: string
  dates: string
  total: string
  badgeClass: string
}

const BOOKINGS: Booking[] = [
  {
    id: 'new',
    label: 'NEW INQUIRY',
    vehicle: 'Toyota RAV4',
    customer: 'M. Torres',
    dates: '12–15 Jun',
    total: '€620',
    badgeClass: 'bg-gold/10 text-gold',
  },
  {
    id: 'confirmed',
    label: 'CONFIRMED ✓',
    vehicle: 'BMW 3 Series',
    customer: 'S. Laurent',
    dates: '10–13 Jun',
    total: '€480',
    badgeClass: 'bg-emerald-50 text-emerald-700',
  },
  {
    id: 'picked_up',
    label: 'PICKED UP',
    vehicle: 'Seat Ibiza',
    customer: 'K. Andersen',
    dates: '08–11 Jun',
    total: '€210',
    badgeClass: 'bg-slate-100 text-slate-600',
  },
  {
    id: 'returning',
    label: 'RETURNING TODAY',
    vehicle: 'VW Golf',
    customer: 'P. Müller',
    dates: '05–08 Jun',
    total: '€295',
    badgeClass: 'bg-amber-50 text-amber-700',
  },
]

export function AdminMockPanel() {
  return (
    <div
      aria-hidden="true"
      className="admin-mock-tilt pointer-events-none select-none w-full max-w-[340px] mx-auto lg:mx-0"
    >
      <div className="overflow-hidden rounded-xl border border-white/10 shadow-[0_28px_60px_rgba(0,0,0,0.6),0_8px_24px_rgba(0,0,0,0.35)]">

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
          <span className="rounded-sm bg-gold/10 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-gold">
            4
          </span>
        </div>

        {/* Booking rows */}
        <div className="divide-y divide-gray-50 bg-white">
          {BOOKINGS.map((b) => (
            <div key={b.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                {b.id === 'new' ? (
                  <span className="inline-flex items-center gap-1 rounded-sm bg-gold/10 px-1.5 py-[3px] font-sans text-[9px] font-bold uppercase tracking-[0.1em] text-gold">
                    <span className="animate-pulse-dot h-[5px] w-[5px] flex-shrink-0 rounded-full bg-gold" />
                    NEW INQUIRY
                  </span>
                ) : (
                  <span
                    className={`inline-block rounded-sm px-1.5 py-[3px] font-sans text-[9px] font-semibold uppercase tracking-[0.1em] ${b.badgeClass}`}
                  >
                    {b.label}
                  </span>
                )}
                <p className="mt-1 truncate font-sans text-[12.5px] font-semibold text-gray-900">
                  {b.vehicle}
                </p>
                <p className="font-sans text-[10.5px] text-gray-400">
                  {b.customer} · {b.dates}
                </p>
              </div>
              <p className="flex-shrink-0 pt-4 font-sans text-[13px] font-bold tabular-nums text-gray-900">
                {b.total}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2.5">
          <span className="font-sans text-[10px] text-gray-400">Total today</span>
          <span className="font-sans text-[11px] font-semibold tabular-nums text-gray-700">€1,605</span>
        </div>

      </div>
    </div>
  )
}
