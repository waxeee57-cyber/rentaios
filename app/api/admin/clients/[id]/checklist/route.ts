import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

const CHECKLIST_KEYS = [
  'payment_confirmed',
  'supabase_created',
  'domain_configured',
  'business_config_set',
  'fleet_data_entered',
  'test_booking_done',
  'credentials_sent',
  'client_signed_off',
] as const

const schema = z.object({
  key: z.enum(CHECKLIST_KEYS),
  value: z.boolean(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid checklist key or value' }, { status: 400 })
  }

  const { key, value } = parsed.data

  // Fetch current checklist, merge update, write back
  const { data: current, error: fetchError } = await supabaseAdmin
    .from('client_leads')
    .select('deployment_checklist')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  const updated = { ...(current.deployment_checklist as Record<string, boolean>), [key]: value }

  const { error } = await supabaseAdmin
    .from('client_leads')
    .update({ deployment_checklist: updated })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
