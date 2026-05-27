import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const bodySchema = z.object({
  email: z.string().email(),
  source: z.string().max(64).default('exit_intent'),
  locale: z.enum(['en', 'hu']).default('en'),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!rateLimit(ip, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { email, source, locale } = parsed.data

  const { error } = await supabaseAdmin
    .from('leads')
    .upsert({ email, source, locale }, { onConflict: 'email,source', ignoreDuplicates: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
