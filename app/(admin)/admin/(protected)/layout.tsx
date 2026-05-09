import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/supabase-server'
import { getBusinessConfig } from '@/lib/config'
import { AdminNav } from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()
  if (!user) redirect('/admin/login')

  const config = await getBusinessConfig()

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
