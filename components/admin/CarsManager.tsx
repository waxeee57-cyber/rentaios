'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera, ChevronUp, ChevronDown, X } from 'lucide-react'
import { formatPrice } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { VehicleDocuments } from '@/components/admin/VehicleDocuments'

interface CarPhoto {
  url: string
  alt: string
}

type CarStatus = 'available' | 'maintenance' | 'hidden'

interface CarRow {
  id: string
  slug: string
  brand: string
  model: string
  year: number
  category: string
  daily_price_eur: number
  deposit_eur: number
  transmission: string
  fuel: string
  seats: number
  license_plate: string | null
  description: string | null
  photos: CarPhoto[] | null
  status: CarStatus
}

interface CarsManagerProps {
  cars: CarRow[]
  expandId?: string
}

export function CarsManager({ cars: initialCars, expandId }: CarsManagerProps) {
  const [cars, setCars] = useState<CarRow[]>(initialCars)
  const [expandedId, setExpandedId] = useState<string | null>(expandId ?? null)

  const updateCar = (id: string, updates: Partial<CarRow>) => {
    setCars((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  if (cars.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-sans text-sm text-muted">No cars in the fleet yet.</p>
        <p className="font-sans text-xs text-muted mt-1">Use &quot;Add Car&quot; to add your first vehicle.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {cars.map((car) => (
        <CarCard
          key={car.id}
          car={car}
          expanded={expandedId === car.id}
          onExpand={() => setExpandedId((prev) => (prev === car.id ? null : car.id))}
          onUpdate={(updates) => updateCar(car.id, updates)}
        />
      ))}
    </div>
  )
}

function StatusDot({ status }: { status: CarStatus }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          status === 'available' ? 'bg-success' : status === 'maintenance' ? 'bg-warning' : 'bg-muted'
        )}
      />
      <span className="font-sans text-xs text-muted capitalize">{status}</span>
    </span>
  )
}

interface CarCardProps {
  car: CarRow
  expanded: boolean
  onExpand: () => void
  onUpdate: (updates: Partial<CarRow>) => void
}

