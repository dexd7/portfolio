'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState, type MutableRefObject } from 'react'
import * as THREE from 'three'

interface RingSceneProps {
  colorStatic: string
  colorSignal: string
  resolveTargetRef: MutableRefObject<number>
}

interface PortraitFieldCanvasProps {
  dpr: number
  colorStatic: string
  colorSignal: string
  resolveTargetRef: MutableRefObject<number>
}

const NODE_COUNT = 28
// The ring's size, as a fraction of the CANVAS's own half-width/half-height
// (computed live each frame, below) — NOT a fraction of the photo. This
// matters: a WebGL canvas clips at its own pixel edges (there's no
// "overflow" for a rendering surface), and this canvas is deliberately
// larger than the photo — see the -16% inset in PortraitField.tsx. At that
// inset, the photo occupies ~76% of the canvas's own half-extent, so an
// OVERSCAN of 0.87 here (comfortably inside the canvas, ~13% margin) works
// out to the ring sitting at ~1.15x the photo's own half-extent — verified
// numerically to clear the photo's corners with margin (see the
// superellipse note below). Deliberately tighter than an earlier version
// (which needed -22% padding) since that extra horizontal room was getting
// clipped by the page layout around the portrait. If you change the -16%
// inset, recompute this.
const OVERSCAN = 0.87
// A plain ellipse (exponent 2) can NOT cleanly frame a rectangle — it
// curves inward at the diagonals relative to where the rectangle's actual
// corner sits, so the ring cuts across the photo's corners no matter how
// large OVERSCAN is (verified numerically: even at 1.4x the photo's own
// half-extent a plain ellipse still clips). A "superellipse" with a high
// exponent gives a rounded-rectangle curve that actually clears every
// corner — exponent 8 at ~1.3x the photo's half-extent clears with margin
// at every angle.
const SUPERELLIPSE_N = 8
const ROTATION_SPEED = 0.05 // very slow drift, framing rather than centerpiece

