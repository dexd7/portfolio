'use client'

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { buildFootballNodes } from './resolveFieldGeometry'

interface ResolveFieldPointsProps {
  colorStatic: string
  colorSignal: string
  targetResolveRef: MutableRefObject<number>
  pointerEnabled: boolean
  labelElRef: MutableRefObject<HTMLDivElement | null>
}

const POINTER_RADIUS_FRACTION = 0.28
const POINTER_PUSH_FRACTION = 0.025
const ROTATION_SPEED = 0.16 // rad/s — a full turn roughly every ~39s
const TILT = 0.38 // fixed X-axis tilt, radians — a 3/4 view rather than flat-on

// Click "kick": a brief rotation boost + outward impulse that decays back.
const KICK_DECAY = 2.2
const KICK_ROTATION_BOOST = 1.8
const KICK_PUSH_FRACTION = 0.14

// Arrival flash: a brief spark toward white when a node crosses halfway
// from noise to resolved, so the assembly looks like it's clicking together.
const FLASH_DECAY = 3.5

// Idle breathing — a slight scale pulse so the ball is never fully static.
const BREATH_SPEED = 0.5
const BREATH_AMOUNT = 0.02

// One fixed node doubles as a signature detail: hover directly over it and
// a small "2026" label appears — the World Cup and graduation sharing a
// year. Deliberately not a reproduction of any official ball's branding.
const SIGNATURE_INDEX = 0
const SIGNATURE_REVEAL_FRACTION = 0.09

/**
 * The "Resolve Field" as a soccer ball: 60 nodes — the true vertices of a
 * truncated icosahedron — condense from a scattered noise cloud into the
 * ball's actual panel-edge structure (gray → amber, same progression as
 * everywhere else on the site), slowly rotating so the 3D shape reads
 * clearly, with the cursor pushing nearby nodes and brightening their
 * connections, a click giving it a satisfying kick, and one signature node
 * revealing a small personal detail on close hover. Built on three.js's
 * standard PointsMaterial/LineBasicMaterial rather than a custom shader —
 * with only 60 nodes, the CPU cost of an all-pairs distance check per frame
 * is trivial, and standard materials are far easier to reason about
 * precisely than hand-written GLSL.
 */
