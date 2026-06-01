import type { Metadata } from 'next'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://localhost:3000'

export const metadata: Metadata = {
  title: { absolute: 'Built with RentalOS — Customer Showcase' },
  description: 'Rental businesses running on RentalOS worldwide. Car rental, yacht charter, villa rental, and more.',
  alternates: { canonical: `${BASE}/customers` },
}

export const revalidate = 3600

type ShowcaseBusiness = {
  id: string
  business_name: string
  business_city: string
  business_country: string
  showcase_vehicle_type: string | null
  created_at: string
  logo_url: string | null
}

async function getShowcaseBusinesses(): Promise<ShowcaseBusiness[]> {
  const { data } = await supabaseAdmin
    .from('business_config')
    .select('id, business_name, business_city, business_country, showcase_vehicle_type, created_at, logo_url')
    .eq('featured_on_showcase', true)
    .order('created_at', { ascending: true })

  return (data ?? []) as ShowcaseBusiness[]
}

const VEHICLE_LABELS: Record<string, string> = {
  car: 'Car rental',
  yacht: 'Yacht charter',
  villa: 'Villa rental',
  motorcycle: 'Motorcycle rental',
  other: 'Rental',
}

function MemberSince(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export default async function CustomersPage() {
  const businesses = await getShowcaseBusinesses()

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold mb-3">Showcase</p>
          <h1 className="font-display text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Built with RentalOS
          </h1>
          <p className="font-sans text-base text-muted">
            Rental businesses running on RentalOS worldwide.
          </p>
        </div>

        {businesses.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-8 text-center">
            <p className="font-sans text-sm text-muted mb-2">The first live deployment will be featured here.</p>
            <p className="font-sans text-xs text-muted/60">
              Operators can opt in to the showcase from Admin → Settings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((b) => (
              <div key={b.id} className="rounded-lg border border-border bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="font-sans text-sm font-medium text-gray-900">{b.business_name}</p>
                  {b.showcase_vehicle_type && (
                    <span className="shrink-0 rounded-sm bg-gold/10 px-2 py-0.5 font-sans text-[10px] uppercase tracking-[0.1em] text-gold">
                      {VEHICLE_LABELS[b.showcase_vehicle_type] ?? b.showcase_vehicle_type}
                    </span>
                  )}
                </div>
                <p className="font-sans text-xs text-muted">
                  {b.business_city}, {b.business_country}
                </p>
                <p className="font-sans text-xs text-muted/60 mt-1">
                  Member since {MemberSince(b.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-border">
          <p className="font-sans text-sm text-muted">
            Want to be featured?{' '}
            <Link href="/contact" className="text-gold hover:underline underline-offset-4">
              Contact us →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
