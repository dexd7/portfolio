'use client'

import { useEffect, useState } from 'react'

function format(timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date())
}

/**
 * Returns `null` until mounted, then the formatted local time, ticking every
 * `updateMs`. Starting at `null` (not a server-computed guess) avoids any
 * server/client render mismatch — server and first client paint both render
 * nothing, the real value fills in a moment later.
 */
export function useLocalTime(timeZone: string, updateMs = 30_000): string | null {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const update = () => setTime(format(timeZone))
    update()
    const id = setInterval(update, updateMs)
    return () => clearInterval(id)
  }, [timeZone, updateMs])

  return time
}
