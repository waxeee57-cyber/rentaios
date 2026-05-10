'use client'

import { useState, useEffect, useRef } from 'react'
import { FileText, Upload, Trash2, ExternalLink, Download, AlertTriangle, Clock, Check, X } from 'lucide-react'

type VehicleDocType = 'insurance' | 'registration' | 'mot_certificate' | 'service_history' | 'purchase_invoice' | 'other'

interface VehicleDoc {
  id: string
  document_type: VehicleDocType
  document_type_label: string | null
  file_name: string
  file_size_bytes: number | null
  mime_type: string | null
  expires_at: string | null
  notes: string | null
  created_at: string
  signed_url: string
}

const TYPE_LABELS: Record<VehicleDocType, string> = {
  insurance: 'Insurance',
  registration: 'Registration',
  mot_certificate: 'MOT Certificate',
  service_history: 'Service History',
  purchase_invoice: 'Purchase Invoice',
  other: 'Other',
}

const SHOW_EXPIRY_TYPES: VehicleDocType[] = ['insurance', 'mot_certificate']

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getExpiryStatus(expires_at: string | null): 'none' | 'ok' | 'soon' | 'expired' {
  if (!expires_at) return 'none'
  const days = Math.ceil((new Date(expires_at).getTime() - Date.now()) / 86400000)
  if (days < 0) return 'expired'
  if (days <= 60) return 'soon'
  return 'ok'
}

function formatExpiry(expires_at: string): string {
  return new Date(expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function VehicleDocuments({ carId }: { carId: string }) {
  const [docs, setDocs] = useState<VehicleDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/vehicles/${carId}/documents`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setDocs(data)
        else setError(data.error ?? 'Failed to load documents')
      })
      .catch(() => setError('Failed to load documents'))
      .finally(() => setLoading(false))
  }, [carId])

  const handleUploaded = (doc: VehicleDoc) => {
    setDocs((prev) => [doc, ...prev])
    setShowModal(false)
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document? This cannot be undone.')) return
    setDeletingId(docId)
    try {
      const res = await fetch(`/api/admin/vehicles/${carId}/documents/${docId}`, { method: 'DELETE' })
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

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold">Documents</p>
        <button
          onClick={() => setShowModal(true)}
          className="font-sans text-xs text-gold hover:underline underline-offset-2"
        >
          + Add document
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-sm border border-danger/30 bg-danger/10 px-3 py-2 mb-3">
          <AlertTriangle className="h-3.5 w-3.5 text-danger shrink-0" />
          <p className="font-sans text-xs text-danger">{error}</p>
        </div>
      )}

      {docs.length === 0 ? (
        <p className="font-sans text-xs text-muted/60 italic">
          No documents uploaded for this vehicle. Add insurance, registration, and MOT certificates.
        </p>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => {
            const expiry = getExpiryStatus(doc.expires_at)
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
                  <p className="font-sans text-[10px] text-muted truncate">{doc.file_name}{doc.file_size_bytes ? ` · ${formatBytes(doc.file_size_bytes)}` : ''}</p>

                  {doc.expires_at && (
                    <div className="flex items-center gap-1 mt-1">
                      {expiry === 'expired' && (
                        <>
                          <X className="h-3 w-3 text-danger" />
                          <span className="font-sans text-[10px] text-danger font-medium">EXPIRED {formatExpiry(doc.expires_at)}</span>
                        </>
                      )}
                      {expiry === 'soon' && (
                        <>
                          <AlertTriangle className="h-3 w-3 text-warning" />
                          <span className="font-sans text-[10px] text-warning">Expires {formatExpiry(doc.expires_at)}</span>
                        </>
                      )}
                      {expiry === 'ok' && (
                        <>
                          <Clock className="h-3 w-3 text-success" />
                          <span className="font-sans text-[10px] text-success">Expires {formatExpiry(doc.expires_at)}</span>
                        </>
                      )}
                    </div>
                  )}

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
        <VehicleDocUploadModal
          carId={carId}
          onUploaded={handleUploaded}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function VehicleDocUploadModal({
  carId,
  onUploaded,
  onClose,
}: {
  carId: string
  onUploaded: (doc: VehicleDoc) => void
  onClose: () => void
}) {
  const [docType, setDocType] = useState<VehicleDocType>('insurance')
  const [customLabel, setCustomLabel] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const showExpiry = SHOW_EXPIRY_TYPES.includes(docType)

  const handleSubmit = async () => {
    if (!file) { setError('Please select a file'); return }
    setUploading(true)
    setError('')

    const fd = new FormData()
    fd.append('file', file)
    fd.append('document_type', docType)
    if (docType === 'other' && customLabel) fd.append('document_type_label', customLabel)
    if (expiresAt) fd.append('expires_at', expiresAt)
    if (notes) fd.append('notes', notes)

    try {
      const res = await fetch(`/api/admin/vehicles/${carId}/documents`, { method: 'POST', body: fd })
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
              onChange={(e) => setDocType(e.target.value as VehicleDocType)}
              className="w-full bg-black border border-border rounded-md px-3 py-2.5 font-sans text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold"
            >
              {(Object.entries(TYPE_LABELS) as [VehicleDocType, string][]).map(([v, l]) => (
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
                placeholder="e.g. Road tax certificate"
                className="w-full bg-black border border-border rounded-md px-3 py-2.5 font-sans text-sm text-white placeholder:text-muted/40 focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          )}

          {showExpiry && (
            <div>
              <label className="block font-sans text-xs text-muted mb-1.5">Expiry date (optional)</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-black border border-border rounded-md px-3 py-2.5 font-sans text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold"
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
              placeholder="Policy number, reference, etc."
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
