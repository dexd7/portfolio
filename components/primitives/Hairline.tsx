'use client'

import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils'

interface HairlineProps {
  className?: string
}

/** A rule that draws left → right on scroll into view. */
export function Hairline({ className }: HairlineProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.5, once: true })

  return (
    <div
      ref={ref}
      data-visible={inView}
      className={cn('hairline h-px w-full bg-[var(--color-border)]', className)}
      aria-hidden="true"
    />
  )
}
