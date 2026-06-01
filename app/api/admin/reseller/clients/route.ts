import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

const createSchema = z.object({
  agency_code: z.string().min(1).max(50),
  client_business_name: z.string().min(1).max(200),
  client_email: z.string().email(),
  client_plan: z.enum(['starter', 'growth', 'pro']).optional(),
  client_domain: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
})

export async function GET(_req: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { data, error } = await supabaseAdmin
    .from('agency_clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ clients: data })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid fields', details: parsed.error.issues }, { status: 400 })
  }

  const { data: client, error } = await supabaseAdmin
    .from('agency_clients')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ client })
}
