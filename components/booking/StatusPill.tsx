import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type BookingStatus = 'inquiry' | 'confirmed' | 'picked_up' | 'returned' | 'completed' | 'cancelled'

const CUSTOMER_LABELS: Record<BookingStatus, string> = {
  inquiry:   'Függőben',
  confirmed: 'Visszaigazolva',
  picked_up: 'Aktív',
  returned:  'Aktív',
  completed: 'Lezárva',
  cancelled: 'Lemondva',
}

const ADMIN_LABELS: Record<BookingStatus, string> = {
  inquiry:   'Inquiry',
  confirmed: 'Confirmed',
  picked_up: 'Picked Up',
  returned:  'Returned',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

type BadgeVariant = 'warning' | 'gold' | 'success' | 'muted' | 'danger' | 'outline'

const STATUS_VARIANTS: Record<BookingStatus, BadgeVariant> = {
  inquiry:   'warning',
  confirmed: 'gold',
  picked_up: 'success',
  returned:  'outline',
  completed: 'muted',
  cancelled: 'danger',
}

interface StatusPillProps {
  status: BookingStatus
  mode?: 'customer' | 'admin'
  className?: string
}

export function StatusPill({ status, mode = 'customer', className }: StatusPillProps) {
  const label = mode === 'admin' ? ADMIN_LABELS[status] : CUSTOMER_LABELS[status]
  const variant = STATUS_VARIANTS[status]

  return (
    <Badge variant={variant} className={cn(className)}>
      {label}
    </Badge>
  )
}
