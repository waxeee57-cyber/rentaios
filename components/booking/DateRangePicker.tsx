'use client'

import { useState } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { format, differenceInCalendarDays, addDays } from 'date-fns'
import { hu } from 'date-fns/locale'
import { CalendarDays, ChevronDown } from 'lucide-react'
import { Popover } from '@radix-ui/react-popover'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'
import 'react-day-picker/style.css'

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
  placeholder?: string
  maxDays?: number
  id?: string
}

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = 'Válasszon dátumot',
  maxDays = 14,
  id,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [internalRange, setInternalRange] = useState<DateRange | undefined>(value)

  const range = value !== undefined ? value : internalRange

  const handleSelect = (r: DateRange | undefined) => {
    if (r?.from && r?.to) {
      const days = differenceInCalendarDays(r.to, r.from)
      if (days > maxDays) {
        r = { from: r.from, to: addDays(r.from, maxDays) }
      }
    }
    setInternalRange(r)
    onChange?.(r)
    if (r?.from && r?.to) setOpen(false)
  }

  const label =
    range?.from && range?.to
      ? `${format(range.from, 'MMM d', { locale: hu })} → ${format(range.to, 'yyyy. MMM d', { locale: hu })}`
      : range?.from
        ? `${format(range.from, 'MMM d', { locale: hu })} → ...`
        : placeholder

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          id={id}
          className={cn(
            'flex h-12 w-full items-center justify-between rounded-md border border-border bg-black px-4 py-3',
            'text-sm font-sans text-left',
            range?.from ? 'text-white' : 'text-muted',
            'focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold',
            'cursor-pointer',
            className
          )}
        >
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gold shrink-0" />
            {label}
          </span>
          <ChevronDown className="h-4 w-4 text-muted shrink-0" />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className={cn(
            'z-50 rounded-md border border-border bg-graphite p-2 shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          )}
          align="start"
          sideOffset={4}
        >
          <DayPicker
            mode="range"
            locale={hu}
            selected={range}
            onSelect={handleSelect}
            disabled={{ before: today }}
            numberOfMonths={1}
            showOutsideDays={false}
            classNames={{
              root: 'rdp-custom',
              day: 'h-9 w-9 rounded-sm text-sm text-white hover:bg-gold/20 transition-colors',
              day_button: 'h-9 w-9 flex items-center justify-center',
              selected: 'bg-gold text-black',
              range_start: 'bg-gold text-black rounded-l-sm',
              range_end: 'bg-gold text-black rounded-r-sm',
              range_middle: 'bg-gold/20 text-white rounded-none',
              disabled: 'opacity-30 cursor-not-allowed',
              outside: 'opacity-0 pointer-events-none',
              caption_label: 'font-sans text-sm font-medium text-white',
              nav: 'flex items-center gap-1',
              button_previous: 'h-8 w-8 flex items-center justify-center text-muted hover:text-white',
              button_next: 'h-8 w-8 flex items-center justify-center text-muted hover:text-white',
              month_grid: 'w-full',
              weekday: 'text-xs text-muted font-medium',
              today: 'font-bold text-gold',
            }}
          />
          {maxDays && (
            <p className="border-t border-border pt-2 mt-1 text-[11px] text-muted px-2 pb-1 font-sans">
              Legfeljebb {maxDays} nap. Hosszabb bérléshez írjon nekünk WhatsApp-on.
            </p>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
