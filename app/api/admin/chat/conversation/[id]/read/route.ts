import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  void req
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params

  const { error } = await supabaseAdmin
    .from('chat_conversations')
    .update({ unread_admin: 0 })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
