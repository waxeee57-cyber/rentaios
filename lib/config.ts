import { unstable_cache } from 'next/cache'
import { supabaseAdmin } from './supabase'

export type BusinessConfig = {
  id: string
  business_name: string
  business_email: string
  business_phone: string | null
  business_whatsapp: string | null
  business_address: string | null
  business_city: string
  business_country: string
  delivery_radius_km: number
  delivery_base_location: string
  currency_code: string
  currency_symbol: string
  min_driver_age: number
  min_license_years: number
  max_rental_days: number
  primary_color: string
  logo_url: string | null
  hero_image_url: string | null
  tagline: string
  about_text: string | null
  cancel_tier1_days: number
  cancel_tier1_pct: number
  cancel_tier2_days: number
  cancel_tier2_pct: number
  cancel_tier3_pct: number
  google_review_url: string | null
  review_email_enabled: boolean
  business_slug: string | null
  slug_locked: boolean
  show_powered_by: boolean
  white_label_fee_paid: boolean
  featured_on_showcase: boolean
  showcase_vehicle_type: string | null
}

export const DEFAULT_CONFIG: BusinessConfig = {
  id: '',
  business_name: process.env.NEXT_PUBLIC_BUSINESS_NAME ?? 'RentalOS',
  business_email: process.env.ADMIN_EMAIL ?? 'hello@rentaios.com',
  business_phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? null,
  business_whatsapp: process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP ?? null,
  business_address: null,
  business_city: 'Marbella',
  business_country: 'Spain',
  delivery_radius_km: 25,
  delivery_base_location: 'San Juan de los Terreros',
  currency_code: 'EUR',
  currency_symbol: '€',
  min_driver_age: 25,
  min_license_years: 2,
  max_rental_days: 14,
  primary_color: '#C8A96B',
  logo_url: null,
  hero_image_url: null,
  tagline: 'The Coast, Driven Beautifully',
  about_text: null,
  cancel_tier1_days: 7,
  cancel_tier1_pct: 100,
  cancel_tier2_days: 2,
  cancel_tier2_pct: 50,
  cancel_tier3_pct: 0,
  google_review_url: null,
  review_email_enabled: true,
  business_slug: null,
  slug_locked: false,
  show_powered_by: true,
  white_label_fee_paid: false,
  featured_on_showcase: false,
  showcase_vehicle_type: null,
}

export const getBusinessConfig = unstable_cache(
  async (): Promise<BusinessConfig> => {
    try {
      const { data, error } = await supabaseAdmin
        .from('business_config')
        .select('*')
        .single()
      if (error || !data) return DEFAULT_CONFIG
      return data as BusinessConfig
    } catch {
      return DEFAULT_CONFIG
    }
  },
  ['business-config'],
  { revalidate: 3600, tags: ['business-config'] }
)
