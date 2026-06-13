'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const INPUT = 'w-full bg-black border border-border rounded-md px-3 py-3 font-sans text-sm text-white placeholder:text-muted/40 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold'
const SELECT = 'w-full bg-black border border-border rounded-md px-3 py-3 font-sans text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold'
const LABEL = 'block font-sans text-xs text-muted mb-1.5'

export default function NewCarPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    category: 'sport',
    daily_price_eur: '',
    deposit_eur: '',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 2,
    license_plate: '',
    description: '',
  })

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const res = await fetch('/api/admin/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        year: Number(form.year),
        daily_price_eur: Number(form.daily_price_eur),
        deposit_eur: Number(form.deposit_eur),
        seats: Number(form.seats),
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Something went wrong')
      setSaving(false)
      return
    }

    router.push(`/admin/cars?expand=${json.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/cars" className="flex items-center justify-center h-10 w-10 text-muted hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl font-medium text-white">New Car</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Required */}
        <div className="rounded-md border border-border bg-graphite p-4 space-y-4">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold">Required</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="car-brand" className={LABEL}>Brand</label>
              <input id="car-brand" required value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Lamborghini" className={INPUT} />
            </div>
            <div>
              <label htmlFor="car-model" className={LABEL}>Model</label>
              <input id="car-model" required value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="Huracán" className={INPUT} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="car-year" className={LABEL}>Year</label>
              <input id="car-year" required type="number" min={2000} max={2035} value={form.year} onChange={(e) => set('year', e.target.value)} className={INPUT} />
            </div>
            <div>
              <label htmlFor="car-category" className={LABEL}>Category</label>
              <select id="car-category" value={form.category} onChange={(e) => set('category', e.target.value)} className={SELECT}>
                <option value="sport">Sport</option>
                <option value="suv">SUV</option>
                <option value="sedan">Sedan</option>
                <option value="convertible">Convertible</option>
                <option value="luxury">Luxury</option>
                <option value="mpv">Egyterű (MPV)</option>
                <option value="furgon">Furgon</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="car-price" className={LABEL}>Daily price (€)</label>
              <input id="car-price" required type="number" min={1} value={form.daily_price_eur} onChange={(e) => set('daily_price_eur', e.target.value)} placeholder="1200" className={INPUT} />
            </div>
            <div>
              <label htmlFor="car-deposit" className={LABEL}>Deposit (€)</label>
              <input id="car-deposit" required type="number" min={1} value={form.deposit_eur} onChange={(e) => set('deposit_eur', e.target.value)} placeholder="15000" className={INPUT} />
            </div>
          </div>
        </div>

        {/* Optional */}
        <div className="rounded-md border border-border bg-graphite p-4 space-y-4">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold">Optional</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="car-transmission" className={LABEL}>Transmission</label>
              <select id="car-transmission" value={form.transmission} onChange={(e) => set('transmission', e.target.value)} className={SELECT}>
                <option>Automatic</option>
                <option>Manual</option>
              </select>
            </div>
            <div>
              <label htmlFor="car-fuel" className={LABEL}>Fuel</label>
              <select id="car-fuel" value={form.fuel} onChange={(e) => set('fuel', e.target.value)} className={SELECT}>
                <option>Petrol</option>
                <option>Diesel</option>
                <option>Hybrid</option>
                <option>Electric</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="car-seats" className={LABEL}>Seats</label>
              <input id="car-seats" type="number" min={1} max={9} value={form.seats} onChange={(e) => set('seats', e.target.value)} className={INPUT} />
            </div>
            <div>
              <label htmlFor="car-plate" className={LABEL}>License plate</label>
              <input id="car-plate" value={form.license_plate} onChange={(e) => set('license_plate', e.target.value)} placeholder="1234 ABC" className={INPUT} />
            </div>
          </div>

          <div>
            <label htmlFor="car-description" className={LABEL}>Description</label>
            <textarea
              id="car-description"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="Describe the car…"
              className="w-full bg-black border border-border rounded-md px-3 py-3 font-sans text-sm text-white placeholder:text-muted/40 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold resize-none"
            />
          </div>
        </div>

        <p className="font-sans text-xs text-muted">
          New car will be set to <span className="text-white">Hidden</span> — make it Available after adding photos.
        </p>

        {error && <p className="font-sans text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full min-h-[52px] rounded-md bg-gold text-black font-sans text-sm font-medium uppercase tracking-[0.15em] hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? 'Adding…' : 'Add Car'}
        </button>
      </form>
    </div>
  )
}
