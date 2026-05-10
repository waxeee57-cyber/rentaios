import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { getBusinessConfig } from '@/lib/config'
import { AdminNav } from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()
  if (!user) redirect('/admin/login')

  const [config, subResult] = await Promise.all([
    getBusinessConfig(),
    supabaseAdmin.from('subscriptions').select('access_locked').limit(1).maybeSingle(),
  ])

  const isLocked = subResult.data?.access_locked === true

  return (
    <div className="min-h-screen bg-black">
      {/* Admin top bar */}
      <header className="border-b border-border bg-graphite">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-base font-medium text-white">{config.business_name}</span>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold">Admin</span>
          </div>
          <SignOutButton />
        </div>
      </header>
      <AdminNav />
      <main>{children}</main>

      {/* Account suspension overlay — shown when payment is overdue */}
      {isLocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6">
          <div className="w-full max-w-md rounded-md border border-danger/30 bg-graphite p-8 text-center">
            <p className="mb-1 font-sans text-xs uppercase tracking-[0.2em] text-danger">Account suspended</p>
            <h2 className="mb-4 font-display text-2xl font-light text-white">Payment required</h2>
            <p className="mb-6 font-sans text-sm leading-relaxed text-muted">
              Your subscription payment failed and your account has been suspended.
              Update your payment method to restore access immediately.
              Your data is safe.
            </p>
            <Link
              href="/admin/billing"
              className="inline-flex items-center justify-center rounded-md bg-gold px-8 py-3 font-sans text-sm font-medium text-black hover:opacity-90 transition-opacity"
            >
              Reactivate account →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function SignOutButton() {
  return (
    <form action="/api/admin/signout" method="POST">
      <button
        type="submit"
        className="font-sans text-xs uppercase tracking-[0.15em] text-muted hover:text-white transition-colors"
      >
        Sign out
      </button>
    </form>
  )
}
