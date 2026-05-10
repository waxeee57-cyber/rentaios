import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; doc_id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error
  const { id, doc_id } = await params

  const { data: doc } = await supabaseAdmin
    .from('vehicle_documents')
    .select('file_url')
    .eq('id', doc_id)
    .eq('car_id', id)
    .single()

  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

  await supabaseAdmin.storage.from('vehicle-documents').remove([doc.file_url])

  const { error } = await supabaseAdmin
    .from('vehicle_documents')
    .delete()
    .eq('id', doc_id)
    .eq('car_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
