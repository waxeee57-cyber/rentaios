import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

const VALID_TYPES = ['license', 'id'] as const
type DocType = typeof VALID_TYPES[number]

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  // Runtime validate 'type' — TypeScript casts don't protect at runtime
  const rawType = formData.get('type')
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })
  if (rawType !== 'license' && rawType !== 'id') {
    return NextResponse.json({ error: 'type must be "license" or "id"' }, { status: 400 })
  }
  const type: DocType = rawType

  // File size limit (matching the photo upload route)
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
    console.error('[documents] upload failed', uploadError)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }

  // Generate a 1-hour signed URL
  const { data: signedData } = await supabaseAdmin.storage
    .from('documents')
    .createSignedUrl(path, 3600)

  const field = type === 'license' ? 'license_doc_url' : 'id_doc_url'
  await supabaseAdmin
    .from('bookings')
    .update({ [field]: path, updated_at: new Date().toISOString() })
    .eq('id', id)

  return NextResponse.json({ ok: true, url: signedData?.signedUrl ?? '' })
}
