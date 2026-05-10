import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { sendOnboardingEmails } from '@/lib/email/send'

const schema = z.object({
  business_name:              z.string().min(1).max(200),
  contact_name:               z.string().min(2).max(200),
  contact_email:              z.string().email(),
  business_type:              z.enum(['Car rental', 'Yacht charter', 'Villa rental', 'Motorcycle rental', 'other']),
  business_type_custom:       z.string().max(100).optional(),
  business_city:              z.string().min(1).max(100),
  business_country:           z.string().min(1).max(100),
  current_booking_method:     z.string().optional(),
  monthly_bookings_estimate:  z.string().optional(),
  vehicle_count:              z.number().int().min(1).max(9999).optional(),
  domain_name:                z.string().max(200).optional(),
  preferred_language:         z.string().min(1).max(50),
  logo_url:                   z.string().url().optional().or(z.literal('')),
  brand_color:                z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#C8A96B'),
  tagline:                    z.string().max(80).optional(),
  delivery_location:          z.string().min(1).max(200),
  delivery_radius:            z.string().min(1),
  min_driver_age:             z.number().int().min(18).max(99).default(25),
  min_license_years:          z.number().int().min(1).max(10).default(2),
  max_rental_days:            z.number().int().min(1).max(365).default(14),
  cancellation_policy:        z.enum(['flexible', 'moderate', 'strict', 'custom']),
  notes:                      z.string().max(500).optional(),
  referral_source:            z.string().optional(),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!rateLimit(ip, 3, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 })
  }

  const d = parsed.data

  const { data: lead, error } = await supabaseAdmin
    .from('client_leads')
    .insert({
      business_name: d.business_name,
      contact_name: d.contact_name,
      contact_email: d.contact_email,
      business_type: d.business_type,
      business_type_custom: d.business_type_custom ?? null,
      business_city: d.business_city,
      business_country: d.business_country,
      current_booking_method: d.current_booking_method ?? null,
      monthly_bookings_estimate: d.monthly_bookings_estimate ?? null,
      vehicle_count: d.vehicle_count ?? null,
      domain_name: d.domain_name ?? null,
      preferred_language: d.preferred_language,
      logo_url: d.logo_url || null,
      brand_color: d.brand_color,
      tagline: d.tagline ?? null,
      delivery_location: d.delivery_location,
      delivery_radius: d.delivery_radius,
      min_driver_age: d.min_driver_age,
      min_license_years: d.min_license_years,
      max_rental_days: d.max_rental_days,
      cancellation_policy: d.cancellation_policy,
      notes: d.notes ?? null,
      referral_source: d.referral_source ?? null,
      status: 'new',
    })
    .select('id')
    .single()

  if (error || !lead) {
    console.error('[Onboarding] DB insert failed:', error?.message)
    return NextResponse.json({ error: 'Failed to save your details. Please try again.' }, { status: 500 })
  }

  // Fire-and-forget
  sendOnboardingEmails({
    leadId: lead.id,
    contactName: d.contact_name,
    contactEmail: d.contact_email,
    businessName: d.business_name,
    businessType: d.business_type,
    businessTypeCustom: d.business_type_custom,
    businessCity: d.business_city,
    businessCountry: d.business_country,
    currentBookingMethod: d.current_booking_method,
    monthlyBookingsEstimate: d.monthly_bookings_estimate,
    vehicleCount: d.vehicle_count,
    domainName: d.domain_name,
    preferredLanguage: d.preferred_language,
    logoUrl: d.logo_url || undefined,
    brandColor: d.brand_color,
    tagline: d.tagline,
    deliveryLocation: d.delivery_location,
    deliveryRadius: d.delivery_radius,
    minDriverAge: d.min_driver_age,
    minLicenseYears: d.min_license_years,
    maxRentalDays: d.max_rental_days,
    cancellationPolicy: d.cancellation_policy,
    notes: d.notes,
    referralSource: d.referral_source,
  }).catch(console.error)

  return NextResponse.json({ success: true, id: lead.id })
}
