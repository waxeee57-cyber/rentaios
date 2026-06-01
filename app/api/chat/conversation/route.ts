import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { z } from 'zod'

const schema = z.object({
  visitor_name: z.string().min(1).max(100),
  visitor_short_id: z.string().regex(/^[A-Z0-9]{4}$/),
  visitor_email: z.string().email().optional().or(z.literal('')),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!rateLimit(ip, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const session_id = crypto.randomUUID()

  const { data, error } = await supabaseAdmin
    .from('chat_conversations')
    .insert({
      session_id,
      visitor_name: parsed.data.visitor_name,
      visitor_short_id: parsed.data.visitor_short_id,
      visitor_email: parsed.data.visitor_email || null,
    })
    .select('id, session_id')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }

  return NextResponse.json({ session_id: data.session_id, conversation_id: data.id })
}
