import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { z } from 'zod'

const schema = z.object({
  session_id: z.string().uuid(),
  body: z.string().min(1).max(2000),
})

const ONE_HOUR_MS = 60 * 60 * 1000

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
    .select('id, status, unread_admin, last_visitor_message_at, visitor_short_id, visitor_name, visitor_email')
    .eq('session_id', session_id)
    .single()

  if (convErr || !conv) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }

  // Stale check uses last_visitor_message_at — distinct from updated_at,
  // which admin replies bump and would falsely reset the inactivity window.
  const isStale =
    conv.status === 'open' &&
    Date.now() - new Date(conv.last_visitor_message_at).getTime() > ONE_HOUR_MS

  // Existing conversation is usable: insert directly.
  if (conv.status === 'open' && !isStale) {
    return await insertVisitorMessage(conv.id, conv.unread_admin ?? 0, messageBody)
  }

  // Otherwise we need a fresh conversation. Close the current one (if it's not
  // already closed) and roll over to a new conversation carrying the visitor's
  // identity.
  if (conv.status === 'open' && isStale) {
    const closedAt = new Date().toISOString()
    await supabaseAdmin
      .from('chat_conversations')
      .update({ status: 'closed', closed_at: closedAt, updated_at: closedAt })
      .eq('id', conv.id)
      .eq('status', 'open')
    await supabaseAdmin
      .from('chat_messages')
      .insert({ conversation_id: conv.id, sender: 'system', body: 'Chat closed' })
  }

  const rolled = await rolloverConversation({
    visitor_short_id: conv.visitor_short_id,
    visitor_name: conv.visitor_name,
    visitor_email: conv.visitor_email,
    messageBody,
  })

  if ('error' in rolled) {
    return NextResponse.json({ error: rolled.error }, { status: rolled.status })
  }

  return NextResponse.json(rolled.payload)
}

async function insertVisitorMessage(
  conversationId: string,
  currentUnread: number,
  messageBody: string
) {
  const { data: msg, error: msgErr } = await supabaseAdmin
    .from('chat_messages')
    .insert({ conversation_id: conversationId, sender: 'visitor', body: messageBody })
    .select('id, created_at')
    .single()

  if (msgErr || !msg) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  const nowIso = new Date().toISOString()
  await supabaseAdmin
    .from('chat_conversations')
    .update({
      updated_at: nowIso,
      last_visitor_message_at: nowIso,
      unread_admin: currentUnread + 1,
      last_message_sender: 'visitor',
    })
    .eq('id', conversationId)

  return NextResponse.json({ id: msg.id, created_at: msg.created_at })
}

type RolloverArgs = {
  visitor_short_id: string | null
  visitor_name: string | null
  visitor_email: string | null
  messageBody: string
}

type RolloverResult =
  | { error: string; status: number }
  | { payload: { id: string; created_at: string; new_session_id: string; new_conversation_id: string } }

async function rolloverConversation(args: RolloverArgs): Promise<RolloverResult> {
  const newSessionId = crypto.randomUUID()

  // Try to create the new open conversation. If a concurrent visitor request
  // already won the race for this visitor_short_id, the partial unique index
  // raises 23505 — we then fetch the conversation the winner created and use it.
  const nowIso = new Date().toISOString()

  const { data: created, error: createErr } = await supabaseAdmin
    .from('chat_conversations')
    .insert({
      session_id: newSessionId,
      visitor_short_id: args.visitor_short_id,
      visitor_name: args.visitor_name,
      visitor_email: args.visitor_email,
      last_visitor_message_at: nowIso,
    })
    .select('id, session_id, unread_admin')
    .single()

  let target: { id: string; session_id: string; unread_admin: number | null }

  if (createErr) {
    if (createErr.code === '23505' && args.visitor_short_id) {
      const { data: existing } = await supabaseAdmin
        .from('chat_conversations')
        .select('id, session_id, unread_admin')
        .eq('visitor_short_id', args.visitor_short_id)
        .eq('status', 'open')
        .single()
      if (!existing) {
        return { error: 'Failed to create conversation', status: 500 }
      }
      target = existing
    } else {
      return { error: 'Failed to create conversation', status: 500 }
    }
  } else if (!created) {
    return { error: 'Failed to create conversation', status: 500 }
  } else {
    target = created
  }

  const { data: msg, error: msgErr } = await supabaseAdmin
    .from('chat_messages')
    .insert({ conversation_id: target.id, sender: 'visitor', body: args.messageBody })
    .select('id, created_at')
    .single()

  if (msgErr || !msg) {
    return { error: 'Failed to send message', status: 500 }
  }

  await supabaseAdmin
    .from('chat_conversations')
    .update({
      updated_at: nowIso,
      last_visitor_message_at: nowIso,
      unread_admin: (target.unread_admin ?? 0) + 1,
      last_message_sender: 'visitor',
    })
    .eq('id', target.id)

  return {
    payload: {
      id: msg.id,
      created_at: msg.created_at,
      new_session_id: target.session_id,
      new_conversation_id: target.id,
    },
  }
}
