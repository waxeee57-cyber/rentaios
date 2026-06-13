'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { type DateRange } from 'react-day-picker'
import { MapPin } from 'lucide-react'
import { DateRangePicker } from '@/components/booking/DateRangePicker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PICKUP_LOCATIONS } from '@/lib/locations'

const CATEGORIES: Array<{ value: string; label: string }> = [
  { value: 'sedan', label: 'Személyautó' },
  { value: 'suv', label: 'Egyterű / furgon' },
]

interface FleetFiltersProps {
  initialStart?: string
  initialEnd?: string
  initialPickup?: string
  initialCategory?: string
}

export function FleetFilters({ initialStart, initialEnd, initialPickup, initialCategory }: FleetFiltersProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [range, setRange] = useState<DateRange | undefined>(
    initialStart && initialEnd
      ? { from: new Date(initialStart), to: new Date(initialEnd) }
      : undefined
  )
  const [pickup, setPickup] = useState(initialPickup || 'all')
  const [category, setCategory] = useState(initialCategory ?? '')

  const apply = (overrides?: { range?: DateRange; pickup?: string; category?: string }) => {
    const r = overrides?.range !== undefined ? overrides.range : range
    const p = overrides?.pickup !== undefined ? overrides.pickup : pickup
    const c = overrides?.category !== undefined ? overrides.category : category

    const params = new URLSearchParams()
    if (r?.from) params.set('start', format(r.from, 'yyyy-MM-dd'))
    if (r?.to) params.set('end', format(r.to, 'yyyy-MM-dd'))
    if (p && p !== 'all') params.set('pickup', p)
    if (c) params.set('category', c)

    startTransition(() => {
      router.push(`/fleet?${params.toString()}`)
    })
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
      {/* Category chips — first on mobile (top), last on desktop */}
      <div className="order-first md:order-last flex gap-2 overflow-x-auto pb-0.5 scrollbar-none md:flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => {
              const next = category === c.value ? '' : c.value
              setCategory(next)
              apply({ category: next })
            }}
            className={cn(
              'rounded-sm border px-3 py-1.5 text-[10px] font-sans uppercase tracking-[0.15em] transition-colors',
              category === c.value
                ? 'border-gold text-gold'
                : 'border-border text-muted hover:border-gold/50 hover:text-gray-900'
            )}
          >
            {c.label}
          </button>
        ))}
        {(range || pickup || category) && (
          <button
            onClick={() => {
              setRange(undefined)
              setPickup('all')
              setCategory('')
              router.push('/fleet')
            }}
            className="text-[10px] font-sans text-muted hover:text-white underline-offset-2 hover:underline"
          >
            Törlés
          </button>
        )}
      </div>

      {/* Date + location — below chips on mobile, first on desktop */}
      <div className="order-last md:order-first flex gap-2 md:contents">
        <div className="flex-1 md:flex-1 md:max-w-xs">
          <DateRangePicker
            value={range}
            onChange={(r) => {
              setRange(r)
              if (r?.from && r?.to) apply({ range: r })
            }}
            placeholder="Bármely dátum"
            maxDays={14}
          />
        </div>

        {/* Location */}
        <div className="w-40 md:w-48 shrink-0">
          <Select value={pickup} onValueChange={(v) => { setPickup(v); apply({ pickup: v }) }}>
            <SelectTrigger>
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
                <SelectValue placeholder="Bármely átvételi hely" />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Bármely átvételi hely</SelectItem>
              {PICKUP_LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
