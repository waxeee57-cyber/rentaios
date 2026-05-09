import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getAuthUser } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Strip id/created_at/updated_at — these must not be sent by client
  const { id: _id, created_at: _c, updated_at: _u, ...fields } = body as Record<string, unknown>

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { data: existing } = await supabaseAdmin
    .from('business_config')
    .select('id')
    .single()

  let result
  if (existing?.id) {
    result = await supabaseAdmin
      .from('business_config')
      .update(fields)
      .eq('id', existing.id)
      .select()
      .single()
  } else {
    result = await supabaseAdmin
      .from('business_config')
      .insert(fields)
      .select()
      .single()
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }

  revalidateTag('business-config', 'default')
  return NextResponse.json({ ok: true, data: result.data })
}
