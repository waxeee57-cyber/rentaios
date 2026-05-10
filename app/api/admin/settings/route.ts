import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

const settingsSchema = z.object({
  business_name:          z.string().min(1).max(200).optional(),
  business_email:         z.string().email().optional(),
  business_phone:         z.string().max(30).optional().nullable(),
  business_whatsapp:      z.string().max(20).optional().nullable(),
  business_address:       z.string().max(300).optional().nullable(),
  business_city:          z.string().max(100).optional().nullable(),
  business_country:       z.string().max(100).optional().nullable(),
  delivery_radius_km:     z.number().int().min(0).max(5000).optional().nullable(),
  delivery_base_location: z.string().max(200).optional().nullable(),
  currency_code:          z.string().length(3).optional().nullable(),
  currency_symbol:        z.string().max(5).optional().nullable(),
  min_driver_age:         z.number().int().min(18).max(99).optional().nullable(),
  min_license_years:      z.number().int().min(0).max(50).optional().nullable(),
  max_rental_days:        z.number().int().min(1).max(365).optional().nullable(),
  primary_color:          z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  logo_url:               z.string().url().max(500).optional().nullable(),
  hero_image_url:         z.string().url().max(500).optional().nullable(),
  tagline:                z.string().max(200).optional().nullable(),
  about_text:             z.string().max(5000).optional().nullable(),
  cancel_tier1_days:      z.number().int().min(0).max(365).optional().nullable(),
  cancel_tier1_pct:       z.number().int().min(0).max(100).optional().nullable(),
  cancel_tier2_days:      z.number().int().min(0).max(365).optional().nullable(),
  cancel_tier2_pct:       z.number().int().min(0).max(100).optional().nullable(),
  cancel_tier3_pct:       z.number().int().min(0).max(100).optional().nullable(),
  google_review_url:      z.string().url().max(500).optional().nullable(),
  review_email_enabled:   z.boolean().optional(),
  show_powered_by:        z.boolean().optional(),
  featured_on_showcase:   z.boolean().optional(),
  showcase_vehicle_type:  z.enum(['car', 'yacht', 'villa', 'motorcycle', 'other']).optional().nullable(),
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

  const parsed = settingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid fields', details: parsed.error.issues }, { status: 400 })
  }

  const fields = Object.fromEntries(
    Object.entries(parsed.data).filter(([, v]) => v !== undefined)
  )

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { data: existing } = await supabaseAdmin
    .from('business_config')
    .select('id')
    .single()

  let result
  if (existing?.id) {
    result = await supabaseAdmin
      .from('business_config')
      .update(fields)
      .eq('id', existing.id)
      .select()
      .single()
  } else {
    result = await supabaseAdmin
      .from('business_config')
      .insert(fields)
      .select()
      .single()
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }

  revalidateTag('business-config', 'default')
  return NextResponse.json({ ok: true, data: result.data })
}
