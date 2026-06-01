import { getRequestConfig } from 'next-intl/server'
import { headers } from 'next/headers'

const SUPPORTED = ['en', 'hu'] as const
type Locale = (typeof SUPPORTED)[number]

function detectLocale(pathname: string): Locale {
  if (pathname.startsWith('/hu')) return 'hu'
  return 'en'
}

export default getRequestConfig(async () => {
  const hdrs = await headers()
  const pathname = hdrs.get('x-pathname') ?? hdrs.get('x-forwarded-uri') ?? '/'
  const locale = detectLocale(pathname)

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
