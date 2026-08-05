'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Portrait } from './Portrait'
import { ResolveField } from '@/components/visual/ResolveField'

interface PortraitStageProps {
  src: string
  alt: string
}

/**
 * The About page portrait, staged: a gentle float while it's in view, and an
 * intensified, accelerating "fly up and out" exit (rising, fading, shrinking)
 * as it scrolls past the top of the viewport. All written directly to the
 * image wrapper's style in a scroll listener — no React state, so scrolling
 * never re-renders this tree. ResolveField (the node field) is mounted INSIDE
 * imgWrapRef, not as a sibling — it needs to inherit the exact same
 * transform as the photo so they move as one glued unit during the float
 * and the fly-up-and-out exit, rather than drifting independently.
 */
export function PortraitStage({ src, alt }: PortraitStageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgWrapRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return
    const onScroll = () => {
      const node = containerRef.current
      const imgWrap = imgWrapRef.current
      if (!node || !imgWrap) return
      const rect = node.getBoundingClientRect()

      if (rect.top < 0) {
        // Exiting through the top of the viewport: accelerate up and out.
        const exit = Math.min(1.4, -rect.top / rect.height)
        const translateY = -exit * 320
        const scale = 1 - Math.min(exit, 1) * 0.26
        const opacity = Math.max(0, 1 - exit * 1.6)
        imgWrap.style.transform = `translateY(${translateY.toFixed(1)}px) scale(${scale.toFixed(3)})`
        imgWrap.style.opacity = opacity.toFixed(3)
      } else {
        // Still below the viewport top: a gentle float, centered on zero.
        const viewportCenter = window.innerHeight / 2
        const elementCenter = rect.top + rect.height / 2
        const offset = (elementCenter - viewportCenter) * 0.09
        imgWrap.style.transform = `translateY(${offset.toFixed(1)}px) scale(1)`
        imgWrap.style.opacity = '1'
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div ref={imgWrapRef} className="relative will-change-transform">
        <Portrait src={src} alt={alt} />
        <ResolveField />
      </div>
    </div>
  )
}
