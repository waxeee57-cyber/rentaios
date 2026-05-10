'use client'

import { useState } from 'react'
import { Phone, Copy, Check, MessageCircle, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatDateRange, formatDateTime, formatPriceDecimals, formatTime } from '@/lib/formatters'
import { buildBookingLink, buildWhatsAppLink } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import { BookingDocuments } from '@/components/admin/BookingDocuments'
import { CustomerDocuments } from '@/components/admin/CustomerDocuments'

type BookingStatus = 'inquiry' | 'confirmed' | 'picked_up' | 'returned' | 'completed' | 'cancelled'

interface BookingRow {
  id: string
  booking_code: string
  status: BookingStatus
  pickup_location: string
  start_at: string
  end_at: string
  days: number
  total_eur: number
  deposit_eur: number
  customer_message: string | null
  admin_notes: string | null
  license_doc_url: string | null
  id_doc_url: string | null
  return_notes: string | null
  source: string
  created_at: string
  status_history: Array<{ status: string; at: string; by: string }>
  transfer_requested: boolean
  transfer_address: string | null
  transfer_fee_eur: number | null
  car: { brand: string; model: string; year: number; slug: string } | null
  customer: { id: string; full_name: string; email: string; phone: string | null; country: string | null } | null
}

interface BookingDetailProps {
  booking: BookingRow
  onStatusChange: () => void
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="ml-1 text-muted hover:text-gold transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border last:border-0">
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold">{title}</span>
        <span className="text-muted text-xs">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

export function BookingDetail({ booking: b, onStatusChange }: BookingDetailProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [conflictCode, setConflictCode] = useState('')
  const [adminNotes, setAdminNotes] = useState(b.admin_notes ?? '')
  const [returnNotes, setReturnNotes] = useState(b.return_notes ?? '')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState<'license' | 'id' | null>(null)
  const [docUrls, setDocUrls] = useState({ license: b.license_doc_url, id: b.id_doc_url })
  const [transferFee, setTransferFee] = useState(b.transfer_fee_eur !== null ? String(b.transfer_fee_eur) : '')
  const [savingFee, setSavingFee] = useState(false)
  const [feeSaved, setFeeSaved] = useState(b.transfer_fee_eur !== null)

  const waLink = buildBookingLink({ customerName: b.customer?.full_name ?? '', bookingCode: b.booking_code })
  const firstName = b.customer?.full_name?.split(' ')[0] ?? 'there'
  const carLabel = b.car ? `${b.car.brand} ${b.car.model}` : 'the car'
  const waTemplates = [
    {
      label: 'Confirm',
      msg: `Hi ${firstName}, your ${carLabel} booking (${b.booking_code}) is confirmed. We will deliver to ${b.pickup_location} on ${b.start_at.slice(0, 10)}. Please have your licence and passport ready at pickup.`,
    },
    {
      label: 'Reminder',
      msg: `Hi ${firstName}, just a reminder that your ${carLabel} pickup is tomorrow at ${b.pickup_location}. Any questions, let us know!`,
    },
    {
      label: 'Docs',
      msg: `Hi ${firstName}, please send us a photo of your driver's licence and passport before pickup so we can prepare the paperwork. Thank you!`,
    },
    {
      label: 'Return',
      msg: `Hi ${firstName}, thank you for returning the ${carLabel}. Your deposit will be refunded within 3 working days. Hope you enjoyed the drive!`,
    },
  ]

  const transition = async (action: string, body?: Record<string, unknown>) => {
    setLoading(true)
    setError('')
    setConflictCode('')
    try {
      const res = await fetch(`/api/admin/bookings/${b.id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body ?? {}),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409) setConflictCode(data.conflicting_booking_code ?? '')
        setError(data.error ?? 'Action failed. Please try again.')
      } else {
        onStatusChange()
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const saveNotes = async (field: 'admin_notes' | 'return_notes', value: string) => {
    await fetch(`/api/admin/bookings/${b.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field, value }),
    })
  }

