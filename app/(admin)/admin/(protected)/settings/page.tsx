export const dynamic = 'force-dynamic'

import { getBusinessConfig } from '@/lib/config'
import { SettingsForm } from './SettingsForm'

export default async function SettingsPage() {
  const config = await getBusinessConfig()
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="font-display text-2xl font-medium text-white mb-6">Settings</h1>
      <SettingsForm config={config} />

      {/* Export your data */}
      <div className="mt-10 rounded-md border border-border p-6">
        <h2 className="font-display text-lg font-medium text-white mb-1">Export your data</h2>
        <p className="font-sans text-sm text-muted mb-6">
          Download your data as CSV. Your records, your files — no lock-in, ever.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="/api/admin/export/bookings"
            className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 font-sans text-xs text-muted hover:border-gold/30 hover:text-white transition-colors"
          >
            Download bookings CSV
          </a>
          <a
            href="/api/admin/export/customers"
            className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 font-sans text-xs text-muted hover:border-gold/30 hover:text-white transition-colors"
          >
            Download customers CSV
          </a>
          <a
            href="/api/admin/export/fleet"
            className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 font-sans text-xs text-muted hover:border-gold/30 hover:text-white transition-colors"
          >
            Download fleet CSV
          </a>
        </div>
      </div>
    </div>
  )
}
