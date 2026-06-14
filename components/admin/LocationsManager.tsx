'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export interface LocationRow {
  id: string
  name: string
  slug: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  phone: string | null
  is_active: boolean
  sort_order: number
}

const INPUT =
  'w-full h-11 rounded-md border border-border bg-black px-3 font-sans text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold'
const LABEL = 'block text-[10px] font-sans uppercase tracking-[0.15em] text-muted mb-1'

export function LocationsManager({ locations: initial }: { locations: LocationRow[] }) {
  const router = useRouter()
  const [locations, setLocations] = useState<LocationRow[]>(initial)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', city: '', address: '', phone: '', sort_order: '0' })

  async function createLocation(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          city: form.city || null,
          address: form.address || null,
          phone: form.phone || null,
          sort_order: Number(form.sort_order) || 0,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Could not create location.')
        return
      }
      setLocations((prev) => [...prev, json as LocationRow])
      setForm({ name: '', city: '', address: '', phone: '', sort_order: '0' })
      router.refresh()
    } catch {
      setError('Connection error.')
    } finally {
      setCreating(false)
    }
  }

  async function patchLocation(id: string, updates: Partial<LocationRow>) {
    setError('')
    const res = await fetch(`/api/admin/locations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Could not update location.')
      return
    }
    setLocations((prev) => prev.map((l) => (l.id === id ? (json as LocationRow) : l)))
    router.refresh()
  }

  return (
    <div className="space-y-8">
      {error && <p className="font-sans text-xs text-danger">{error}</p>}

      {/* Create form */}
      <form onSubmit={createLocation} className="rounded-lg border border-border bg-graphite p-5">
        <p className="mb-4 font-sans text-xs uppercase tracking-[0.15em] text-gold">New location</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="loc-name">Name *</label>
            <input id="loc-name" className={INPUT} value={form.name} required
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL} htmlFor="loc-city">City</label>
            <input id="loc-city" className={INPUT} value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL} htmlFor="loc-address">Address</label>
            <input id="loc-address" className={INPUT} value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL} htmlFor="loc-phone">Phone</label>
            <input id="loc-phone" className={INPUT} value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL} htmlFor="loc-sort">Sort order</label>
            <input id="loc-sort" type="number" className={INPUT} value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} />
          </div>
        </div>
        <button type="submit" disabled={creating}
          className="mt-4 min-h-[44px] rounded-md border border-gold/40 px-5 font-sans text-xs uppercase tracking-[0.15em] text-gold hover:bg-gold hover:text-black transition-colors disabled:opacity-50">
          {creating ? 'Saving…' : 'Add location'}
        </button>
      </form>

      {/* List */}
      <div className="space-y-3">
        {locations.length === 0 && (
          <p className="font-sans text-sm text-muted">No locations yet.</p>
        )}
        {locations.map((loc) => (
          <LocationRowEditor key={loc.id} loc={loc} onSave={patchLocation} />
        ))}
      </div>
    </div>
  )
}

function LocationRowEditor({
  loc,
  onSave,
}: {
  loc: LocationRow
  onSave: (id: string, updates: Partial<LocationRow>) => void | Promise<void>
}) {
  const [name, setName] = useState(loc.name)
  const [city, setCity] = useState(loc.city ?? '')
  const [sort, setSort] = useState(String(loc.sort_order))

  const dirty = name !== loc.name || city !== (loc.city ?? '') || sort !== String(loc.sort_order)

  return (
    <div className={`rounded-lg border p-4 ${loc.is_active ? 'border-border bg-graphite' : 'border-border/50 bg-graphite/40 opacity-70'}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className={LABEL}>Name</label>
          <input className={INPUT} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="sm:w-40">
          <label className={LABEL}>City</label>
          <input className={INPUT} value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="sm:w-24">
          <label className={LABEL}>Sort</label>
          <input type="number" className={INPUT} value={sort} onChange={(e) => setSort(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button
            disabled={!dirty}
            onClick={() => onSave(loc.id, { name, city: city || null, sort_order: Number(sort) || 0 })}
            className="min-h-[44px] rounded-md border border-gold/40 px-4 font-sans text-xs uppercase tracking-[0.15em] text-gold hover:bg-gold hover:text-black transition-colors disabled:opacity-40"
          >
            Save
          </button>
          <button
            onClick={() => onSave(loc.id, { is_active: !loc.is_active })}
            className="min-h-[44px] rounded-md border border-border px-4 font-sans text-xs uppercase tracking-[0.15em] text-muted hover:text-white transition-colors"
          >
            {loc.is_active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  )
}
