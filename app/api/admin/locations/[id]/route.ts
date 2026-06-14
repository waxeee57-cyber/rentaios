import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'

const updateLocationSchema = z.object({
  name:        z.string().trim().min(1).max(120).optional(),
  slug:        z.string().trim().max(120).optional().nullable(),
  address:     z.string().trim().max(300).optional().nullable(),
  city:        z.string().trim().max(120).optional().nullable(),
  postal_code: z.string().trim().max(20).optional().nullable(),
  phone:       z.string().trim().max(40).optional().nullable(),
  is_active:   z.coerce.boolean().optional(),
  sort_order:  z.coerce.number().int().min(0).max(9999).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params
  const body = await req.json()
  const parsed = updateLocationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 })
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('locations')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateTag('active-locations', 'default')
  return NextResponse.json(data)
}
