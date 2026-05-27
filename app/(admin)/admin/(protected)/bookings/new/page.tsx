export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase-admin'
import { ManualBookingForm } from '@/components/admin/ManualBookingForm'

async function getCars() {
  const { data } = await supabaseAdmin
    .from('cars')
    .select('id, slug, brand, model, year, daily_price_eur, deposit_eur, status')
    .neq('status', 'hidden')
    .order('brand')
  return data ?? []
}

export default async function NewBookingPage() {
  const cars = await getCars()
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-1">Admin</p>
        <h1 className="font-display text-3xl font-medium text-white">New Booking</h1>
        <p className="font-sans text-sm text-muted mt-1">
          For phone or in-person leads. Confirms with the same email flow as web inquiries.
        </p>
      </div>
      <ManualBookingForm cars={cars} />
    </div>
  )
}
