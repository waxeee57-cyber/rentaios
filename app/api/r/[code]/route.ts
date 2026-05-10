import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params

  if (!code || code.length > 32) {
    return NextResponse.redirect(new URL('/', SITE_URL))
  }

  const { data: referral } = await supabaseAdmin
    .from('referrals')
    .select('id, referrer_code')
    .eq('referrer_code', code)
    .single()

  if (!referral) {
    return NextResponse.redirect(new URL('/', SITE_URL))
  }

  const redirectUrl = new URL('/', SITE_URL)
  redirectUrl.searchParams.set('ref', code)

  const response = NextResponse.redirect(redirectUrl)
  response.cookies.set('referral_code', code, {
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
  })

  return response
}
