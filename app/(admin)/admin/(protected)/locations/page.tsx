export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase'
import { getBusinessConfig } from '@/lib/config'
import { LocationsManager, type LocationRow } from '@/components/admin/LocationsManager'

export default async function AdminLocationsPage() {
  const config = await getBusinessConfig()
  const { data } = await supabaseAdmin
    .from('locations')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-white">Locations</h1>
      </div>
      <p className="mb-6 font-sans text-sm text-muted">
        {config.multi_location_enabled === true
          ? 'Multi-location is ON. The storefront shows a location picker and filters the fleet.'
          : 'Multi-location is OFF. These locations are not shown on the storefront yet (enable multi_location_enabled in business config).'}
      </p>

      <LocationsManager locations={(data ?? []) as LocationRow[]} />
    </div>
  )
}
