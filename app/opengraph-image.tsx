import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'RentalOS — Rental Booking System'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          background: '#0f1117',
          padding: '64px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c9a84c' }} />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            RentalOS
          </span>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span style={{ color: '#fff', fontSize: '60px', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.02em' }}>
            Every booking, captured.
          </span>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '60px', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.02em' }}>
            Every customer, confirmed.
          </span>
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '16px' }}>rentalos.vercel.app</span>
          <span
            style={{
              background: '#c9a84c',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '10px 24px',
              borderRadius: '6px',
            }}
          >
            From €79/month
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}
