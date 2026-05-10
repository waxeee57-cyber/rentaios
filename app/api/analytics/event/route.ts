import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { z } from 'zod'

const VALID_EVENTS = [
  'page_view', 'cta_click', 'form_start',
  'form_complete', 'demo_view', 'pricing_view',
  'trial_start', 'waitlist_join',
] as const

const schema = z.object({
  event_type: z.enum(VALID_EVENTS),
  page: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  session_id: z.string().max(100).optional(),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!rateLimit(ip, 60, 3_600_000)) {
    return NextResponse.json({ ok: true })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: true })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: true })
  }

  const { event_type, page, metadata, session_id } = parsed.data
  const meta = metadata ?? {}

  const metaStr = JSON.stringify(meta)
  if (metaStr.length > 500) {
    return NextResponse.json({ ok: true })
  }

  try {
    await supabaseAdmin
      .from('page_events')
      .insert({ event_type, page: page ?? null, metadata: meta, session_id: session_id ?? null })
  } catch {
    // Non-fatal
  }

  return NextResponse.json({ ok: true })
}
