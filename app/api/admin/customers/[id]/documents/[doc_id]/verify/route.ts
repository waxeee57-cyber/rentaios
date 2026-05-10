import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string; doc_id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error
  const { id, doc_id } = await params

  const { data: existing } = await supabaseAdmin
    .from('customer_documents')
    .select('verified')
    .eq('id', doc_id)
    .eq('customer_id', id)
    .single()

  if (!existing) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

  const { data: updated, error } = await supabaseAdmin
    .from('customer_documents')
    .update({ verified: !existing.verified })
    .eq('id', doc_id)
    .eq('customer_id', id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(updated)
}
