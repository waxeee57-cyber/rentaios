import type { Metadata } from 'next'
import { DemoTabs } from '@/app/(demo)/DemoTabs'
import { DemoAdminClient } from './DemoAdminClient'

export const metadata: Metadata = {
  title: 'Demo Admin Panel',
  description: 'Explore the RentalOS admin panel in demo mode. See how bookings are managed.',
  robots: { index: false },
}

export default function DemoAdminPage() {
  return (
    <>
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <DemoTabs active="admin" />
      </div>
      <DemoAdminClient />
    </>
  )
}
