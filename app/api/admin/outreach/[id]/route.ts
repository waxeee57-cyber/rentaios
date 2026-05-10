import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { z } from 'zod'

const patchSchema = z.union([
  z.object({ status: z.enum(['replied', 'booked_demo', 'converted', 'not_interested', 'unsubscribed']) }),
  z.object({ notes: z.string().max(1000) }),
])

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params
  const raw = await req.json()
  const parsed = patchSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if ('status' in parsed.data) {
    update.status = parsed.data.status
    if (parsed.data.status === 'replied') update.replied_at = new Date().toISOString()
    if (parsed.data.status === 'booked_demo') update.demo_booked_at = new Date().toISOString()
    if (parsed.data.status === 'converted') update.converted_at = new Date().toISOString()
  }
  if ('notes' in parsed.data) {
    update.notes = parsed.data.notes
  }

  const { error } = await supabaseAdmin
    .from('cold_email_leads')
    .update(update)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
