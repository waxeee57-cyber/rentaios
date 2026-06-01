export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { CarsManager } from '@/components/admin/CarsManager'

interface PageProps {
  searchParams: Promise<{ expand?: string }>
}

export default async function AdminCarsPage({ searchParams }: PageProps) {
  const { expand } = await searchParams

  const { data: cars } = await supabaseAdmin
    .from('cars')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-white">Fleet</h1>
        <Link
          href="/admin/cars/new"
          className="flex items-center gap-1.5 min-h-[44px] rounded-md border border-gold/40 px-4 font-sans text-xs uppercase tracking-[0.15em] text-gold hover:bg-gold hover:text-black transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Car
        </Link>
      </div>

      <CarsManager cars={(cars ?? []) as Parameters<typeof CarsManager>[0]['cars']} expandId={expand} />
    </div>
  )
}
