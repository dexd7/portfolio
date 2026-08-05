'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useThemeColors } from '@/hooks/useThemeColors'
import { HeroMotif } from './HeroMotif'

const ResolveFieldCanvas = dynamic(() => import('./ResolveFieldCanvas'), { ssr: false })

interface NetworkInformationLike {
  saveData?: boolean
}

/**
 * The field of nodes, scoped to the portrait — NOT a full-page layer.
 * `position: absolute` inside the portrait's own `relative` wrapper
 * (mounted from within PortraitStage.tsx, inside its transformed imgWrap),
 * so it scrolls naturally with the page and flies up/out together with the
 * photo instead of staying pinned across unrelated sections. Sits IN FRONT
 * of the portrait image (z-10), `pointer-events-none` throughout so it
 * never blocks clicks on real content. Renders the static HeroMotif poster
 * immediately and always; swaps in the real GL scene once idle time is
 * available, unless reduced-motion or Save-Data is on.
 */
export function ResolveField() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const { colorStatic, colorSignal } = useThemeColors()

  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(true)
  const [skip, setSkip] = useState(false)
  const [dpr, setDpr] = useState(1)
  const [pointerEnabled, setPointerEnabled] = useState(false)
  // NOT React state — the R3F render loop reads this once per frame.
  const scrollTargetRef = useRef(0)

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

  // Pause the render loop when scrolled out of view — meaningful again now
  // that this is `absolute`, not `fixed`: it actually moves in and out of
  // the viewport as the page scrolls.
  useEffect(() => {
    if (skip) return
    const node = containerRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? true), { threshold: 0 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [skip])

  // Resolve from noise into the field's real shape as the portrait scrolls
  // into view, dissolve back as it leaves — ref only, no setState, so
  // scrolling never re-renders this tree.
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
      scrollTargetRef.current = Math.max(0, Math.min(1, visibleHeight / Math.min(rect.height, vh)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [skip])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute z-10"
      // -26%, up from -20% — a bigger bleed around the portrait so the
      // field's own silhouette clearly extends past the photo's edges on
      // all sides (verified: same worst-case canvas-edge margin as before,
      // even with a simultaneous max kick + max repulsion on one node —
      // see ResolveFieldPoints.tsx's KICK_PUSH_FRACTION/REPEL_RADIUS_FRACTION).
      style={{ inset: '-26%' }}
      aria-hidden="true"
      role="presentation"
    >
      {(skip || !ready) && <HeroMotif />}
      {!skip && ready && (
        <ResolveFieldCanvas
          dpr={dpr}
          colorStatic={colorStatic}
          colorSignal={colorSignal}
          pointerEnabled={pointerEnabled}
          resolveTargetRef={scrollTargetRef}
          active={visible}
          containerRef={containerRef}
        />
      )}
    </div>
  )
}
