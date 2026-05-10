'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

export function TrackEventOnMount({
  event,
  metadata,
}: {
  event: string
  metadata?: Record<string, string>
}) {
  useEffect(() => {
    trackEvent(event, undefined, metadata)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
