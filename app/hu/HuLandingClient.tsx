'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

type Cadence = 'monthly' | 'annual'

const TIERS = [
  {
    key: 'starter',
    name: 'Starter',
    monthly: 79,
    annual: 790,
    annualSave: 158,
    items: 'Legfeljebb 5 tétel',
    features: ['Korlátlan foglalás', 'E-mail értesítések', 'Admin felület', '14 napos ingyenes próba'],
    highlight: false,
  },
  {
    key: 'growth',
    name: 'Growth',
    monthly: 149,
    annual: 1490,
    annualSave: 298,
    items: 'Legfeljebb 20 tétel',
    features: ['Minden, ami a Starterben', 'Átadás/szállítás kezelés', 'Heti riport e-mail', 'Ajánlói program'],
    highlight: true,
  },
  {
    key: 'pro',
    name: 'Pro',
    monthly: 249,
    annual: 2490,
    annualSave: 498,
    items: 'Korlátlan tétel',
    features: ['Minden, ami a Growth-ban', 'Egyéni domain beállítás', 'Egyéni design és arculat', 'Elsőbbségi támogatás'],
    highlight: false,
  },
]

function RoiCalcHu() {
  const [bookingValue, setBookingValue] = useState(300)
  const RENTALOS_YEAR = 790
  const MISSED = [1, 2, 5]

  function fmt(n: number): string {
    return '€' + Math.round(n).toLocaleString('de-DE')
  }

  const monthsToPayback = Math.ceil(RENTALOS_YEAR / bookingValue)

  return (
    <div className="max-w-xl">
      <h3 className="mb-6 font-display text-2xl font-bold text-gray-900">
        Mennyibe kerül egy kihagyott foglalás?
      </h3>

      <div className="mb-8">
        <label className="block font-sans text-xs uppercase tracking-[0.15em] text-muted mb-3">
          Átlagos foglalás értéke
        </label>
        <div className="flex items-center gap-4">
          <span className="font-display text-3xl font-bold text-gold leading-none min-w-[5rem]">
            {fmt(bookingValue)}
          </span>
          <input
            type="range"
            min={50}
            max={2000}
            step={50}
            value={bookingValue}
            onChange={(e) => setBookingValue(parseInt(e.target.value))}
            className="flex-1 accent-[oklch(0.78_0.12_65)]"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="py-2.5 px-4 text-left font-sans text-[10px] uppercase tracking-[0.15em] text-muted">Kihagyott / hó</th>
              <th className="py-2.5 px-4 text-right font-sans text-[10px] uppercase tracking-[0.15em] text-muted">Veszteség / év</th>
              <th className="py-2.5 px-4 text-right font-sans text-[10px] uppercase tracking-[0.15em] text-gold">RentalOS / év</th>
              <th className="py-2.5 px-4 text-right font-sans text-[10px] uppercase tracking-[0.15em] text-muted">ROI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MISSED.map((n) => {
              const lost = n * bookingValue * 12
              const roi = Math.round(lost / RENTALOS_YEAR)
              return (
                <tr key={n}>
                  <td className="py-3 px-4 font-sans text-sm text-gray-900">{n}</td>
                  <td className="py-3 px-4 text-right font-sans text-sm text-muted">{fmt(lost)}</td>
                  <td className="py-3 px-4 text-right font-sans text-sm text-gold">€790</td>
                  <td className="py-3 px-4 text-right font-sans text-sm font-medium text-gray-900">{roi}×</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 rounded-md bg-gold/5 border border-gold/20 px-4 py-3 font-sans text-sm text-gray-900 leading-relaxed">
        {fmt(bookingValue)}-os foglalásnál egyetlen visszaszerzett foglalás fedezi a RentalOS{' '}
        <strong>{monthsToPayback} hónap</strong>
        {monthsToPayback === 1 ? 'nyi' : 'nyi'} előfizetését.
      </p>
    </div>
  )
}

export function HuLandingClient() {
  const [cadence, setCadence] = useState<Cadence>('monthly')

  return (
    <>
      {/* ── Árak / Pricing teaser ── */}
      <section id="arak" className="bg-slate-900 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Árak</p>
            <h2 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
              Válaszd ki, hogyan kezdesz
            </h2>
          </div>

          {/* Toggle */}
          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 p-1">
              {(['monthly', 'annual'] as Cadence[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCadence(c)}
                  className={`px-5 py-2 rounded font-sans text-xs uppercase tracking-[0.1em] transition-colors ${
                    cadence === c ? 'bg-gold text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c === 'monthly' ? 'Havi' : 'Éves — 2 hónap ingyen'}
                </button>
              ))}
            </div>
          </div>

          {/* Tier cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-start">
            {TIERS.map(({ key, name, monthly, annual, annualSave, items, features, highlight }) => {
              const price = cadence === 'annual' ? annual : monthly
              const perMonth = cadence === 'annual' ? Math.round(annual / 12) : null

              return (
                <div
                  key={key}
                  className={`flex flex-col rounded-xl border ${
                    highlight
                      ? 'border-2 border-gold bg-white shadow-2xl shadow-gold/15 relative z-10 p-10'
                      : 'border-gray-200 bg-white shadow-sm p-8'
                  }`}
                >
                  {highlight && (
                    <div className="mb-4 self-start">
                      <span className="rounded-sm bg-gold px-3 py-1 font-sans text-[10px] uppercase tracking-[0.15em] text-white">
                        Legnépszerűbb
                      </span>
                    </div>
                  )}

                  <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">{name}</p>
                  <p className="mt-1 font-sans text-xs text-muted/60">{items}</p>

                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-extrabold text-gray-900">€{price}</span>
                    <span className="font-sans text-sm text-muted">{cadence === 'annual' ? '/ év' : '/ hó'}</span>
                  </div>
                  {perMonth && (
                    <p className="mt-1 font-sans text-xs text-muted">
                      €{perMonth}/hó egyenértéke{' '}
                      <span className="rounded-sm bg-gold/10 px-1.5 py-0.5 text-gold">Megtakarítás €{annualSave}</span>
                    </p>
                  )}

                  <ul className="my-8 flex flex-1 flex-col gap-3">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5">
                        <Check className="h-3.5 w-3.5 shrink-0 text-gold" />
                        <span className="font-sans text-sm text-muted">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/hu/pricing"
                    className={`inline-flex items-center justify-center rounded-md px-6 py-3 font-sans text-xs uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                      highlight
                        ? 'bg-gold text-white hover:opacity-90'
                        : 'border border-border text-muted hover:border-gold/40 hover:text-gray-900'
                    }`}
                  >
                    Ingyenes próba →
                  </Link>
                </div>
              )
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/hu/pricing"
              className="inline-flex items-center gap-1.5 font-sans text-sm text-gold underline-offset-4 hover:underline"
            >
              Részletes árak megtekintése →
            </Link>
          </div>
        </div>
      </section>

      {/* ── ROI kalkulátor ── */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10">
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">ROI kalkulátor</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900">
              Megéri-e a RentalOS?
            </h2>
          </div>
          <RoiCalcHu />
        </div>
      </section>
    </>
  )
}
