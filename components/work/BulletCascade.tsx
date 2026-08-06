'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface BulletCascadeProps {
  bullets: string[]
}

// A NEGATIVE margin here (an actual overlap) was tried and reverted: these
// bullets wrap to 1-2 lines depending on length, so a fixed overlap covers
// the second line of any longer bullet sitting under a shorter one — a real
// legibility bug, not a style tradeoff. A small POSITIVE gap plus the tilt
// below is what carries the "loosely piled slips" read instead — the visual
// separation comes from each slip sitting at its own angle with a shadow,
// not from literally covering the one before it.
const GAP_PX = 14

// A deterministic small tilt per slip, via the golden-ratio conjugate (the
// same low-discrepancy trick used elsewhere in this project for spacing
// pseudo-randomness without an RNG) — avoids two adjacent slips landing at
// the same angle, which would look mechanical rather than "loosely piled."
const ROTATE_RANGE_DEG = 1.6
function tileRotation(index: number): number {
  const t = (index * 0.6180339887) % 1
  return (t - 0.5) * 2 * ROTATE_RANGE_DEG
}

const SLIDE_PX = 56
// How much each tile's own reveal "zone" overlaps its neighbors' along the
// shared 0..1 scroll-progress axis. 1 = zones exactly tile-sized (crisp,
// sequential); higher spreads reveals out so consecutive tiles ease in a
// little more gradually rather than snapping.
const ZONE_SPREAD = 1.6

/**
 * The project's real resume bullets, replacing the old fabricated
 * architecture diagram. Reveal is a CONTINUOUS function of scroll position,
 * not a visibility threshold — two prior attempts (a per-tile
 * IntersectionObserver, then triggering off the accordion's open state)
 * both failed for the same underlying reason: this list is short enough
 * (3-4 bullets) that it's usually already entirely inside the viewport the
 * instant the panel is open, so any "is it visible" check fires for every
 * tile on the same frame regardless of what triggers the check. Mapping
 * reveal directly to how far the container has scrolled through the
 * viewport — the same technique components/about/PortraitStage.tsx already
 * uses for its scroll-driven exit — works regardless of the panel's height,
 * because it never asks "is this tile visible," only "how far through this
 * element's scroll range are we."
 *
 * Written directly to each tile's DOM style in a scroll listener — no React
 * state, so scrolling never re-renders this tree (this project's hard rule
 * for scroll-driven values, after a real re-render-storm bug earlier on).
 * A short CSS transition on the tile only smooths between scroll-event
 * ticks; it's far shorter than a normal entrance animation so it never
 * fights fast scrolling.
 */
export function BulletCascade({ bullets }: BulletCascadeProps) {
  const containerRef = useRef<HTMLUListElement>(null)
  const tileRefs = useRef<(HTMLLIElement | null)[]>([])
  const reducedMotion = useReducedMotion()
  const n = bullets.length

  useEffect(() => {
    if (reducedMotion) {
      // Static: fully revealed, no transform, no listener.
      for (const el of tileRefs.current) {
        if (!el) continue
        el.style.opacity = '1'
        el.style.transform = 'none'
      }
      return
    }

    const onScroll = () => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const vh = window.innerHeight

      // 0 when the container's top has just entered the viewport from the
      // bottom, 1 when its bottom has just left the viewport at the top —
      // i.e. how far we've scrolled through this element's own range,
      // regardless of whether that range is shorter or taller than the
      // viewport itself.
      const total = rect.height + vh
      const progress = total > 0 ? Math.min(1, Math.max(0, (vh - rect.top) / total)) : 0

      for (let i = 0; i < n; i++) {
        const el = tileRefs.current[i]
        if (!el) continue
        const zoneStart = i / n
        const zoneEnd = zoneStart + ZONE_SPREAD / n
        const raw = zoneEnd > zoneStart ? (progress - zoneStart) / (zoneEnd - zoneStart) : progress >= zoneStart ? 1 : 0
        const t = Math.min(1, Math.max(0, raw))
        const eased = t * t * (3 - 2 * t) // smoothstep
        el.style.opacity = eased.toFixed(3)
        el.style.transform = `translateX(${(-(1 - eased) * SLIDE_PX).toFixed(1)}px) rotate(${tileRotation(i).toFixed(2)}deg)`
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [reducedMotion, n])

  return (
    <ul ref={containerRef} className="flex flex-col">
      {bullets.map((bullet, index) => (
        <li
          key={bullet}
          ref={(el) => {
            tileRefs.current[index] = el
          }}
          className="tile border-l-2 border-[var(--color-signal)] bg-[var(--color-surface)] px-5 py-4"
          style={{ marginTop: index === 0 ? 0 : GAP_PX, opacity: 0 }}
        >
          <p className="text-body text-[var(--color-text-secondary)]">{bullet}</p>
        </li>
      ))}
    </ul>
  )
}
