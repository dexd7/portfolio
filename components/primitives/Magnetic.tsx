'use client'

import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import { useRef, type ReactNode, type MouseEvent } from 'react'

interface MagneticProps {
  children: ReactNode
  className?: string
  /** Max pull in px. Spec caps this at 6. */
  strength?: number
}

/**
 * Cursor-proximity pull, reserved for primary CTAs — max two per page per the
 * motion spec, so it stays a deliberate accent rather than a tic. No-op on
 * touch/coarse pointers and under reduced motion.
 */
export function Magnetic({ children, className, strength = 6 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !window.matchMedia('(pointer: fine)').matches) return
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    node.style.transform = `translate(${x * strength}px, ${y * strength}px)`
  }

  const handleMouseLeave = () => {
    const node = ref.current
    if (node) node.style.transform = 'translate(0, 0)'
  }

  return (
    <div
      ref={ref}
      className={cn('magnetic inline-block', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}
