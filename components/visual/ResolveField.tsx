'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { colors } from '@/data/theme.config'
import { HeroMotif } from './HeroMotif'

const ResolveFieldCanvas = dynamic(() => import('./ResolveFieldCanvas'), { ssr: false })

interface NetworkInformationLike {
  saveData?: boolean
}

/**
 * Public entry point for the hero's WebGL scene (a resolving soccer-ball
 * node network — see ResolveFieldPoints). Renders the static HeroMotif
 * poster immediately and always; swaps in the real GL scene once idle time
 * is available, unless reduced-motion or Save-Data is on, in which case it
 * stays on the poster permanently. The node count is fixed (a soccer ball
 * has exactly 60 vertices) so there's no device-tier particle-count
 * scaling to do — only DPR is capped for lower-end devices.
 */
export function ResolveField() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(true)
  const [skip, setSkip] = useState(false)
  const [dpr, setDpr] = useState(1)
  const [pointerEnabled, setPointerEnabled] = useState(false)
  // NOT React state — scroll fires far too often for setState. This ref is
  // handed straight down to the R3F render loop, which reads it once per
  // frame; writing to it never triggers a re-render of this component tree
  // (that re-render storm was the actual cause of the choppiness).
  const scrollTargetRef = useRef(1)
  // A signature node on the ball projects its screen position here each
  // frame (direct DOM mutation inside the R3F loop, not React state — same
  // reasoning as scrollTargetRef) to position the small hover-reveal label.
  const labelElRef = useRef<HTMLDivElement | null>(null)

  // Decide whether to load GL at all, once reduced-motion is known.
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection
    if (reducedMotion || connection?.saveData) {
      setSkip(true)
      return
    }

    setDpr(Math.min(window.devicePixelRatio || 1, 1.5))
    setPointerEnabled(window.matchMedia('(pointer: fine)').matches)

    const idle = window.requestIdleCallback ?? ((cb: IdleRequestCallback) => window.setTimeout(cb, 200))
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout
    const id = idle(() => setReady(true))
    return () => cancelIdle(id as never)
  }, [reducedMotion])

  // Pause the render loop entirely when the hero scrolls offscreen.
  useEffect(() => {
    if (skip) return
    const node = containerRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? true), { threshold: 0 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [skip])

  // Dissolve back toward noise as the hero scrolls out of view. Writes
  // straight to the ref — no setState, so scrolling never re-renders React.
  useEffect(() => {
    if (skip) return
    const onScroll = () => {
      const node = containerRef.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, rect.bottom / rect.height))
      scrollTargetRef.current = 0.15 + 0.85 * ratio
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [skip])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
      role="presentation"
    >
      {(skip || !ready) && <HeroMotif />}
      {!skip && ready && (
        <ResolveFieldCanvas
          dpr={dpr}
          colorStatic={colors.dark.static}
          colorSignal={colors.dark.signal}
          pointerEnabled={pointerEnabled}
          resolveTargetRef={scrollTargetRef}
          active={visible}
          labelElRef={labelElRef}
        />
      )}
      {!skip && ready && pointerEnabled && (
        <div
          ref={labelElRef}
          className="text-label absolute left-0 top-0 whitespace-nowrap text-[var(--color-signal)] opacity-0 transition-opacity duration-150"
          title="World Cup year. Also when I graduate."
        >
          2026
        </div>
      )}
    </div>
  )
}
