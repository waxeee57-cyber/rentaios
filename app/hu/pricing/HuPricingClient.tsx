'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'

type Cadence = 'monthly' | 'annual'

const TIERS = [
  {
    key: 'starter',
    name: 'Starter',
    monthly: 29_900,
    annual: 299_900,
    annualSave: 58_900,
    items: 'Legfeljebb 5 tétel',
    features: ['Korlátlan foglalás', 'E-mail értesítések', 'Admin felület', '14 napos ingyenes próba'],
    highlight: false,
  },
  {
    key: 'growth',
    name: 'Growth',
    monthly: 58_900,
    annual: 589_900,
    annualSave: 116_900,
    items: 'Legfeljebb 20 tétel',
    features: ['Minden, ami a Starterben', 'Átadás/szállítás kezelés', 'Heti riport e-mail', 'Ajánlói program'],
    highlight: true,
  },
  {
    key: 'pro',
    name: 'Pro',
    monthly: 98_900,
    annual: 989_900,
    annualSave: 196_900,
    items: 'Korlátlan tétel',
    features: ['Minden, ami a Growth-ban', 'Egyéni domain beállítás', 'Egyéni design és arculat', 'Elsőbbségi támogatás'],
    highlight: false,
  },
]

function formatHuf(n: number): string {
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'HUF',
    maximumFractionDigits: 0,
  }).format(n)
}

export function HuPricingClient() {
  const [cadence, setCadence] = useState<Cadence>('monthly')

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <section className="border-b border-gray-100 py-16 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <p className="mb-3 font-sans text-xs uppercase tracking-[0.2em] text-gold">Árak</p>
          <h1 className="mb-4 font-display text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Egyszerű, átlátható árazás
          </h1>
          <p className="font-sans text-base text-muted">14 napos ingyenes próba. Nem kell bankkártya.</p>
        </div>
      </section>

      {/* Toggle + cards */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10 flex justify-center">
            <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 p-1">
              {(['monthly', 'annual'] as Cadence[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCadence(c)}
                  className={`px-5 py-2 rounded font-sans text-xs uppercase tracking-[0.1em] transition-colors ${
                    cadence === c ? 'bg-gold text-white' : 'text-muted hover:text-gray-900'
                  }`}
                >
                  {c === 'monthly' ? 'Havi' : 'Éves — 2 hónap ingyen'}
                </button>
              ))}
            </div>
          </div>

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

                  <div className="mt-4 flex flex-wrap items-baseline gap-1.5">
                    <span className="font-display text-3xl font-extrabold text-gray-900">{formatHuf(price)}</span>
                    <span className="font-sans text-sm text-muted">{cadence === 'annual' ? '/ év' : '/ hó'}</span>
                  </div>
                  {perMonth && (
                    <p className="mt-1 font-sans text-xs text-muted">
                      {formatHuf(perMonth)}/hó egyenértéke{' '}
                      <span className="rounded-sm bg-gold/10 px-1.5 py-0.5 text-gold">Megtakarítás {formatHuf(annualSave)}</span>
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
                    href="/pricing"
                    className={`inline-flex items-center justify-center rounded-md px-6 py-3 font-sans text-xs uppercase tracking-[0.1em] transition-colors ${
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

          <p className="mt-6 text-center font-sans text-xs text-muted">
            Az árak HUF-ban értendők, ÁFA nélkül.{' '}
            <Link href="/pricing" className="text-gold hover:underline underline-offset-4">
              Euróban is elérhető →
            </Link>
          </p>
        </div>
      </section>

      {/* One-time options */}
      <section className="border-t border-gray-100 py-12">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-8 text-center font-sans text-xs uppercase tracking-[0.2em] text-muted">Egyszeri lehetőségek</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { name: 'Sablon', price: '179 900 Ft', desc: 'Teljes forráskód, kereskedelmi licenc. Telepítsd magad.' },
              { name: 'Csináljuk helyetted', price: '269 900 Ft', desc: 'Mi telepítünk és konfigurálunk mindent 48 órán belül.' },
              { name: 'Egyéni domain', price: '69 900 Ft', desc: 'Saját domain beállítása Starter vagy Growth csomaghoz.' },
            ].map(({ name, price, desc }) => (
              <div key={name} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">{name}</p>
                <p className="mt-2 font-display text-2xl font-bold text-gray-900">{price}</p>
                <p className="font-sans text-xs text-muted">Egyszeri</p>
                <p className="mt-3 font-sans text-sm leading-relaxed text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-100 py-12">
        <div className="mx-auto max-w-3xl px-6">
          <p className="mb-8 text-center font-sans text-xs uppercase tracking-[0.2em] text-muted">Gyakori kérdések</p>
          <div className="flex flex-col gap-6">
            {[
              { q: 'Mennyi ideig tart a beállítás?', a: 'Önkiszolgáló csomagoknál egy óra alatt élesíthetsz. A „Csináljük helyetted" szolgáltatásnál 48 óra.' },
              { q: 'Van ingyenes próbaidőszak?', a: 'Igen — minden előfizetéses csomag tartalmaz 14 napos ingyenes próbát. Nem kell bankkártya.' },
              { q: 'Használhatom a saját domainnevemet?', a: 'Igen. A Pro csomag tartalmazza. Starter és Growth esetén 69 900 Ft egyszer.' },
              { q: 'Milyen bérlési típusokat támogat?', a: 'Autóbérlés, jachtbérlés, villabérlés, motorbérlés — bármilyen időalapú tárgyat bérlő vállalkozás.' },
            ].map(({ q, a }) => (
              <div key={q}>
                <p className="mb-2 font-sans text-sm font-medium text-gray-900">{q}</p>
                <p className="font-sans text-sm leading-relaxed text-muted">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-gray-50 py-12">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="mb-4 font-display text-2xl font-bold text-gray-900">Próbáld ki ingyen</h2>
          <p className="mb-6 font-sans text-sm text-muted">14 nap, bankkártya nélkül.</p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/pricing"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md bg-gold px-8 py-3 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Kezdés <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-[44px] items-center rounded-md border border-border px-8 py-3 font-sans text-sm font-medium text-muted transition-colors hover:border-gold/40 hover:text-gray-900"
            >
              Kérdésem van
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
