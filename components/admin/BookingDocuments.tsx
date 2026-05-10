'use client'

import { useState, useEffect, useRef } from 'react'
import { FileText, Upload, Trash2, ExternalLink, Download, AlertTriangle, X } from 'lucide-react'

type BookingDocType = 'rental_agreement' | 'damage_report' | 'pickup_photo' | 'return_photo' | 'deposit_receipt' | 'other'

interface BookingDoc {
  id: string
  document_type: BookingDocType
  document_type_label: string | null
  file_name: string
  file_size_bytes: number | null
  mime_type: string | null
  notes: string | null
  created_at: string
  signed_url: string
}

type BookingStatus = 'inquiry' | 'confirmed' | 'picked_up' | 'returned' | 'completed' | 'cancelled'

const TYPE_LABELS: Record<BookingDocType, string> = {
  rental_agreement: 'Rental Agreement',
  damage_report: 'Damage Report',
  pickup_photo: 'Pickup Photo',
  return_photo: 'Return Photo',
  deposit_receipt: 'Deposit Receipt',
  other: 'Other',
}

const TYPE_ORDER: BookingDocType[] = ['rental_agreement', 'pickup_photo', 'damage_report', 'deposit_receipt', 'return_photo', 'other']

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const CAN_ADD_STATUSES: BookingStatus[] = ['confirmed', 'picked_up', 'returned', 'completed']

export function BookingDocuments({ bookingId, status }: { bookingId: string; status: BookingStatus }) {
  const [docs, setDocs] = useState<BookingDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/bookings/${bookingId}/documents`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setDocs(data)
        else setError(data.error ?? 'Failed to load documents')
      })
      .catch(() => setError('Failed to load documents'))
      .finally(() => setLoading(false))
  }, [bookingId])

  const sorted = [...docs].sort((a, b) => {
    const ai = TYPE_ORDER.indexOf(a.document_type)
    const bi = TYPE_ORDER.indexOf(b.document_type)
    if (ai !== bi) return ai - bi
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  const handleUploaded = (doc: BookingDoc) => {
    setDocs((prev) => [...prev, doc])
    setShowModal(false)
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document? This cannot be undone.')) return
    setDeletingId(docId)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/documents/${docId}`, { method: 'DELETE' })
      if (res.ok) setDocs((prev) => prev.filter((d) => d.id !== docId))
      else {
        const j = await res.json()
        setError(j.error ?? 'Delete failed')
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <p className="font-sans text-xs text-muted py-2">Loading documents…</p>

  const canAdd = CAN_ADD_STATUSES.includes(status)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold">Booking Documents</p>
        {canAdd && (
          <button
            onClick={() => setShowModal(true)}
            className="font-sans text-xs text-gold hover:underline underline-offset-2"
          >
            + Add document
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-sm border border-danger/30 bg-danger/10 px-3 py-2 mb-3">
          <AlertTriangle className="h-3.5 w-3.5 text-danger shrink-0" />
          <p className="font-sans text-xs text-danger">{error}</p>
        </div>
      )}

      {sorted.length === 0 ? (
        <p className="font-sans text-xs text-muted/60 italic">
          {canAdd ? 'No documents yet. Add a rental agreement or pickup photos.' : 'No documents for this booking.'}
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((doc) => {
            const label = doc.document_type === 'other' && doc.document_type_label
              ? doc.document_type_label
              : TYPE_LABELS[doc.document_type]
            const isImage = doc.mime_type?.startsWith('image/')

            return (
              <div key={doc.id} className="flex items-start gap-3 rounded-md border border-border bg-black/30 p-3">
                <div className="mt-0.5 shrink-0 text-muted">
                  {isImage ? (
                    <div className="h-8 w-8 rounded overflow-hidden bg-white/5 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={doc.signed_url} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-sans text-xs font-medium text-white">{label}</p>
                  <p className="font-sans text-[10px] text-muted truncate">
                    {doc.file_name}{doc.file_size_bytes ? ` · ${formatBytes(doc.file_size_bytes)}` : ''}
                  </p>
                  {doc.notes && (
                    <p className="font-sans text-[10px] text-muted mt-1 italic">{doc.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={doc.signed_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded text-muted hover:text-white transition-colors"
                    title="View"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={doc.signed_url}
                    download={doc.file_name}
                    className="flex h-7 w-7 items-center justify-center rounded text-muted hover:text-white transition-colors"
                    title="Download"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="flex h-7 w-7 items-center justify-center rounded text-muted hover:text-danger transition-colors disabled:opacity-40"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <BookingDocUploadModal
          bookingId={bookingId}
          onUploaded={handleUploaded}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function BookingDocUploadModal({
  bookingId,
  onUploaded,
  onClose,
}: {
  bookingId: string
  onUploaded: (doc: BookingDoc) => void
  onClose: () => void
}) {
  const [docType, setDocType] = useState<BookingDocType>('rental_agreement')
  const [customLabel, setCustomLabel] = useState('')
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    if (!file) { setError('Please select a file'); return }
    setUploading(true)
    setError('')

    const fd = new FormData()
    fd.append('file', file)
    fd.append('document_type', docType)
    if (docType === 'other' && customLabel) fd.append('document_type_label', customLabel)
    if (notes) fd.append('notes', notes)

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/documents`, { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) onUploaded(data)
      else setError(data.error ?? 'Upload failed')
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-graphite p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.15em] text-gold">Add Document</p>
          <button onClick={onClose} className="text-muted hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block font-sans text-xs text-muted mb-1.5">Document type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as BookingDocType)}
              className="w-full bg-black border border-border rounded-md px-3 py-2.5 font-sans text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold"
            >
              {(Object.entries(TYPE_LABELS) as [BookingDocType, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {docType === 'other' && (
            <div>
              <label className="block font-sans text-xs text-muted mb-1.5">Label</label>
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="e.g. Insurance waiver"
                className="w-full bg-black border border-border rounded-md px-3 py-2.5 font-sans text-sm text-white placeholder:text-muted/40 focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          )}

          <div>
            <label className="block font-sans text-xs text-muted mb-1.5">File</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              capture="environment"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center gap-2.5 rounded-md border border-dashed border-border px-3 py-3 hover:border-gold/40 transition-colors"
            >
              <Upload className="h-4 w-4 text-muted shrink-0" />
              <span className="font-sans text-sm text-muted text-left">
                {file ? (
                  <span className="text-white">{file.name} · {formatBytes(file.size)}</span>
                ) : (
                  'PDF, JPG, PNG, WEBP — max 20MB'
                )}
              </span>
            </button>
          </div>

          <div>
            <label className="block font-sans text-xs text-muted mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any additional notes"
              className="w-full bg-black border border-border rounded-md px-3 py-2 font-sans text-sm text-white placeholder:text-muted/40 focus:outline-none focus:ring-1 focus:ring-gold resize-none"
            />
          </div>
        </div>

        {error && <p className="font-sans text-xs text-danger">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={uploading || !file}
            className="flex-1 min-h-[44px] rounded-md bg-gold font-sans text-xs font-medium uppercase tracking-[0.1em] text-black hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {uploading ? 'Uploading…' : 'Upload document'}
          </button>
          <button
            onClick={onClose}
            className="min-h-[44px] px-4 rounded-md border border-border font-sans text-xs text-muted hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
