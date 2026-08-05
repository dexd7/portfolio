'use client'

import { Canvas } from '@react-three/fiber'
import { useState, type MutableRefObject, type RefObject } from 'react'
import { ResolveFieldPoints } from './ResolveFieldPoints'

interface ResolveFieldCanvasProps {
  dpr: number
  colorStatic: string
  colorSignal: string
  pointerEnabled: boolean
  /** Ref, not a value prop — scroll updates it directly so this never re-renders on scroll. */
  resolveTargetRef: MutableRefObject<number>
  /** Pauses the render loop entirely when scrolled out of view. */
  active: boolean
  /** The scoped wrapper's own DOM node — pointer NDC is computed against ITS bounding rect, not the window, now that this canvas doesn't cover the full viewport. */
  containerRef: RefObject<HTMLDivElement | null>
}

/**
 * The actual GL scene — a separate module from ResolveField.tsx so that
 * `three` and `@react-three/fiber` only enter the bundle once this is
 * dynamically imported (next/dynamic, ssr:false) from the capability-gated
 * wrapper, well after first paint.
 *
 * Bloom post-processing was tried here and removed: it's a genuinely
 * expensive multi-pass effect, and against this palette it wasn't producing
 * a visible payoff worth that cost — pure overhead. `powerPreference` was
 * also 'low-power' (a deliberate battery-saving request that explicitly
 * asks the browser for the integrated GPU over a discrete one, if present)
 * — reasonable as a default, wrong once smoothness is the priority.
 */
export default function ResolveFieldCanvas({
  dpr,
  colorStatic,
  colorSignal,
  pointerEnabled,
  resolveTargetRef,
  active,
  containerRef,
}: ResolveFieldCanvasProps) {
  // Bumping this remounts <Canvas> from scratch — the reliable way to
  // recover from a lost WebGL context, since all GPU-side buffers need
  // re-uploading anyway. Real browsers do lose contexts outside of dev-mode
  // hot-reload too: backgrounding a tab on mobile, GPU driver resets, too
  // many live contexts across other tabs.
  const [mountKey, setMountKey] = useState(0)

  return (
    <Canvas
      key={mountKey}
      dpr={dpr}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
      onCreated={({ gl }) => {
        // Transparent — this now sits as a foreground layer over the whole
        // page, not an opaque hero backdrop, so whatever's behind it must
        // show through.
        gl.setClearColor(0x000000, 0)

        const canvas = gl.domElement
        const onLost = (event: Event) => {
          // Without preventDefault() the browser treats the context as
          // permanently dead and never fires 'webglcontextrestored'.
          event.preventDefault()
          setMountKey((k) => k + 1)
        }
        canvas.addEventListener('webglcontextlost', onLost)
      }}
    >
      <ResolveFieldPoints
        colorStatic={colorStatic}
        colorSignal={colorSignal}
        targetResolveRef={resolveTargetRef}
        pointerEnabled={pointerEnabled}
        containerRef={containerRef}
      />
    </Canvas>
  )
}
