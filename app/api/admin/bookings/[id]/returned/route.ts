import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params
  const { data: booking } = await supabaseAdmin.from('bookings').select('status, status_history').eq('id', id).single()

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (booking.status !== 'picked_up') return NextResponse.json({ error: 'Car must be picked up first' }, { status: 400 })

  const now = new Date().toISOString()
  const newHistory = [...(booking.status_history ?? []), { status: 'returned', at: now, by: auth.user.email }]

  await supabaseAdmin.from('bookings').update({ status: 'returned', status_history: newHistory, updated_at: now }).eq('id', id)
  return NextResponse.json({ ok: true })
}
