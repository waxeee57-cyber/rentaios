import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE === 'true') {
    const { pathname } = request.nextUrl
    if (
      pathname === '/maintenance' ||
      pathname.startsWith('/admin') ||
      pathname === '/api/health' ||
      pathname.startsWith('/_next')
    ) {
      return NextResponse.next()
    }
    return NextResponse.rewrite(new URL('/maintenance', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
