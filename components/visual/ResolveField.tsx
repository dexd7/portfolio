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
 * The full-page background field — `position: fixed`, a direct child of
 * `<main>` in app/page.tsx (the homepage only). `pointer-events-none`
 * throughout so it never blocks clicks on real content, and a NEGATIVE
 * z-index (-z-10) so it paints below in-flow page content but above the
 * root canvas background — see the load-bearing comment on the wrapper div
 * below before changing either of those.
 *
 * MUST NOT be nested inside anything with `transform`/`will-change`
 * (a <Resolve>, a <Section>, the portrait's transformed wrapper) — per CSS,
 * such an ancestor becomes the containing block for a `fixed` descendant,
 * silently breaking full-viewport positioning. This component used to live
 * inside PortraitStage.tsx for exactly this reason it no longer can.
 *
 * Renders the static HeroMotif poster immediately and always; swaps in the
 * real GL scene once idle time is available, unless reduced-motion or
 * Save-Data is on, in which case it stays on the poster permanently.
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

  // Pause the render loop when the tab is backgrounded. An IntersectionObserver
  // would be meaningless here — a `fixed inset-0` element always intersects
  // the viewport by definition, so tab-hidden is the real signal now.
  useEffect(() => {
    if (skip) return
    const onVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    onVisibility()
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [skip])

  return (
    <div
      ref={containerRef}
      // fixed + -z-10: paints below in-flow content but above the root
      // canvas background (negative z-index positioned elements sit in a
      // separate, earlier CSS painting-order step than normal-flow block
      // content). Section/Footer paint no background of their own, so
      // nothing needs a z-index bump to sit above this. Do not wrap this
      // component in anything with transform/will-change — see the file
      // doc comment.
      className="pointer-events-none fixed inset-0 -z-10"
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
          active={visible}
          containerRef={containerRef}
        />
      )}
    </div>
  )
}
