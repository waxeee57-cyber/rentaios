import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { uploadCarPhoto } from '@/lib/storage'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params

  const { data: car } = await supabaseAdmin
    .from('cars')
    .select('slug, brand, model, photos')
    .eq('id', id)
    .single()

  if (!car) return NextResponse.json({ error: 'Car not found' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })

  const result = await uploadCarPhoto(file, car.slug)
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 500 })

  const currentPhotos = Array.isArray(car.photos) ? car.photos : []
  const newPhotos = [...currentPhotos, { url: result.url, alt: `${car.brand} ${car.model}` }]

  const { error: updateError } = await supabaseAdmin
    .from('cars')
    .update({ photos: newPhotos })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: 'Failed to update photos' }, { status: 500 })

  return NextResponse.json({ url: result.url })
}
