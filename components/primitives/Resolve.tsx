'use client'

import { createElement } from 'react'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils'
import type { ElementType, ReactNode } from 'react'

interface ResolveProps {
  children: ReactNode
  /** Polymorphic tag — defaults to div, use 'span' for inline content. */
  as?: ElementType
  className?: string
  /**
   * Stagger index within a group (row, list). Multiplied by the 40ms stagger
   * token and capped at 8 items, per the motion spec — beyond that the delay
   * stops growing so long lists don't take seconds to finish revealing.
   */
  index?: number
  /** Entrance direction — 'up' (default) fades/settles in place; 'left'/'right' slide in from that side. */
  direction?: 'up' | 'left' | 'right'
  /**
   * Skip the IntersectionObserver and drive visibility directly — for a
   * click-triggered reveal (an accordion panel) rather than a scroll-
   * triggered one. Omit for the default scroll behavior.
   */
  visible?: boolean
}

const STAGGER_MS = 40
const STAGGER_CAP = 8

/**
 * The site's signature entrance: blur → sharp, offset → settled, rather than
 * sliding in from off-screen. Replays every time the element crosses the 25%
 * threshold — resolving on the way in, dissolving back on the way out — so
 * scrolling back and forth stays consistent rather than only animating once.
 * Reduced-motion users get the CSS backstop in globals.css (120ms plain fade).
 * Pass `visible` to drive the same motif off click/state instead of scroll.
 *
 * Rendered via createElement, not JSX, for the polymorphic `as` tag — see
 * the comment in components/layout/Container.tsx for why (R3F's global JSX
 * augmentation breaks TS inference for a bare `ElementType` used in JSX).
 */
export function Resolve({ children, as: Tag = 'div', className, index = 0, direction = 'up', visible }: ResolveProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25, once: false })
  const isVisible = visible ?? inView
  const delay = Math.min(index, STAGGER_CAP) * STAGGER_MS

  return createElement(
    Tag,
    {
      ref,
      className: cn('resolve', className),
      'data-visible': isVisible,
      'data-direction': direction,
      style: { transitionDelay: isVisible ? `${delay}ms` : '0ms' },
    },
    children,
  )
}
