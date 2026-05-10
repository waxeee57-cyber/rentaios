import type { Metadata } from 'next'
import { getAuthUser } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { ReferralPublicForm } from './ReferralPublicForm'
import { ReferralAdminDashboard } from './ReferralAdminDashboard'

export const metadata: Metadata = {
  title: 'Refer a rental business — RentalOS',
  description: 'Refer a rental business to RentalOS. When they subscribe, you both get one month free.',
}

type Referral = {
  id: string
  referrer_code: string
  referee_email: string | null
  referee_business: string | null
  status: string
  credited_at: string | null
  created_at: string
}

async function getAdminReferrals(email: string): Promise<{ code: string; referrals: Referral[] }> {
  // Look up or create a referral row for this admin email
  const { data: existing } = await supabaseAdmin
    .from('referrals')
    .select('*')
    .eq('referrer_email', email)
    .order('created_at', { ascending: false })

  if (existing && existing.length > 0) {
    const myCode = existing[0].referrer_code as string
    return { code: myCode, referrals: existing as Referral[] }
  }

  // Create one
  const { data: created } = await supabaseAdmin
    .from('referrals')
    .insert({ referrer_email: email })
    .select()
    .single()

  return {
    code: (created as Referral | null)?.referrer_code ?? '',
    referrals: created ? [created as Referral] : [],
  }
}

export default async function ReferPage() {
  const user = await getAuthUser()

  if (user?.email) {
    const { code, referrals } = await getAdminReferrals(user.email)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'
    const referralLink = `${siteUrl}/r/${code}`
    const creditedCount = referrals.filter(r => r.status === 'credited').length

    return (
      <ReferralAdminDashboard
        referralLink={referralLink}
        referrals={referrals}
        creditedCount={creditedCount}
      />
    )
  }

  return <ReferralPublicForm />
}
