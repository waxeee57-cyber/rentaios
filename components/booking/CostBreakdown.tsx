import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatPriceDecimals } from '@/lib/formatters'

interface CostBreakdownProps {
  dailyRate: number
  days: number
  depositEur: number
  compact?: boolean
  transferRequested?: boolean
}

export function CostBreakdown({ dailyRate, days, depositEur, compact, transferRequested }: CostBreakdownProps) {
  const total = dailyRate * days

  if (compact) {
    return (
      <div className="flex items-baseline justify-between">
        <span className="font-sans text-sm text-muted">{days} nap</span>
        <span className="font-sans text-lg font-medium text-gold tabular-nums">
          {formatPriceDecimals(total)}
        </span>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-3 rounded-md border border-border bg-black/40 p-4">
        <div className="flex items-center justify-between">
          <span className="font-sans text-sm text-muted">
            {formatPriceDecimals(dailyRate)} × {days} nap
          </span>
          <span className="font-sans text-sm font-medium text-white tabular-nums">
            {formatPriceDecimals(total)}
          </span>
        </div>

        {transferRequested && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-sans text-sm text-muted">
              Egyedi kiszállítás
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="cursor-help">
                    <Info className="h-3.5 w-3.5 text-muted/60" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  A kiszállítási díjat a foglalás véglegesítése előtt visszaigazoljuk.
                </TooltipContent>
              </Tooltip>
            </span>
            <span className="font-sans text-sm italic text-muted">TBC</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-sans text-sm text-muted">
            Visszajáró kaució
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="cursor-help">
                  <Info className="h-3.5 w-3.5 text-muted/60" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                A kauciót átvételkor vesszük fel, a bérlés végéig zároljuk, és sérülésmentes
                visszahozás esetén aznap visszaadjuk.
              </TooltipContent>
            </Tooltip>
          </span>
          <span className="font-sans text-sm font-medium text-white tabular-nums">
            {formatPriceDecimals(depositEur)}
          </span>
        </div>

        <div className="border-t border-border pt-3 flex items-center justify-between">
          <span className="font-sans text-sm font-medium text-white">Fizetés átvételkor</span>
          <span className="font-sans text-base font-medium text-gold tabular-nums">
            {formatPriceDecimals(total)}
            {transferRequested && (
              <span className="font-sans text-xs font-normal text-muted"> + kiszállítási díj</span>
            )}
          </span>
        </div>
      </div>
    </TooltipProvider>
  )
}
