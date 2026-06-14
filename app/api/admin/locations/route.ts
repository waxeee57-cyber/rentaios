import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'

const createLocationSchema = z.object({
  name:        z.string().trim().min(1).max(120),
  slug:        z.string().trim().max(120).optional().nullable(),
  address:     z.string().trim().max(300).optional().nullable(),
  city:        z.string().trim().max(120).optional().nullable(),
  postal_code: z.string().trim().max(20).optional().nullable(),
  phone:       z.string().trim().max(40).optional().nullable(),
  is_active:   z.coerce.boolean().optional().default(true),
  sort_order:  z.coerce.number().int().min(0).max(9999).optional().default(0),
})

export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { data, error } = await supabaseAdmin
    .from('locations')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const body = await req.json()
  const parsed = createLocationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('locations')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateTag('active-locations', 'default')
  return NextResponse.json(data, { status: 201 })
}
