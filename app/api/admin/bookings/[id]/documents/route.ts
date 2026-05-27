import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/auth'
import { z } from 'zod'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_BYTES = 20 * 1024 * 1024

const LEGACY_TYPES = ['license', 'id'] as const
type LegacyType = typeof LEGACY_TYPES[number]

const StructuredSchema = z.object({
  document_type: z.enum(['rental_agreement', 'damage_report', 'pickup_photo', 'return_photo', 'deposit_receipt', 'other']),
  document_type_label: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
})

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error
  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('booking_documents')
    .select('*')
    .eq('booking_id', id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const docs = await Promise.all((data ?? []).map(async (doc) => {
    const { data: sd } = await supabaseAdmin.storage
      .from('booking-documents')
      .createSignedUrl(doc.file_url, 3600)
    return { ...doc, signed_url: sd?.signedUrl ?? '' }
  }))

  return NextResponse.json(docs)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })

  const rawType = formData.get('type') as string | null
  const rawDocType = formData.get('document_type') as string | null

  // Legacy path: license/id upload to bookings columns
  if (rawType === 'license' || rawType === 'id') {
    const type: LegacyType = rawType
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }
    const ext = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') ?? 'jpg'
    const path = `bookings/${id}/${type}-${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const { error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(path, buffer, { contentType: file.type, upsert: true })
    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
    }
    const { data: signedData } = await supabaseAdmin.storage.from('documents').createSignedUrl(path, 3600)
    const field = type === 'license' ? 'license_doc_url' : 'id_doc_url'
    await supabaseAdmin.from('bookings').update({ [field]: path, updated_at: new Date().toISOString() }).eq('id', id)
    return NextResponse.json({ ok: true, url: signedData?.signedUrl ?? '' })
  }

  // Structured booking documents path
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 400 })
  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, WEBP, and PDF files are accepted' }, { status: 400 })
  }

  const parsed = StructuredSchema.safeParse({
    document_type: rawDocType,
    document_type_label: formData.get('document_type_label') ?? undefined,
    notes: formData.get('notes') ?? undefined,
  })
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { document_type, document_type_label, notes } = parsed.data
  const docId = crypto.randomUUID()
  const ext = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') ?? 'bin'
  const storagePath = `${id}/${docId}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await supabaseAdmin.storage
    .from('booking-documents')
    .upload(storagePath, buffer, { contentType: file.type })

  if (uploadError) {
    const msg = uploadError.message.toLowerCase().includes('bucket')
      ? 'Storage bucket "booking-documents" not found. Create it in Supabase Storage first.'
      : 'Upload failed. Please try again.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  const { data: doc, error: dbError } = await supabaseAdmin
    .from('booking_documents')
    .insert({
      id: docId,
      booking_id: id,
      document_type,
      document_type_label: document_type_label ?? null,
      file_name: file.name,
      file_url: storagePath,
      file_size_bytes: file.size,
      mime_type: file.type,
      notes: notes ?? null,
      uploaded_by: auth.user.email,
    })
    .select('*')
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  const { data: sd } = await supabaseAdmin.storage
    .from('booking-documents')
    .createSignedUrl(storagePath, 3600)

  return NextResponse.json({ ...doc, signed_url: sd?.signedUrl ?? '' })
}
