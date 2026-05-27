export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase-admin'
import { ClientsList } from './ClientsList'

export type ClientLead = {
  id: string
  business_name: string
  contact_name: string
  contact_email: string
  business_type: string
  business_type_custom: string | null
  business_city: string
  business_country: string
  current_booking_method: string | null
  monthly_bookings_estimate: string | null
  vehicle_count: number | null
  domain_name: string | null
  preferred_language: string
  logo_url: string | null
  brand_color: string
  tagline: string | null
  delivery_location: string | null
  delivery_radius: string
  min_driver_age: number
  min_license_years: number
  max_rental_days: number
  cancellation_policy: string
  notes: string | null
  referral_source: string | null
  status: 'new' | 'contacted' | 'in_progress' | 'live' | 'cancelled'
  deployment_checklist: Record<string, boolean>
  admin_notes: string | null
  created_at: string
  updated_at: string
}

async function getLeads(): Promise<ClientLead[]> {
  const { data, error } = await supabaseAdmin
    .from('client_leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Clients] Failed to fetch leads:', error.message)
    return []
  }

  return (data ?? []) as ClientLead[]
}

export default async function ClientsPage() {
  const leads = await getLeads()

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-medium text-white">Clients</h1>
        <span className="font-sans text-xs text-muted">{leads.length} total</span>
      </div>
      <ClientsList initialLeads={leads} />
    </div>
  )
}
