'use client'

import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import { useRef, type ReactNode, type MouseEvent } from 'react'

interface CursorFieldProps {
  children: ReactNode
  className?: string
  /** Radius, in px, over which a dot ramps from dim to fully bright. */
  radius?: number
}

/**
 * Container that brightens `.cursor-dot` children near the pointer. Distance
 * is computed per-dot on mousemove (rAF-throttled) and written as the
 * `--dot-proximity` custom property each dot's own CSS reads — cheap because
 * it only touches `opacity`, no layout. `pointer: fine` only; no-op
 * elsewhere and under reduced motion.
 */
export function CursorField({ children, className, radius = 120 }: CursorFieldProps) {
  const ref = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const reducedMotion = useReducedMotion()

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !window.matchMedia('(pointer: fine)').matches) return
    const node = ref.current
    if (!node) return

    const { clientX, clientY } = e
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)

    rafRef.current = requestAnimationFrame(() => {
      const dots = node.querySelectorAll<HTMLElement>('.cursor-dot')
      dots.forEach((dot) => {
        const rect = dot.getBoundingClientRect()
        const dx = clientX - (rect.left + rect.width / 2)
        const dy = clientY - (rect.top + rect.height / 2)
        const distance = Math.sqrt(dx * dx + dy * dy)
        const proximity = Math.max(0, 1 - distance / radius)
        dot.style.setProperty('--dot-proximity', proximity.toFixed(3))
      })
    })
  }

  const handleMouseLeave = () => {
    const node = ref.current
    if (!node) return
    node.querySelectorAll<HTMLElement>('.cursor-dot').forEach((dot) => {
      dot.style.setProperty('--dot-proximity', '0')
    })
  }

  return (
    <div
      ref={ref}
      data-active={!reducedMotion}
      className={cn('cursor-field', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}