function CarCard({ car, expanded, onExpand, onUpdate }: CarCardProps) {
  const [price, setPrice] = useState(car.daily_price_eur.toString())
  const [deposit, setDeposit] = useState(car.deposit_eur.toString())
  const [priceSaving, setPriceSaving] = useState(false)
  const [priceSaved, setPriceSaved] = useState(false)
  const [priceError, setPriceError] = useState('')

  const [statusSaving, setStatusSaving] = useState(false)
  const [statusSaved, setStatusSaved] = useState(false)
  const [statusError, setStatusError] = useState('')

  const [desc, setDesc] = useState(car.description ?? '')
  const [descSaving, setDescSaving] = useState(false)
  const [descSaved, setDescSaved] = useState(false)
  const [descError, setDescError] = useState('')

  const [photos, setPhotos] = useState<CarPhoto[]>(Array.isArray(car.photos) ? car.photos : [])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function savePricing() {
    const p = Number(price)
    const d = Number(deposit)
    if (!p || !d || p <= 0 || d <= 0) { setPriceError('Both values must be greater than 0'); return }
    setPriceSaving(true); setPriceError('')
    const res = await fetch(`/api/admin/cars/${car.id}/pricing`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ daily_price_eur: p, deposit_eur: d }),
    })
    setPriceSaving(false)
    if (res.ok) {
      onUpdate({ daily_price_eur: p, deposit_eur: d })
      setPriceSaved(true); setTimeout(() => setPriceSaved(false), 2000)
    } else {
      const j = await res.json(); setPriceError(j.error ?? 'Save failed')
    }
  }

  async function saveStatus(status: CarStatus) {
    setStatusSaving(true); setStatusError('')
    const res = await fetch(`/api/admin/cars/${car.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setStatusSaving(false)
    if (res.ok) {
      onUpdate({ status })
      setStatusSaved(true); setTimeout(() => setStatusSaved(false), 2000)
    } else {
      const j = await res.json(); setStatusError(j.error ?? 'Save failed')
    }
  }

  async function saveDesc() {
    if (desc === (car.description ?? '')) return
    setDescSaving(true); setDescError('')
    const res = await fetch(`/api/admin/cars/${car.id}/description`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: desc || null }),
    })
    setDescSaving(false)
    if (res.ok) {
      onUpdate({ description: desc || null })
      setDescSaved(true); setTimeout(() => setDescSaved(false), 2000)
    } else {
      const j = await res.json(); setDescError(j.error ?? 'Save failed')
    }
  }

  async function savePhotos(newPhotos: CarPhoto[]) {
    const prev = photos
    setPhotos(newPhotos)
    const res = await fetch(`/api/admin/cars/${car.id}/photos`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos: newPhotos }),
    })
    if (res.ok) {
      onUpdate({ photos: newPhotos })
    } else {
      setPhotos(prev)
    }
  }

  function movePhoto(idx: number, dir: -1 | 1) {
    const next = idx + dir
    if (next < 0 || next >= photos.length) return
    const arr = [...photos]
    ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
    savePhotos(arr)
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setUploadError('')
    const fd = new FormData(); fd.append('file', file)
    const res = await fetch(`/api/admin/cars/${car.id}/upload-photo`, { method: 'POST', body: fd })
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
    if (res.ok) {
      const j = await res.json()
      const newPhoto: CarPhoto = { url: j.url, alt: `${car.brand} ${car.model}` }
      const next = [...photos, newPhoto]
      setPhotos(next); onUpdate({ photos: next })
    } else {
      const j = await res.json(); setUploadError(j.error ?? 'Upload failed')
    }
  }

  const thumb = photos[0]

  return (
    <div className="rounded-md border border-border bg-graphite overflow-hidden">
      {/* Card summary row */}
      <div className="flex items-center gap-3 p-3">
        <div className="relative h-[60px] w-[80px] shrink-0 rounded-md overflow-hidden bg-black">
          {thumb ? (
            <Image src={thumb.url} alt={thumb.alt} fill className="object-cover" sizes="80px" unoptimized />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="h-5 w-5 text-muted" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-display text-base font-medium text-white leading-tight truncate">
            {car.brand} {car.model} {car.year}
          </p>
          <p className="font-sans text-xs text-muted mt-0.5 truncate capitalize">
            {car.category} · {car.transmission} · {car.fuel}
          </p>
          <p className="font-sans text-xs text-muted mt-0.5">
            {formatPrice(car.daily_price_eur)}/day · dep. {formatPrice(car.deposit_eur)}
          </p>
          <div className="mt-1.5">
            <StatusDot status={car.status} />
          </div>
        </div>

        <button
          onClick={onExpand}
          className="shrink-0 min-h-[48px] px-4 rounded-md border border-border font-sans text-xs uppercase tracking-[0.1em] text-muted hover:text-white hover:border-gold/40 transition-colors"
        >
          {expanded ? 'Close' : 'Edit'}
        </button>
      </div>

      {/* Expanded edit panel */}
      {expanded && (
        <div className="border-t border-border px-4 pb-6 space-y-8">

          {/* 1. Basic info (read-only) */}
          <div className="pt-5">
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Basic Info</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              {([
                { label: 'Brand', value: car.brand },
                { label: 'Model', value: car.model },
                { label: 'Year', value: car.year },
                { label: 'Category', value: car.category },
                { label: 'Transmission', value: car.transmission },
                { label: 'Fuel', value: car.fuel },
                { label: 'Seats', value: car.seats },
                ...(car.license_plate ? [{ label: 'Plate', value: car.license_plate }] : []),
              ] as { label: string; value: string | number }[]).map(({ label, value }) => (
                <div key={label}>
                  <dt className="font-sans text-xs text-muted">{label}</dt>
                  <dd className="font-sans text-sm text-white mt-0.5 capitalize">{String(value)}</dd>
                </div>
              ))}
            </dl>
            <p className="font-sans text-[10px] text-muted mt-3">
              To change brand, model, year or specs — edit in Supabase Studio.
            </p>
          </div>

          {/* 2. Pricing */}
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Pricing</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block font-sans text-xs text-muted mb-1.5">Daily price (€)</label>
                <input
                  type="number"
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-black border border-border rounded-md px-3 py-3 font-sans text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold"
                />
              </div>
              <div>
                <label className="block font-sans text-xs text-muted mb-1.5">Deposit (€)</label>
                <input
                  type="number"
                  min={1}
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  className="w-full bg-black border border-border rounded-md px-3 py-3 font-sans text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold"
                />
              </div>
            </div>
            {priceError && <p className="font-sans text-xs text-danger mb-2">{priceError}</p>}
            <button
              onClick={savePricing}
              disabled={priceSaving}
              className="min-h-[48px] px-6 rounded-md bg-gold text-black font-sans text-xs font-medium uppercase tracking-[0.1em] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {priceSaving ? 'Saving…' : priceSaved ? '✓ Saved' : 'Save prices'}
            </button>
          </div>

          {/* 3. Status */}
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Status</p>
            <div className="flex gap-2">
              {(['available', 'maintenance', 'hidden'] as const).map((s) => (
                <button
                  key={s}
                  disabled={statusSaving}
                  onClick={() => car.status !== s && saveStatus(s)}
                  className={cn(
                    'flex-1 min-h-[48px] rounded-md border font-sans text-xs capitalize tracking-[0.05em] transition-colors',
                    car.status === s
                      ? s === 'available'
                        ? 'border-success bg-success/10 text-success'
                        : s === 'maintenance'
                        ? 'border-warning bg-warning/10 text-warning'
                        : 'border-border bg-muted/10 text-muted'
                      : 'border-border text-muted hover:text-white hover:border-border/70'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            {statusSaved && <p className="font-sans text-xs text-success mt-2">✓ Saved</p>}
            {statusError && <p className="font-sans text-xs text-danger mt-2">{statusError}</p>}
          </div>

          {/* 4. Photos */}
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold mb-3">
              Photos {photos.length > 0 && <span className="text-muted normal-case tracking-normal">({photos.length})</span>}
            </p>

            {photos.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-3 mb-3">
                {photos.map((p, i) => (
                  <div key={`${p.url}-${i}`} className="relative shrink-0 flex flex-col items-center">
                    <div className="relative h-[80px] w-[80px] rounded-md overflow-hidden bg-black">
                      <Image src={p.url} alt={p.alt} fill className="object-cover" sizes="80px" unoptimized />
                    </div>
                    <button
                      onClick={() => savePhotos(photos.filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-danger flex items-center justify-center shadow"
                      aria-label="Remove photo"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                    <div className="flex gap-1 mt-1.5">
                      <button
                        onClick={() => movePhoto(i, -1)}
                        disabled={i === 0}
                        className="h-6 w-6 flex items-center justify-center text-muted hover:text-white disabled:opacity-30 transition-colors"
                        aria-label="Move left"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => movePhoto(i, 1)}
                        disabled={i === photos.length - 1}
                        className="h-6 w-6 flex items-center justify-center text-muted hover:text-white disabled:opacity-30 transition-colors"
                        aria-label="Move right"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              onClick={() => { setUploadError(''); fileRef.current?.click() }}
              disabled={uploading}
              className="min-h-[48px] px-6 rounded-md border border-border font-sans text-xs uppercase tracking-[0.1em] text-muted hover:text-white hover:border-gold/40 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : '+ Add Photo'}
            </button>
            {uploadError && (
              <div className="mt-2 flex items-center gap-3">
                <p className="font-sans text-xs text-danger">{uploadError}</p>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="font-sans text-xs text-gold hover:underline underline-offset-2"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* 5. Documents */}
          <div>
            <VehicleDocuments carId={car.id} />
          </div>

          {/* 6. Description */}
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Description</p>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              onBlur={saveDesc}
              rows={4}
              placeholder="Describe the car for the listing page…"
              className="w-full bg-black border border-border rounded-md px-3 py-3 font-sans text-sm text-white placeholder:text-muted/40 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold resize-none"
            />
            {descSaving && <p className="font-sans text-xs text-muted mt-1">Saving…</p>}
            {descSaved && <p className="font-sans text-xs text-success mt-1">✓ Saved</p>}
            {descError && <p className="font-sans text-xs text-danger mt-1">{descError}</p>}
          </div>

          {/* Close */}
          <button
            onClick={onExpand}
            className="w-full min-h-[48px] rounded-md border border-border font-sans text-xs uppercase tracking-[0.1em] text-muted hover:text-white hover:border-gold/40 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
