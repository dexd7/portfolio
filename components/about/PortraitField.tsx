'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import dynamic from 'next/dynamic'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { colors } from '@/data/theme.config'

const PortraitFieldCanvas = dynamic(() => import('./PortraitFieldCanvas'), { ssr: false })

interface PortraitFieldProps {
  containerRef: RefObject<HTMLDivElement | null>
}

interface NetworkInformationLike {
  saveData?: boolean
}

/**
 * A small ring of nodes framing the About page portrait — resolves from
 * scattered noise into a clean ellipse as the photo scrolls into view, and
 * dissolves back as it leaves. Same noise→signal language as the hero, at a
 * framing rather than centerpiece scale. Under reduced-motion/Save-Data
 * this simply doesn't render — there's no CSS poster fallback here, since
 * the photo itself is the real content, not a placeholder for this.
 */
export function PortraitField({ containerRef }: PortraitFieldProps) {
  const reducedMotion = useReducedMotion()
  const [ready, setReady] = useState(false)
  const [skip, setSkip] = useState(false)
  const [dpr, setDpr] = useState(1)
  // How much of the portrait is in view, 0..1 — written directly from a
  // scroll listener, read once per frame by the R3F loop. No setState here:
  // that re-render-storm mistake already cost real debugging time once on
  // the hero (see ResolveField.tsx history) — not repeating it.
  const resolveTargetRef = useRef(0)

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection
    if (reducedMotion || connection?.saveData) {
      setSkip(true)
      return
    }
    setDpr(Math.min(window.devicePixelRatio || 1, 1.5))
    const idle = window.requestIdleCallback ?? ((cb: IdleRequestCallback) => window.setTimeout(cb, 200))
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout
    const id = idle(() => setReady(true))
    return () => cancelIdle(id as never)
  }, [reducedMotion])

  useEffect(() => {
    if (skip) return
    const onScroll = () => {
      const node = containerRef.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const vh = window.innerHeight
      const visibleTop = Math.min(rect.bottom, vh)
      const visibleBottom = Math.max(rect.top, 0)
      const visibleHeight = Math.max(0, visibleTop - visibleBottom)
      resolveTargetRef.current = Math.max(0, Math.min(1, visibleHeight / Math.min(rect.height, vh)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [skip, containerRef])

  if (skip || !ready) return null

  return (
    // -16% is load-bearing, not decorative: PortraitFieldCanvas's OVERSCAN
    // constant is computed against THIS padding (see its comment) — WebGL
    // canvases clip at their own pixel edges, so the ring's visible size vs
    // the photo depends on how much bigger this box is than the photo.
    // Changing this number without adjusting OVERSCAN there un-syncs them.
    <div className="pointer-events-none absolute" style={{ inset: '-16%' }} aria-hidden="true" role="presentation">
      <PortraitFieldCanvas
        dpr={dpr}
        colorStatic={colors.dark.static}
        colorSignal={colors.dark.signal}
        resolveTargetRef={resolveTargetRef}
      />
    </div>
  )
}
