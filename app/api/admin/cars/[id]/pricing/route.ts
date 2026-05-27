import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params
  const body = await req.json()
  const { daily_price_eur, deposit_eur } = body

  if (!daily_price_eur || !deposit_eur || Number(daily_price_eur) <= 0 || Number(deposit_eur) <= 0) {
    return NextResponse.json({ error: 'Prices must be greater than 0' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('cars')
    .update({ daily_price_eur: Number(daily_price_eur), deposit_eur: Number(deposit_eur) })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
