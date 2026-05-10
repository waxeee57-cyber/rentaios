const SESSION_KEY = 'rentaios_session'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export async function trackEvent(
  event_type: string,
  page?: string,
  metadata?: Record<string, string>
) {
  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type,
        page: page ?? (typeof window !== 'undefined' ? window.location.pathname : ''),
        metadata: metadata ?? {},
        session_id: getSessionId(),
      }),
    })
  } catch {
    // Never throw — analytics must not break the UI
  }
}