function mulberry32(seed: number) {
  let state = seed
  return function next() {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A ring of nodes — noise → a rounded-rectangle curve framing the portrait, connected node-to-neighbor around the loop. */
function RingScene({ colorStatic, colorSignal, resolveTargetRef }: RingSceneProps) {
  const n = NODE_COUNT

  // `lattice` is a unit superellipse (rounded-rectangle curve, not a
  // circle) — deliberately NOT pre-scaled into an ellipse here. The actual
  // rx/ry come from the live canvas aspect ratio each frame, so the ring
  // always matches the real box shape.
  const nodes = useMemo(() => {
    const rand = mulberry32(11)
    return Array.from({ length: n }, (_, i) => {
      const angle = (i / n) * Math.PI * 2
      const c = Math.cos(angle)
      const s = Math.sin(angle)
      const ex = Math.sign(c) * Math.abs(c) ** (2 / SUPERELLIPSE_N)
      const ey = Math.sign(s) * Math.abs(s) ** (2 / SUPERELLIPSE_N)
      const lattice = new THREE.Vector3(ex, ey, 0)
      const noise = new THREE.Vector3((rand() * 2 - 1) * 1.7, (rand() * 2 - 1) * 1.7, (rand() - 0.5) * 0.4)
      return { lattice, noise, delay: rand() }
    })
  }, [n])

  const colorStaticVec = useMemo(() => new THREE.Color(colorStatic), [colorStatic])
  const colorSignalVec = useMemo(() => new THREE.Color(colorSignal), [colorSignal])

  const currentPos = useMemo(() => new Float32Array(n * 3), [n])
  const nodeEased = useMemo(() => new Float32Array(n), [n])
  const pointColors = useMemo(() => new Float32Array(n * 3), [n])
  const linePositions = useMemo(() => new Float32Array(n * 2 * 3), [n])
  const lineColors = useMemo(() => new Float32Array(n * 2 * 3), [n])

  const pointsGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const posAttr = new THREE.BufferAttribute(currentPos, 3)
    posAttr.setUsage(THREE.DynamicDrawUsage)
    geo.setAttribute('position', posAttr)
    const colorAttr = new THREE.BufferAttribute(pointColors, 3)
    colorAttr.setUsage(THREE.DynamicDrawUsage)
    geo.setAttribute('color', colorAttr)
    return geo
  }, [currentPos, pointColors])

  const linesGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const posAttr = new THREE.BufferAttribute(linePositions, 3)
    posAttr.setUsage(THREE.DynamicDrawUsage)
    geo.setAttribute('position', posAttr)
    const colorAttr = new THREE.BufferAttribute(lineColors, 3)
    colorAttr.setUsage(THREE.DynamicDrawUsage)
    geo.setAttribute('color', colorAttr)
    return geo
  }, [linePositions, lineColors])

  const pointsMaterial = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 5,
        sizeAttenuation: false,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  )

  const linesMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  )

  const globalResolveRef = useRef(0)
  const rotation = useRef(0)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    globalResolveRef.current = THREE.MathUtils.lerp(globalResolveRef.current, resolveTargetRef.current, Math.min(dt * 2.2, 1))
    const resolve = globalResolveRef.current
    rotation.current += dt * ROTATION_SPEED

    const vw = state.viewport.width / 2
    const vh = state.viewport.height / 2
    // The ellipse's own rx/ry, derived from the LIVE canvas shape every
    // frame — this is what makes it self-correcting to the real portrait
    // aspect ratio instead of a hardcoded guess.
    const ringRx = vw * OVERSCAN
    const ringRy = vh * OVERSCAN
    const noiseScale = Math.min(vw, vh) * 1.3

    const cos = Math.cos(rotation.current)
    const sin = Math.sin(rotation.current)

    for (let i = 0; i < n; i++) {
      const node = nodes[i]!
      const d = node.delay * 0.6
      const local = THREE.MathUtils.clamp((resolve - d) / Math.max(1 - d, 0.0001), 0, 1)
      const eased = local * local * (3 - 2 * local)
      nodeEased[i] = eased

      const bx = THREE.MathUtils.lerp(node.noise.x * noiseScale, node.lattice.x * ringRx, eased)
      const by = THREE.MathUtils.lerp(node.noise.y * noiseScale, node.lattice.y * ringRy, eased)
      const bz = THREE.MathUtils.lerp(node.noise.z * noiseScale, node.lattice.z, eased)

      currentPos[i * 3 + 0] = bx * cos - by * sin
      currentPos[i * 3 + 1] = bx * sin + by * cos
      currentPos[i * 3 + 2] = bz

      pointColors[i * 3 + 0] = THREE.MathUtils.lerp(colorStaticVec.r, colorSignalVec.r, eased)
      pointColors[i * 3 + 1] = THREE.MathUtils.lerp(colorStaticVec.g, colorSignalVec.g, eased)
      pointColors[i * 3 + 2] = THREE.MathUtils.lerp(colorStaticVec.b, colorSignalVec.b, eased)
    }

    let vertexCount = 0
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      const mixAmount = (nodeEased[i]! + nodeEased[j]!) / 2
      const r = THREE.MathUtils.lerp(colorStaticVec.r, colorSignalVec.r, mixAmount)
      const g = THREE.MathUtils.lerp(colorStaticVec.g, colorSignalVec.g, mixAmount)
      const b = THREE.MathUtils.lerp(colorStaticVec.b, colorSignalVec.b, mixAmount)

      const base = vertexCount * 3
      linePositions[base + 0] = currentPos[i * 3 + 0]!
      linePositions[base + 1] = currentPos[i * 3 + 1]!
      linePositions[base + 2] = currentPos[i * 3 + 2]!
      lineColors[base + 0] = r
      lineColors[base + 1] = g
      lineColors[base + 2] = b

      linePositions[base + 3] = currentPos[j * 3 + 0]!
      linePositions[base + 4] = currentPos[j * 3 + 1]!
      linePositions[base + 5] = currentPos[j * 3 + 2]!
      lineColors[base + 3] = r
      lineColors[base + 4] = g
      lineColors[base + 5] = b

      vertexCount += 2
    }

    ;(pointsGeometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true
    ;(pointsGeometry.getAttribute('color') as THREE.BufferAttribute).needsUpdate = true
    ;(linesGeometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true
    ;(linesGeometry.getAttribute('color') as THREE.BufferAttribute).needsUpdate = true
  })

  return (
    <>
      <points geometry={pointsGeometry} material={pointsMaterial} frustumCulled={false} />
      <lineSegments geometry={linesGeometry} material={linesMaterial} frustumCulled={false} />
    </>
  )
}

/**
 * A separate module from PortraitField.tsx so `three`/`@react-three/fiber`
 * only load once dynamically imported. Deliberately always frameloop
 * 'always' once mounted (no offscreen-pause machinery like the hero's) —
 * at 28 nodes with no post-processing this is cheap enough that the extra
 * state-driven complexity isn't worth it.
 */
export default function PortraitFieldCanvas({ dpr, colorStatic, colorSignal, resolveTargetRef }: PortraitFieldCanvasProps) {
  const [mountKey, setMountKey] = useState(0)

  return (
    <Canvas
      key={mountKey}
      dpr={dpr}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
      onCreated={({ gl }) => {
        // Transparent, unlike the hero — this sits over the photo, not a
        // full-bleed section, so the image must show through around it.
        gl.setClearColor(0x000000, 0)
        const canvas = gl.domElement
        const onLost = (event: Event) => {
          event.preventDefault()
          setMountKey((k) => k + 1)
        }
        canvas.addEventListener('webglcontextlost', onLost)
      }}
    >
      <RingScene colorStatic={colorStatic} colorSignal={colorSignal} resolveTargetRef={resolveTargetRef} />
    </Canvas>
  )
}
