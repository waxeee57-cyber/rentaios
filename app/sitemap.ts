import type { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: cars } = await supabaseAdmin
    .from('cars')
    .select('slug')
    .neq('status', 'hidden')
    .eq('is_demo', false)

  const carUrls: MetadataRoute.Sitemap = (cars ?? []).map((car) => ({
    url: `${BASE_URL}/fleet/${car.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(), changeFrequency: 'daily', priority: 1.0,
      alternates: { languages: { en: BASE_URL, hu: `${BASE_URL}/hu` } },
    },
    { url: `${BASE_URL}/sell`,                                    lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9,
      alternates: { languages: { en: `${BASE_URL}/pricing`, hu: `${BASE_URL}/hu/pricing` } },
    },
    { url: `${BASE_URL}/faq`,                                     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/about`,                                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`,                                 lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/customers`,                               lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE_URL}/refer`,                                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/onboarding`,                              lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/car-rental-booking-software`,             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/yacht-charter-booking-system`,            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/villa-rental-management-software`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/luxury-rental-software-marbella`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/car-rental-software-dubai`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/yacht-charter-software-mediterranean`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/hu`,                                      lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/hu/pricing`,                              lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/privacy`,                                 lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE_URL}/terms`,                                   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE_URL}/cookies`,                                 lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.1 },
    { url: `${BASE_URL}/insurance`,                               lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE_URL}/cancellation`,                            lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    ...carUrls,
  ]
}
