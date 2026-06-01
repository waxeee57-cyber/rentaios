// Server-side observability entry point (Next.js native instrumentation hook).
// Initialises Sentry for the Node and Edge runtimes ONLY when SENTRY_DSN is set.
// With no DSN (the default / placeholder) this is fully inert — no events, no
// network, no overhead — so the app builds and runs identically without Sentry.

import * as Sentry from '@sentry/nextjs'
import { scrubEvent, scrubBreadcrumb } from '@/lib/sentry-scrub'

export function register() {
  const dsn = process.env.SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENV ?? process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.SENTRY_RELEASE,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    // Defence in depth: never let the SDK collect IPs / request bodies by default.
    sendDefaultPii: false,
    beforeSend: (event) => scrubEvent(event),
    beforeBreadcrumb: (crumb) => scrubBreadcrumb(crumb),
  })
}

// Capture errors thrown in Server Components, Route Handlers, Server Actions.
export const onRequestError = Sentry.captureRequestError
