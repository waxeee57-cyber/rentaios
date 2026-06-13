import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  // Demo tenant (Bérelj ki!) is a single rental business, not the RentalOS
  // SaaS funnel — land visitors straight on the storefront.
  async redirects() {
    return [{ source: '/', destination: '/fleet', permanent: false }]
  },
}

export default nextConfig
