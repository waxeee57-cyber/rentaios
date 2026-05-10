import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params
  const { photos } = await req.json()

  if (!Array.isArray(photos)) {
    return NextResponse.json({ error: 'photos must be an array' }, { status: 400 })
  }
  if (photos.length > 20) {
    return NextResponse.json({ error: 'Maximum 20 photos' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('cars')
    .update({ photos })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
