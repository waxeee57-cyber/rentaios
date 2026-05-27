import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  conversation_id: z.string().uuid(),
  body: z.string().min(1).max(2000),
})

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 })
  }

  const { conversation_id, body: messageBody } = parsed.data

  const { data: conv, error: convErr } = await supabaseAdmin
    .from('chat_conversations')
    .select('id, status')
    .eq('id', conversation_id)
    .single()

  if (convErr || !conv) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }
  if (conv.status === 'closed') {
    return NextResponse.json({ error: 'Conversation is closed' }, { status: 400 })
  }

  const { data: msg, error: msgErr } = await supabaseAdmin
    .from('chat_messages')
    .insert({ conversation_id, sender: 'admin', body: messageBody })
    .select('id, sender, body, created_at')
    .single()

  if (msgErr || !msg) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  await supabaseAdmin
    .from('chat_conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversation_id)

  return NextResponse.json(msg)
}
