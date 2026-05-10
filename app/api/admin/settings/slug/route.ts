import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  business_slug: z.string().regex(/^[a-z0-9-]{3,30}$/, {
    message: 'Slug must be 3–30 characters: lowercase letters, numbers, and hyphens only.',
  }),
})

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid slug' }, { status: 400 })
  }

  const { business_slug } = parsed.data

  const { data: existing } = await supabaseAdmin
    .from('business_config')
    .select('id, slug_locked')
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Business config not found' }, { status: 404 })
  }

  if (existing.slug_locked) {
    return NextResponse.json({ error: 'Slug is locked and cannot be changed.' }, { status: 409 })
  }

  const { data: conflict } = await supabaseAdmin
    .from('business_config')
    .select('id')
    .eq('business_slug', business_slug)
    .neq('id', existing.id)
    .maybeSingle()

  if (conflict) {
    return NextResponse.json({ error: 'This slug is already taken. Choose a different one.' }, { status: 409 })
  }

  const { error } = await supabaseAdmin
    .from('business_config')
    .update({ business_slug, slug_locked: true })
    .eq('id', existing.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidateTag('business-config', 'default')
  return NextResponse.json({ ok: true, business_slug })
}
