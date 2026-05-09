export const dynamic = 'force-dynamic'

import { getBusinessConfig } from '@/lib/config'
import { SettingsForm } from './SettingsForm'

export default async function SettingsPage() {
  const config = await getBusinessConfig()
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="font-display text-2xl font-medium text-white mb-6">Settings</h1>
      <SettingsForm config={config} />
    </div>
  )
}
