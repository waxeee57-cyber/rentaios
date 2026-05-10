import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  transfer_fee_eur: z.number().min(0).max(9999),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 })
  }

  const { transfer_fee_eur } = parsed.data

  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('status_history')
    .eq('id', id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const now = new Date().toISOString()
  const newHistory = [
    ...(booking.status_history ?? []),
    { status: 'transfer_fee_set', at: now, by: auth.user.email, fee: transfer_fee_eur },
  ]

  const { data: updated, error } = await supabaseAdmin
    .from('bookings')
    .update({ transfer_fee_eur, status_history: newHistory, updated_at: now })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  return NextResponse.json(updated)
}
