import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { z } from 'zod'

const createCarSchema = z.object({
  brand:           z.string().trim().min(1).max(100),
  model:           z.string().trim().min(1).max(100),
  year:            z.coerce.number().int().min(1900).max(new Date().getFullYear() + 2),
  category:        z.enum(['sport', 'suv', 'sedan', 'convertible', 'luxury', 'mpv', 'furgon']),
  daily_price_eur: z.coerce.number().positive(),
  deposit_eur:     z.coerce.number().positive(),
  transmission:    z.enum(['Automatic', 'Manual']).default('Automatic'),
  fuel:            z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid']).default('Petrol'),
  seats:           z.coerce.number().int().min(1).max(20).default(2),
  license_plate:   z.string().trim().max(20).optional().nullable(),
  description:     z.string().trim().max(5000).optional().nullable(),
  location_id:     z.string().uuid().optional().nullable(),
})

export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { data, error } = await supabaseAdmin
    .from('cars')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const body = await req.json()
  const parsed = createCarSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 })
  }

  const { brand, model, year, category, daily_price_eur, deposit_eur, transmission, fuel, seats, license_plate, description, location_id } = parsed.data

  // Generate slug with collision check
  const base = `${brand}-${model}-${year}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  let slug = base
  let attempt = 0
  while (true) {
    const { data: existing } = await supabaseAdmin
      .from('cars')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (!existing) break
    attempt++
    slug = `${base}-${attempt + 1}`
    if (attempt > 10) return NextResponse.json({ error: 'Slug collision' }, { status: 500 })
  }

  const insertData: Record<string, unknown> = {
    brand,
    model,
    year,
    category,
    daily_price_eur,
    deposit_eur,
    transmission,
    fuel,
    seats,
    license_plate: license_plate ?? null,
    description: description ?? null,
    slug,
    status: 'hidden',
    photos: [],
  }
  // Additive: only reference location_id when one was chosen, so the insert is
  // byte-identical (and works) on un-migrated single-location databases.
  if (location_id) insertData.location_id = location_id

  const { data, error } = await supabaseAdmin
    .from('cars')
    .insert(insertData)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
