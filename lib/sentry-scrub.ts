// PII scrubbing for Sentry events. Pure (no env, no secrets) so it is safe to
// import from BOTH the server and the client instrumentation entry points.
//
// RentalOS rule: visitor_email and chat/session tokens must NEVER leave the
// system. Booking status URLs carry ?email=...; chat carries session_id. This
// strips all of it before an event is sent to Sentry.

const SENSITIVE_KEY_RE =
  /(email|phone|token|authorization|cookie|password|secret|session[_-]?id|visitor)/i

// Sentry's event/payload shapes are loosely typed across versions; we operate
// structurally and defensively, so `any` is the pragmatic choice here.
/* eslint-disable @typescript-eslint/no-explicit-any */

function redactDeep(value: any, depth = 0): any {
  if (value == null || depth > 6) return value
  if (Array.isArray(value)) return value.map((v) => redactDeep(v, depth + 1))
  if (typeof value === 'object') {
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = SENSITIVE_KEY_RE.test(k) ? '[redacted]' : redactDeep(v, depth + 1)
    }
    return out
  }
  return value
}

export function scrubEvent(event: any): any {
  try {
    // Identity — never attach who the user is.
    if (event.user) {
      delete event.user.email
      delete event.user.ip_address
      delete event.user.username
    }

    if (event.request) {
      // Query string may contain ?email=...&token=...
      if (typeof event.request.query_string === 'string') {
        event.request.query_string = '[scrubbed]'
      }
      delete event.request.cookies
      if (event.request.headers) {
        for (const h of Object.keys(event.request.headers)) {
          if (SENSITIVE_KEY_RE.test(h) || /x-(health|ops)-secret/i.test(h)) {
            delete event.request.headers[h]
          }
        }
      }
      if (event.request.data) event.request.data = redactDeep(event.request.data)
    }

    if (event.extra) event.extra = redactDeep(event.extra)
    if (event.contexts) event.contexts = redactDeep(event.contexts)
  } catch {
    // Scrubbing must never throw — better to drop the event than crash.
    return {}
  }
  return event
}

export function scrubBreadcrumb(crumb: any): any {
  try {
    if (crumb.data) crumb.data = redactDeep(crumb.data)
    if (typeof crumb.message === 'string') {
      crumb.message = crumb.message.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]')
    }
  } catch {
    /* ignore */
  }
  return crumb
}
