// Client-side observability entry point (Next.js native, runs before hydration).
// Initialises the browser Sentry SDK ONLY when NEXT_PUBLIC_SENTRY_DSN is set.
// Inert by default so the client bundle ships no telemetry without a DSN.

import * as Sentry from '@sentry/nextjs'
import { scrubEvent, scrubBreadcrumb } from '@/lib/sentry-scrub'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENV ?? process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_RELEASE,
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    // No Session Replay / no PII capture — visitor email & chat tokens stay local.
    sendDefaultPii: false,
    beforeSend: (event) => scrubEvent(event),
    beforeBreadcrumb: (crumb) => scrubBreadcrumb(crumb),
  })
}

// Instrument client-side navigations for tracing (no-op if Sentry is inert).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
