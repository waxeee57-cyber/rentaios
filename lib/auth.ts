import { getAuthUser } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function requireAdmin(): Promise<
  { user: { id: string; email: string } } |
  { error: NextResponse }
> {
  const user = await getAuthUser()
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: adminUser, error } = await supabaseAdmin
    .from('admin_users')
    .select('id, email')
    .eq('user_id', user.id)
    .single()

  if (error || !adminUser) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { user: { id: user.id, email: user.email ?? '' } }
}
