import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { z } from 'zod'

const VALID_VERTICALS = [
  'yacht', 'villa', 'motorcycle',
  'multi_language', 'arabic', 'deposit_hold', 'other',
  'sms_notifications',
] as const

const schema = z.object({
  email: z.string().email(),
  vertical: z.enum(VALID_VERTICALS).optional().default('other'),
  source_page: z.string().max(200).optional(),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!rateLimit(ip, 5, 3_600_000)) {
    return NextResponse.json({ success: true })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid fields' }, { status: 400 })
  }

  await supabaseAdmin
    .from('waitlist')
    .upsert(
      {
        email: parsed.data.email,
        vertical: parsed.data.vertical,
        source_page: parsed.data.source_page ?? null,
      },
      { onConflict: 'email,vertical', ignoreDuplicates: true }
    )

  return NextResponse.json({ success: true })
}
