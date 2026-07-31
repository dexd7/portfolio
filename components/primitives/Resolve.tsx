'use client'

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
}

const STAGGER_MS = 40
const STAGGER_CAP = 8

/**
 * The site's signature entrance: blur → sharp, offset → settled, rather than
 * sliding in from off-screen. Replays every time the element crosses the 25%
 * threshold — resolving on the way in, dissolving back on the way out — so
 * scrolling back and forth stays consistent rather than only animating once.
 * Reduced-motion users get the CSS backstop in globals.css (120ms plain fade).
 */
export function Resolve({ children, as: Tag = 'div', className, index = 0 }: ResolveProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25, once: false })
  const delay = Math.min(index, STAGGER_CAP) * STAGGER_MS

  return (
    <Tag
      ref={ref}
      className={cn('resolve', className)}
      data-visible={inView}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms' }}
    >
      {children}
    </Tag>
  )
}