  const handleDocUpload = async (type: 'license' | 'id', file: File) => {
    setUploadingDoc(type)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      const res = await fetch(`/api/admin/bookings/${b.id}/documents`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setDocUrls((prev) => ({ ...prev, [type]: data.url }))
      } else {
        setError(data.error ?? 'Upload failed. Please try again.')
      }
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploadingDoc(null)
    }
  }

  const saveTransferFee = async () => {
    const fee = parseFloat(transferFee)
    if (isNaN(fee) || fee < 0) return
    setSavingFee(true)
    try {
      const res = await fetch(`/api/admin/bookings/${b.id}/transfer-fee`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transfer_fee_eur: fee }),
      })
      if (res.ok) setFeeSaved(true)
    } finally {
      setSavingFee(false)
    }
  }

  const isTerminal = b.status === 'completed' || b.status === 'cancelled'

  return (
    <div className="divide-y divide-border">
      {/* Section 1: Customer & Trip */}
      <Section title="Customer & Trip">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-sans text-xs font-medium tracking-widest text-muted">Booking code</span>
            <span className="font-sans text-sm font-medium text-white tracking-widest">{b.booking_code}</span>
            <CopyButton value={b.booking_code} />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-sans uppercase tracking-[0.15em] text-muted mb-0.5">Name</p>
              <p className="font-sans text-sm text-white">{b.customer?.full_name}</p>
            </div>
            <div>
              <p className="text-[10px] font-sans uppercase tracking-[0.15em] text-muted mb-0.5">Email</p>
              <div className="flex items-center">
                <a href={`mailto:${b.customer?.email}`} className="font-sans text-sm text-white hover:text-gold">
                  {b.customer?.email}
                </a>
                <CopyButton value={b.customer?.email ?? ''} />
              </div>
            </div>
            {b.customer?.phone && (
              <div>
                <p className="text-[10px] font-sans uppercase tracking-[0.15em] text-muted mb-0.5">Phone</p>
                <div className="flex items-center gap-2">
                  <a href={`tel:${b.customer.phone}`} className="flex items-center gap-1.5 font-sans text-sm text-white hover:text-gold">
                    <Phone className="h-3.5 w-3.5" />
                    {b.customer.phone}
                  </a>
                  <CopyButton value={b.customer.phone} />
                </div>
              </div>
            )}
            {b.customer?.country && (
              <div>
                <p className="text-[10px] font-sans uppercase tracking-[0.15em] text-muted mb-0.5">Country</p>
                <p className="font-sans text-sm text-white">{b.customer.country}</p>
              </div>
            )}
          </div>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-whatsapp px-4 py-2 text-xs font-sans font-medium text-white hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="h-3.5 w-3.5 fill-white stroke-none" />
            WhatsApp {firstName}
          </a>

          <div className="space-y-1.5">
            <p className="text-[10px] font-sans uppercase tracking-[0.15em] text-muted">Quick replies</p>
            <div className="flex flex-wrap gap-2">
              {waTemplates.map(({ label, msg }) => (
                <a
                  key={label}
                  href={buildWhatsAppLink(msg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-[10px] font-sans uppercase tracking-[0.1em] text-muted hover:border-whatsapp/50 hover:text-white transition-colors"
                >
                  <MessageCircle className="h-3 w-3" />
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-sm font-sans">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted mb-0.5">Dates</p>
              <p className="text-white">{formatDateRange(b.start_at, b.end_at)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted mb-0.5">Pickup time</p>
              <p className="text-white">{formatTime(b.start_at)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted mb-0.5">Location</p>
              <p className="text-white">{b.pickup_location}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted mb-0.5">Total / Deposit</p>
              <p className="text-gold tabular-nums">{formatPriceDecimals(b.total_eur)}</p>
              <p className="text-xs text-muted tabular-nums">+ {formatPriceDecimals(b.deposit_eur)} deposit</p>
            </div>
          </div>

          {b.customer_message && (
            <div className="rounded-sm border border-border bg-black/40 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted mb-1">Customer message</p>
              <p className="font-sans text-sm italic text-muted">&ldquo;{b.customer_message}&rdquo;</p>
            </div>
          )}
        </div>
      </Section>

      {/* Section 2: Status Actions */}
      <Section title="Status Actions">
        <div className="space-y-3">
          {error && (
            <div className="flex items-start gap-2 rounded-sm border border-danger/30 bg-danger/10 px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
              <div>
                <p className="font-sans text-xs text-danger">{error}</p>
                {conflictCode && (
                  <p className="font-sans text-xs text-muted mt-0.5">
                    Conflicting booking: <span className="text-white font-medium">{conflictCode}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {b.status === 'inquiry' && (
            <Button className="w-full" onClick={() => transition('confirm')} disabled={loading}>
              {loading ? 'Confirming...' : 'Confirm Booking'}
            </Button>
          )}
          {b.status === 'confirmed' && (
            <Button className="w-full" onClick={() => {
              if (!docUrls.license || !docUrls.id) {
                if (!confirm('License and passport not yet captured. Continue anyway?')) return
              }
              transition('picked-up')
            }} disabled={loading}>
              {loading ? 'Updating...' : 'Mark as Picked Up'}
            </Button>
          )}
          {b.status === 'picked_up' && (
            <Button className="w-full" onClick={() => transition('returned')} disabled={loading}>
              {loading ? 'Updating...' : 'Mark as Returned'}
            </Button>
          )}
          {b.status === 'returned' && (
            <Button className="w-full" onClick={() => transition('complete')} disabled={loading}>
              {loading ? 'Completing...' : 'Mark Complete'}
            </Button>
          )}

          {!isTerminal && (
            <>
              {showCancelModal ? (
                <div className="rounded-sm border border-danger/30 bg-danger/10 p-3 space-y-2">
                  <p className="font-sans text-xs text-danger">
                    This cannot be undone. The customer will be notified. Continue?
                  </p>
                  <div className="flex gap-2">
                    <Button variant="danger" size="sm" onClick={() => transition('cancel')} disabled={loading}>
                      Yes, cancel
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowCancelModal(false)}>
                      No
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowCancelModal(true)}
                >
                  Cancel Booking
                </Button>
              )}
            </>
          )}
        </div>
      </Section>

      {/* Section 2b: Transfer Request */}
      {b.transfer_requested && (
        <Section title="Transfer Request">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-sans uppercase tracking-[0.15em] text-muted mb-0.5">Delivery address</p>
              <p className="font-sans text-sm text-white">{b.transfer_address}</p>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-sans uppercase tracking-[0.15em] text-muted">Transfer fee</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="9999"
                  step="0.01"
                  placeholder="0.00"
                  value={transferFee}
                  onChange={(e) => { setTransferFee(e.target.value); setFeeSaved(false) }}
                  className="w-28 rounded-md border border-border bg-black/40 px-3 py-2 font-sans text-sm text-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-gold"
                />
                <span className="font-sans text-sm text-muted">EUR</span>
                <button
                  onClick={saveTransferFee}
                  disabled={savingFee}
                  className="rounded-md border border-gold/40 px-3 py-2 text-xs font-sans uppercase tracking-[0.12em] text-gold hover:bg-gold hover:text-black transition-colors disabled:opacity-50"
                >
                  {savingFee ? 'Saving...' : 'Save fee'}
                </button>
              </div>
              {feeSaved && transferFee && (
                <p className="font-sans text-xs text-success">
                  Transfer fee: €{parseFloat(transferFee).toFixed(2)} (saved)
                </p>
              )}
              <p className="flex items-start gap-1.5 font-sans text-xs text-muted">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                Communicate the fee to the customer via WhatsApp before confirming the booking.
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* Section 3: Pickup Workflow (confirmed only) */}
      {b.status === 'confirmed' && (
        <Section title="Pickup Documents">
          <div className="space-y-4">
            <p className="font-sans text-xs text-muted">
              Capture both documents before marking pickup. The system will warn you if either is missing.
            </p>
            {(['license', 'id'] as const).map((type) => {
              const url = docUrls[type]
              const label = type === 'license' ? "Driver's License" : 'Passport / ID'
              return (
                <div key={type} className="space-y-1.5">
                  <p className="text-[10px] font-sans uppercase tracking-[0.15em] text-muted">{label}</p>
                  {url ? (
                    <div className="flex items-center gap-3">
                      <span className="font-sans text-xs text-success">Captured</span>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="font-sans text-xs text-gold hover:underline">View</a>
                      <label className="cursor-pointer font-sans text-xs text-muted hover:text-white underline-offset-2 hover:underline">
                        Replace
                        <input type="file" accept="image/*" capture="environment" className="sr-only"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDocUpload(type, f) }} />
                      </label>
                    </div>
                  ) : (
                    <label className={cn(
                      'flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-border',
                      'font-sans text-xs text-muted hover:border-gold/40 hover:text-gold transition-colors',
                      uploadingDoc === type && 'opacity-50 pointer-events-none'
                    )}>
                      {uploadingDoc === type ? 'Uploading...' : `Take Photo — ${label}`}
                      <input type="file" accept="image/*" capture="environment" className="sr-only"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDocUpload(type, f) }} />
                    </label>
                  )}
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* Section 4: Return Notes (returned only) */}
      {b.status === 'returned' && (
        <Section title="Return Notes">
          <div className="space-y-3">
            <p className="font-sans text-xs text-muted">
              Note any damage, fuel level, mileage observations. Auto-saved.
            </p>
            <Textarea
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              onBlur={() => saveNotes('return_notes', returnNotes)}
              placeholder="Condition notes (optional). Any damage, fuel level, mileage, observations."
              className="min-h-[80px]"
            />
            <p className="font-sans text-xs text-muted">
              Refund the deposit in person. Mark Complete only after deposit is settled.
            </p>
          </div>
        </Section>
      )}

      {/* Section 5: Admin Notes */}
      <Section title="Admin Notes">
        <Textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          onBlur={() => saveNotes('admin_notes', adminNotes)}
          placeholder="Internal notes (not visible to customer). Auto-saved."
          className="min-h-[80px]"
        />
      </Section>

      {/* Section 6: Booking Documents */}
      <Section title="Booking Documents" defaultOpen={false}>
        <BookingDocuments bookingId={b.id} status={b.status} />
      </Section>

      {/* Section 7: Customer Documents */}
      {b.customer?.id && (
        <Section title="Customer Documents" defaultOpen={false}>
          <CustomerDocuments customerId={b.customer.id} />
        </Section>
      )}

      {/* Section 8: Status History */}
      <Section title="Status History" defaultOpen={false}>
        {b.status_history.length === 0 ? (
          <p className="font-sans text-xs text-muted">No history.</p>
        ) : (
          <div className="space-y-2">
            {[...b.status_history].reverse().map((h, i) => (
              <div key={i} className="flex items-center gap-3 font-sans text-xs">
                <span className="text-muted tabular-nums">{formatDateTime(h.at)}</span>
                <span className="text-white font-medium">{h.status}</span>
                <span className="text-muted">by {h.by}</span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}
