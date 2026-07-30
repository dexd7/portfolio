'use client'

import { useEffect, useState } from 'react'
import { useInView } from '@/hooks/useInView'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

interface CounterProps {
  to: number
  from?: number
  prefix?: string
  suffix?: string
  decimals?: number
  durationMs?: number
  className?: string
}

/** cubic ease-out — quick start, gentle settle. */
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Eased count-up for metrics. Always renders the exact final value — this is
 * decoration on top of a number that must already be correct in the DOM, not
 * a substitute for it. Reduced-motion and non-JS renders jump straight to
 * the end value.
 */
export function Counter({
  to,
  from = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  durationMs = 900,
  className,
}: CounterProps) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.5, once: true })
  const reducedMotion = useReducedMotion()
  const [value, setValue] = useState(reducedMotion ? to : from)

  useEffect(() => {
    if (!inView) return
    if (reducedMotion) {
      setValue(to)
      return
    }

    let raf: number
    const start = performance.now()

    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1)
      setValue(from + (to - from) * easeOutCubic(t))
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reducedMotion, to, from, durationMs])

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  )
}
