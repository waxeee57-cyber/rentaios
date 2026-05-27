import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { z } from 'zod'

const schema = z.object({
  session_id: z.string().uuid(),
  body: z.string().min(1).max(2000),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!rateLimit(ip, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 })
  }

  const { session_id, body: messageBody } = parsed.data

  const { data: conv, error: convErr } = await supabaseAdmin
    .from('chat_conversations')
    .select('id, status, unread_admin')
    .eq('session_id', session_id)
    .single()

  if (convErr || !conv) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }
  if (conv.status === 'closed') {
    return NextResponse.json({ error: 'Conversation is closed' }, { status: 400 })
  }

  const { data: msg, error: msgErr } = await supabaseAdmin
    .from('chat_messages')
    .insert({ conversation_id: conv.id, sender: 'visitor', body: messageBody })
    .select('id, created_at')
    .single()

  if (msgErr || !msg) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  await supabaseAdmin
    .from('chat_conversations')
    .update({
      updated_at: new Date().toISOString(),
      unread_admin: (conv.unread_admin ?? 0) + 1,
    })
    .eq('id', conv.id)

  return NextResponse.json({ id: msg.id, created_at: msg.created_at })
}
