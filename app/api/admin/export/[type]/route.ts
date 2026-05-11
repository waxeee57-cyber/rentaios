import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const VALID_TYPES = ['bookings', 'customers', 'fleet'] as const
type ExportType = (typeof VALID_TYPES)[number]

function toCsv(rows: (string | number | null | undefined)[][]): string {
  return rows
    .map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
}

function str(v: unknown): string {
  return String(v ?? '')
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const ip = getClientIp(req)
  if (!rateLimit(`export:${ip}`, 5, 3_600_000)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again in an hour.' }, { status: 429 })
  }

  const { type: rawType } = await params
  if (!(VALID_TYPES as readonly string[]).includes(rawType)) {
    return NextResponse.json({ error: 'Invalid type. Use: bookings, customers, or fleet.' }, { status: 400 })
  }

  const type = rawType as ExportType
  const date = new Date().toISOString().slice(0, 10)

  if (type === 'bookings') {
    const { data } = await supabaseAdmin
      .from('bookings')
      .select('booking_code, status, start_at, end_at, days, total_eur, deposit_eur, created_at, car:cars(brand, model, year), customer:customers(full_name, email)')
      .eq('is_demo', false)
      .order('created_at', { ascending: false })

    const rows: string[][] = [
      ['Booking Code', 'Status', 'Start Date', 'End Date', 'Days', 'Total (EUR)', 'Deposit (EUR)', 'Vehicle', 'Customer Name', 'Customer Email', 'Created'],
    ]
    for (const b of data ?? []) {
      const car = Array.isArray(b.car) ? (b.car[0] ?? null) : b.car
      const cust = Array.isArray(b.customer) ? (b.customer[0] ?? null) : b.customer
      rows.push([
        str(b.booking_code),
        str(b.status),
        str(b.start_at).slice(0, 10),
        str(b.end_at).slice(0, 10),
        str(b.days),
        str(b.total_eur),
        str(b.deposit_eur),
        car ? `${str((car as { brand: string }).brand)} ${str((car as { model: string }).model)} ${str((car as { year: number }).year)}` : '',
        str((cust as { full_name?: string } | null)?.full_name),
        str((cust as { email?: string } | null)?.email),
        str(b.created_at).slice(0, 10),
      ])
    }
    return new NextResponse(toCsv(rows), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="bookings-export-${date}.csv"`,
      },
    })
  }

  if (type === 'customers') {
    const { data } = await supabaseAdmin
      .from('customers')
      .select('full_name, email, phone, created_at, notes')
      .order('created_at', { ascending: false })

    const rows: string[][] = [
      ['Full Name', 'Email', 'Phone', 'Created', 'Notes'],
    ]
    for (const c of data ?? []) {
      rows.push([
        str(c.full_name),
        str(c.email),
        str((c as { phone?: string }).phone),
        str(c.created_at).slice(0, 10),
        str((c as { notes?: string }).notes),
      ])
    }
    return new NextResponse(toCsv(rows), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="customers-export-${date}.csv"`,
      },
    })
  }

  // fleet
  const { data } = await supabaseAdmin
    .from('cars')
    .select('brand, model, year, slug, daily_price_eur, status')
    .eq('is_demo', false)
    .order('brand', { ascending: true })

  const rows: string[][] = [
    ['Brand', 'Model', 'Year', 'Slug', 'Daily Rate (EUR)', 'Status'],
  ]
  for (const c of data ?? []) {
    rows.push([
      str(c.brand),
      str(c.model),
      str(c.year),
      str(c.slug),
      str(c.daily_price_eur),
      str(c.status),
    ])
  }
  return new NextResponse(toCsv(rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="fleet-export-${date}.csv"`,
    },
  })
}
