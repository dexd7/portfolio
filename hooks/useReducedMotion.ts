'use client'

import { useEffect, useState } from 'react'

/**
 * Centralizes `prefers-reduced-motion` so every primitive reads it the same
 * way instead of each component re-implementing the media query. Paired with
 * the CSS backstop in globals.css (`@media (prefers-reduced-motion: reduce)`)
 * for the primitives that animate outside React's render cycle.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)

    const listener = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener('change', listener)
    return () => query.removeEventListener('change', listener)
  }, [])

  return reduced
}
