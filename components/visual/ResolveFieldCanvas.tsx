'use client'

import { Canvas } from '@react-three/fiber'
import { useState, type RefObject } from 'react'
import { ResolveFieldPoints } from './ResolveFieldPoints'

interface ResolveFieldCanvasProps {
  dpr: number
  colorStatic: string
  colorSignal: string
  colorBackground: string
  pointerEnabled: boolean
  /** Pauses the render loop entirely when the tab is backgrounded. */
  active: boolean
  /** The full-viewport wrapper's own DOM node — pointer NDC is computed against ITS bounding rect. */
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
  colorBackground,
  pointerEnabled,
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
        // Transparent — this is a full-page background layer behind real
        // content, not an opaque backdrop, so the page's own canvas color
        // (painted by <body>) must show through everywhere nothing is drawn.
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
        colorBackground={colorBackground}
        pointerEnabled={pointerEnabled}
        containerRef={containerRef}
      />
    </Canvas>
  )
}
