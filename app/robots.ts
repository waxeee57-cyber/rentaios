import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/booking/', '/demo/'],
      },
      {
        userAgent: ['GPTBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'anthropic-ai', 'Applebot-Extended', 'cohere-ai'],
        allow: '/',
        disallow: ['/admin/', '/api/', '/booking/', '/demo/'],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'}/sitemap.xml`,
  }
}
