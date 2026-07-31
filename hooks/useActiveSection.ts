'use client'

import { useEffect, useState } from 'react'

/**
 * Tracks which of the given element ids currently sits in the vertical
 * center band of the viewport. Powers the section rail's scroll-progress
 * fill. `ids` is expected to be referentially stable (a module-level
 * constant) — this hook does not defend against a new array every render.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        const topmost = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (topmost) setActive(topmost.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )

    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null)
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids])

  return active
}
