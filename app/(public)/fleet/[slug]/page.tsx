export const revalidate = 60

import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { CarDetailClient } from './CarDetailClient'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ start?: string; end?: string; pickup?: string }>
}

async function getCar(slug: string) {
  const { data } = await supabaseAdmin
    .from('cars')
    .select('*')
    .eq('slug', slug)
    .neq('status', 'hidden')
    .single()
  return data
}

async function checkAvailability(carId: string, start: string, end: string): Promise<boolean> {
  const startUtc = new Date(start).toISOString()
  const endUtc = new Date(end).toISOString()

  const { data } = await supabaseAdmin
    .from('bookings')
    .select('id')
    .eq('car_id', carId)
    .in('status', ['confirmed', 'picked_up', 'returned'])
    .lt('start_at', endUtc)
    .gt('end_at', startUtc)
    .limit(1)

  return !data || data.length === 0
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const car = await getCar(slug)
  if (!car) return {}
  const title = `${car.brand} ${car.model} Rental Marbella & Costa del Sol`
  const description = car.description
    ? car.description.slice(0, 155)
    : `Hire a ${car.brand} ${car.model} (${car.year}) on the Costa del Sol. Hotel delivery, comprehensive insurance included. Personally confirmed reservation.`
  return {
    title,
    description,
    openGraph: {
      title: `${car.brand} ${car.model} — Car Rental`,
      description,
      ...(car.photos?.[0]?.url && {
        images: [{ url: car.photos[0].url, width: 1200, height: 800, alt: `${car.brand} ${car.model}` }],
      }),
    },
  }
}

export default async function CarDetailPage({ params, searchParams }: PageProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const car = await getCar(slug)
  if (!car) notFound()

  const { start, end, pickup } = sp

  let isAvailable = true
  if (start && end && car.id) {
    isAvailable = await checkAvailability(car.id, start, end)
  }

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${car.brand} ${car.model} ${car.year}`,
    description: car.description ?? `${car.brand} ${car.model} car rental in Marbella and the Costa del Sol`,
    ...(car.photos?.[0]?.url && { image: car.photos[0].url }),
    brand: { '@type': 'Brand', name: car.brand },
    offers: {
      '@type': 'Offer',
      price: car.daily_price_eur,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      seller: { '@type': 'Organization', name: process.env.NEXT_PUBLIC_BUSINESS_NAME ?? 'RentalOS' },
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <CarDetailClient
        car={car}
        initialStart={start}
        initialEnd={end}
        initialPickup={pickup}
        initialAvailable={isAvailable}
      />
    </>
  )
}
