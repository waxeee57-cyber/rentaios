import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { z } from 'zod'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_BYTES = 20 * 1024 * 1024

const UploadSchema = z.object({
  document_type: z.enum(['driving_licence_front', 'driving_licence_back', 'passport', 'national_id', 'proof_of_address', 'other']),
  document_type_label: z.string().max(100).optional(),
  expires_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().max(500).optional(),
})

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error
  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('customer_documents')
    .select('*')
    .eq('customer_id', id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const docs = await Promise.all((data ?? []).map(async (doc) => {
    const { data: sd } = await supabaseAdmin.storage
      .from('customer-documents')
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
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 400 })
  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, WEBP, and PDF files are accepted' }, { status: 400 })
  }

  const rawData = {
    document_type: formData.get('document_type'),
    document_type_label: formData.get('document_type_label') ?? undefined,
    expires_at: formData.get('expires_at') ?? undefined,
    notes: formData.get('notes') ?? undefined,
  }
  const parsed = UploadSchema.safeParse(rawData)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { document_type, document_type_label, expires_at, notes } = parsed.data
  const docId = crypto.randomUUID()
  const ext = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') ?? 'bin'
  const storagePath = `${id}/${docId}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await supabaseAdmin.storage
    .from('customer-documents')
    .upload(storagePath, buffer, { contentType: file.type })

  if (uploadError) {
    const msg = uploadError.message.toLowerCase().includes('bucket')
      ? 'Storage bucket "customer-documents" not found. Create it in Supabase Storage first.'
      : 'Upload failed. Please try again.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  const { data: doc, error: dbError } = await supabaseAdmin
    .from('customer_documents')
    .insert({
      id: docId,
      customer_id: id,
      document_type,
      document_type_label: document_type_label ?? null,
      file_name: file.name,
      file_url: storagePath,
      file_size_bytes: file.size,
      mime_type: file.type,
      expires_at: expires_at ?? null,
      notes: notes ?? null,
      uploaded_by: auth.user.email,
    })
    .select('*')
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  const { data: sd } = await supabaseAdmin.storage
    .from('customer-documents')
    .createSignedUrl(storagePath, 3600)

  return NextResponse.json({ ...doc, signed_url: sd?.signedUrl ?? '' })
}
