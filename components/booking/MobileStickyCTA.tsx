'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPriceDecimals } from '@/lib/formatters'

interface MobileStickyCTAProps {
  carLabel: string
  dailyRate: number
  days?: number
  whatsappHref: string
  onReserve: () => void
  isAvailable?: boolean
}

export function MobileStickyCTA({
  carLabel,
  dailyRate,
  days,
  whatsappHref,
  onReserve,
  isAvailable = true,
}: MobileStickyCTAProps) {
  const total = days ? dailyRate * days : null

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-black md:hidden"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex gap-3 p-4">
        <Button
          variant="primary"
          className="flex-1"
          onClick={onReserve}
          disabled={!isAvailable}
        >
          {isAvailable ? 'Foglalás' : 'Nem elérhető'}
        </Button>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-whatsapp text-white hover:opacity-90 transition-opacity"
          aria-label="WhatsApp"
        >
          <MessageCircle className="h-5 w-5 fill-white stroke-none" />
        </a>
      </div>
      {total && (
        <p className="px-4 pb-2 text-xs font-sans text-muted text-center -mt-1">
          {formatPriceDecimals(total)} · {days} nap
        </p>
      )}
    </div>
  )
}
