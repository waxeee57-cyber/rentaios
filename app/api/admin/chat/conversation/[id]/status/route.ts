import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  status: z.enum(['open', 'closed']),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const nextStatus = parsed.data.status
  const now = new Date().toISOString()

  if (nextStatus === 'closed') {
    const { error: updateErr } = await supabaseAdmin
      .from('chat_conversations')
      .update({ status: 'closed', closed_at: now, updated_at: now })
      .eq('id', id)

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    await supabaseAdmin
      .from('chat_messages')
      .insert({ conversation_id: id, sender: 'system', body: 'Chat closed' })

    return NextResponse.json({ ok: true })
  }

  // Reopen: only safe if no other open conversation exists for the same visitor.
  // The partial unique index would reject otherwise.
  const { data: conv } = await supabaseAdmin
    .from('chat_conversations')
    .select('visitor_short_id')
    .eq('id', id)
    .single()

  if (conv?.visitor_short_id) {
    const { data: existingOpen } = await supabaseAdmin
      .from('chat_conversations')
      .select('id')
      .eq('visitor_short_id', conv.visitor_short_id)
      .eq('status', 'open')
      .neq('id', id)
      .maybeSingle()

    if (existingOpen) {
      return NextResponse.json(
        { error: 'This visitor already has an open conversation' },
        { status: 409 }
      )
    }
  }

  const { error: reopenErr } = await supabaseAdmin
    .from('chat_conversations')
    .update({ status: 'open', closed_at: null, updated_at: now })
    .eq('id', id)

  if (reopenErr) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
