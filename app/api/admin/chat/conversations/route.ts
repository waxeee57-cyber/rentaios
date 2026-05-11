import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  void req
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { data, error } = await supabaseAdmin
    .from('chat_conversations')
    .select('id, session_id, visitor_name, visitor_email, status, unread_admin, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: 'Failed to load conversations' }, { status: 500 })
  }

  return NextResponse.json({ conversations: data ?? [] })
}
