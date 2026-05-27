import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { z } from 'zod'

const uuidSchema = z.string().uuid()

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const ip = getClientIp(req)
  if (!rateLimit(ip, 30, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { sessionId } = await params
  if (!uuidSchema.safeParse(sessionId).success) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: conv, error: convErr } = await supabaseAdmin
    .from('chat_conversations')
    .select('id, status, visitor_name, visitor_email')
    .eq('session_id', sessionId)
    .single()

  if (convErr || !conv) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: messages } = await supabaseAdmin
    .from('chat_messages')
    .select('id, sender, body, created_at')
    .eq('conversation_id', conv.id)
    .order('created_at', { ascending: true })
    .limit(50)

  return NextResponse.json({
    conversation_id: conv.id,
    status: conv.status,
    visitor_name: conv.visitor_name,
    visitor_email: conv.visitor_email,
    messages: messages ?? [],
  })
}