export function ResolveFieldPoints({
  colorStatic,
  colorSignal,
  targetResolveRef,
  pointerEnabled,
  labelElRef,
}: ResolveFieldPointsProps) {
  const { nodes, edgeLength } = useMemo(() => buildFootballNodes(), [])
  const n = nodes.length

  const colorStaticVec = useMemo(() => new THREE.Color(colorStatic), [colorStatic])
  const colorSignalVec = useMemo(() => new THREE.Color(colorSignal), [colorSignal])
  const colorSparkVec = useMemo(() => new THREE.Color('#ffffff'), [])

  // Scratch buffers, reused every frame — no per-frame allocation.
  const currentPos = useMemo(() => new Float32Array(n * 3), [n])
  const nodeResolve = useMemo(() => new Float32Array(n), [n])
  const nodeResolvePrev = useMemo(() => new Float32Array(n), [n])
  const nodeGlow = useMemo(() => new Float32Array(n), [n])
  const nodeFlash = useMemo(() => new Float32Array(n), [n])
  const maxPairs = (n * (n - 1)) / 2
  const linePositions = useMemo(() => new Float32Array(maxPairs * 2 * 3), [maxPairs])
  const lineColors = useMemo(() => new Float32Array(maxPairs * 2 * 3), [maxPairs])
  const signatureWorldPos = useMemo(() => new THREE.Vector3(), [])

  const pointsGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const posAttr = new THREE.BufferAttribute(currentPos, 3)
    posAttr.setUsage(THREE.DynamicDrawUsage)
    geo.setAttribute('position', posAttr)
    const colorAttr = new THREE.BufferAttribute(new Float32Array(n * 3), 3)
    colorAttr.setUsage(THREE.DynamicDrawUsage)
    geo.setAttribute('color', colorAttr)
    return geo
  }, [currentPos, n])

  const linesGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const posAttr = new THREE.BufferAttribute(linePositions, 3)
    posAttr.setUsage(THREE.DynamicDrawUsage)
    geo.setAttribute('position', posAttr)
    const colorAttr = new THREE.BufferAttribute(lineColors, 3)
    colorAttr.setUsage(THREE.DynamicDrawUsage)
    geo.setAttribute('color', colorAttr)
    geo.setDrawRange(0, 0)
    return geo
  }, [linePositions, lineColors])

  const pointsMaterial = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 6,
        sizeAttenuation: false,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
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
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  )

  // Pointer tracked on `window`, not R3F's canvas-scoped pointer — the hero
  // copy sits above the canvas (z-10), so canvas-only events would stop
  // firing the moment the cursor crossed the text.
  const pointerNdc = useRef(new THREE.Vector2(0, 0))
  const pointerWorld = useRef(new THREE.Vector2(0, 0))
  const pointerActive = useRef(false)
  const kickStrength = useRef(0)

  useEffect(() => {
    if (!pointerEnabled) return
    const onMove = (event: PointerEvent) => {
      pointerNdc.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 - 1),
      )
      pointerActive.current = true
    }
    const onLeave = () => {
      pointerActive.current = false
    }
    const onClick = () => {
      kickStrength.current = 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave, { passive: true })
    window.addEventListener('click', onClick, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('click', onClick)
    }
  }, [pointerEnabled])

  const globalResolveRef = useRef(0)
  const rotationY = useRef(0)
  const elapsed = useRef(0)
  const cosTilt = Math.cos(TILT)
  const sinTilt = Math.sin(TILT)

  // [DEBUG] Temporary — real frame-time data instead of guessing again.
  // Logs average/worst frame time (ms) and effective FPS once per second.
  const fpsFrames = useRef(0)
  const fpsWorst = useRef(0)
  const fpsAccum = useRef(0)
  const fpsWindowStart = useRef(0)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    elapsed.current += dt

    const frameMs = delta * 1000
    fpsFrames.current += 1
    fpsAccum.current += frameMs
    fpsWorst.current = Math.max(fpsWorst.current, frameMs)
    if (elapsed.current - fpsWindowStart.current >= 1) {
      const avgMs = fpsAccum.current / fpsFrames.current
      console.log(
        `[ResolveFieldPoints] fps: ${(1000 / avgMs).toFixed(0)}  avg: ${avgMs.toFixed(2)}ms  worst: ${fpsWorst.current.toFixed(2)}ms  frames: ${fpsFrames.current}`,
      )
      fpsFrames.current = 0
      fpsAccum.current = 0
      fpsWorst.current = 0
      fpsWindowStart.current = elapsed.current
    }

    globalResolveRef.current = THREE.MathUtils.lerp(
      globalResolveRef.current,
      targetResolveRef.current,
      Math.min(dt * 2.4, 1),
    )
    const resolve = globalResolveRef.current

    kickStrength.current = Math.max(0, kickStrength.current - dt * KICK_DECAY)
    rotationY.current += dt * (ROTATION_SPEED + kickStrength.current * KICK_ROTATION_BOOST)

    const vw = state.viewport.width / 2
    const vh = state.viewport.height / 2
    const breath = 1 + Math.sin(elapsed.current * BREATH_SPEED) * BREATH_AMOUNT
    const scale = Math.min(vw, vh) * 0.82 * breath

    if (pointerEnabled && pointerActive.current) {
      const targetX = pointerNdc.current.x * vw
      const targetY = pointerNdc.current.y * vh
      const follow = Math.min(dt * 6, 1)
      pointerWorld.current.x = THREE.MathUtils.lerp(pointerWorld.current.x, targetX, follow)
      pointerWorld.current.y = THREE.MathUtils.lerp(pointerWorld.current.y, targetY, follow)
    }

    const pointerRadius = Math.min(vw, vh) * POINTER_RADIUS_FRACTION
    const signatureRadius = Math.min(vw, vh) * SIGNATURE_REVEAL_FRACTION
    const connectDist = edgeLength * scale * 1.25

    const cosY = Math.cos(rotationY.current)
    const sinY = Math.sin(rotationY.current)

    let signatureRevealed = false

    // 1) Resolve each node's position + how "signal" (vs "noise") it is.
    for (let i = 0; i < n; i++) {
      const node = nodes[i]!
      const d = node.delay * 0.5
      const local = THREE.MathUtils.clamp((resolve - d) / Math.max(1 - d, 0.0001), 0, 1)
      const eased = local * local * (3 - 2 * local)
      nodeResolve[i] = eased

      // Arrival flash fires once, the moment a node crosses the halfway mark.
      if (nodeResolvePrev[i]! < 0.5 && eased >= 0.5) {
        nodeFlash[i] = 1
      }
      nodeResolvePrev[i] = eased
      nodeFlash[i] = Math.max(0, nodeFlash[i]! - dt * FLASH_DECAY)

      const bx = THREE.MathUtils.lerp(node.noise.x, node.lattice.x, eased)
      const by = THREE.MathUtils.lerp(node.noise.y, node.lattice.y, eased)
      const bz = THREE.MathUtils.lerp(node.noise.z, node.lattice.z, eased)

      // Rotate around Y, then apply a fixed X tilt for a 3/4 view.
      const rx = bx * cosY + bz * sinY
      const rz = -bx * sinY + bz * cosY
      const ry = by * cosTilt - rz * sinTilt
      const rz2 = by * sinTilt + rz * cosTilt

      let x = rx * scale
      let y = ry * scale
      const z = rz2 * scale

      let glow = 0
      if (pointerEnabled && pointerActive.current) {
        const dx = x - pointerWorld.current.x
        const dy = y - pointerWorld.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < pointerRadius) {
          const influence = 1 - dist / pointerRadius
          glow = influence * eased
          const push = influence * POINTER_PUSH_FRACTION * scale
          const nx = dist > 0.0001 ? dx / dist : 0
          const ny = dist > 0.0001 ? dy / dist : 0
          x += nx * push
          y += ny * push
        }
        if (i === SIGNATURE_INDEX && dist < signatureRadius) signatureRevealed = true
      }

      // Kick impulse: radial outward push from center, decaying back.
      if (kickStrength.current > 0.001) {
        const distFromCenter = Math.sqrt(x * x + y * y) || 1
        const push = kickStrength.current * KICK_PUSH_FRACTION * scale
        x += (x / distFromCenter) * push
        y += (y / distFromCenter) * push
      }

      nodeGlow[i] = glow
      currentPos[i * 3 + 0] = x
      currentPos[i * 3 + 1] = y
      currentPos[i * 3 + 2] = z

      if (i === SIGNATURE_INDEX) signatureWorldPos.set(x, y, z)
    }

    // Project the signature node to screen space and move its label there —
    // direct DOM mutation, no React state, so this never re-renders.
    const labelEl = labelElRef.current
    if (labelEl) {
      if (signatureRevealed) {
        signatureWorldPos.project(state.camera)
        const screenX = (signatureWorldPos.x * 0.5 + 0.5) * state.size.width
        const screenY = (1 - (signatureWorldPos.y * 0.5 + 0.5)) * state.size.height
        labelEl.style.transform = `translate(${(screenX + 14).toFixed(1)}px, ${(screenY - 10).toFixed(1)}px)`
        labelEl.style.opacity = '1'
      } else {
        labelEl.style.opacity = '0'
      }
    }

    // 2) Node colors: gray → amber with resolve, boosted near the cursor,
    // spiked toward white on arrival flash.
    const pointColorAttr = pointsGeometry.getAttribute('color') as THREE.BufferAttribute
    const pointColorArr = pointColorAttr.array as Float32Array
    for (let i = 0; i < n; i++) {
      const mixAmount = THREE.MathUtils.clamp(nodeResolve[i]! + nodeGlow[i]! * 0.6, 0, 1)
      const flash = nodeFlash[i]!
      const r = THREE.MathUtils.lerp(THREE.MathUtils.lerp(colorStaticVec.r, colorSignalVec.r, mixAmount), colorSparkVec.r, flash)
      const g = THREE.MathUtils.lerp(THREE.MathUtils.lerp(colorStaticVec.g, colorSignalVec.g, mixAmount), colorSparkVec.g, flash)
      const b = THREE.MathUtils.lerp(THREE.MathUtils.lerp(colorStaticVec.b, colorSignalVec.b, mixAmount), colorSparkVec.b, flash)
      pointColorArr[i * 3 + 0] = r
      pointColorArr[i * 3 + 1] = g
      pointColorArr[i * 3 + 2] = b
    }
    pointColorAttr.needsUpdate = true
    ;(pointsGeometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true

    // 3) Connections: only true edges of the ball light up, via distance
    // against the shape's own known edge length — not a guessed threshold.
    let vertexCount = 0
    const connDist2 = connectDist * connectDist
    for (let i = 0; i < n && vertexCount < linePositions.length - 6; i++) {
      const xi = currentPos[i * 3 + 0]!
      const yi = currentPos[i * 3 + 1]!
      const zi = currentPos[i * 3 + 2]!
      for (let j = i + 1; j < n; j++) {
        const xj = currentPos[j * 3 + 0]!
        const yj = currentPos[j * 3 + 1]!
        const zj = currentPos[j * 3 + 2]!
        const dx = xi - xj
        const dy = yi - yj
        const dz = zi - zj
        const d2 = dx * dx + dy * dy + dz * dz
        if (d2 >= connDist2) continue

        const mixAmount = THREE.MathUtils.clamp(
          (nodeResolve[i]! + nodeResolve[j]!) / 2 + Math.max(nodeGlow[i]!, nodeGlow[j]!) * 0.6,
          0,
          1,
        )
        const flash = Math.max(nodeFlash[i]!, nodeFlash[j]!)
        const r = THREE.MathUtils.lerp(THREE.MathUtils.lerp(colorStaticVec.r, colorSignalVec.r, mixAmount), colorSparkVec.r, flash)
        const g = THREE.MathUtils.lerp(THREE.MathUtils.lerp(colorStaticVec.g, colorSignalVec.g, mixAmount), colorSparkVec.g, flash)
        const b = THREE.MathUtils.lerp(THREE.MathUtils.lerp(colorStaticVec.b, colorSignalVec.b, mixAmount), colorSparkVec.b, flash)

        const base = vertexCount * 3
        linePositions[base + 0] = xi
        linePositions[base + 1] = yi
        linePositions[base + 2] = zi
        lineColors[base + 0] = r
        lineColors[base + 1] = g
        lineColors[base + 2] = b

        linePositions[base + 3] = xj
        linePositions[base + 4] = yj
        linePositions[base + 5] = zj
        lineColors[base + 3] = r
        lineColors[base + 4] = g
        lineColors[base + 5] = b

        vertexCount += 2
      }
    }

    ;(linesGeometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true
    ;(linesGeometry.getAttribute('color') as THREE.BufferAttribute).needsUpdate = true
    linesGeometry.setDrawRange(0, vertexCount)
  })

  return (
    <>
      <points geometry={pointsGeometry} material={pointsMaterial} frustumCulled={false} />
      <lineSegments geometry={linesGeometry} material={linesMaterial} frustumCulled={false} />
    </>
  )
}
