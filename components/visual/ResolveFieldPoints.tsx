'use client'

import { useEffect, useMemo, useRef, type MutableRefObject, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { buildFieldNodes } from './resolveFieldGeometry'

interface ResolveFieldPointsProps {
  colorStatic: string
  colorSignal: string
  targetResolveRef: MutableRefObject<number>
  pointerEnabled: boolean
  containerRef: RefObject<HTMLDivElement | null>
}

// The minimum distance a node maintains from the cursor — not a bounded
// nudge, a maintained gap: each frame the target displacement is whatever's
// needed to hold the node exactly this far from the cursor's CURRENT
// position, so the cursor can never "catch up" to a node regardless of how
// fast it moves. The spring below only smooths how quickly the displayed
// position converges to that target, not whether it's reached.
const REPEL_RADIUS_FRACTION = 0.32
const REPULSION_SPRING_RATE = 4.5
// Connections are a live proximity graph, not a fixed topology — but
// connecting every pair within range produces a dense, cluttered tangle
// once several nodes drift close together (a busy area can have a dozen
// nodes all mutually in range). Capping each node to its MAX_NEIGHBORS
// nearest within CONNECT_RADIUS_FRACTION keeps the graph sparse and legible
// regardless of local density — a node with five neighbors nearby still
// only draws its closest couple, not all five.
const CONNECT_RADIUS_FRACTION = 0.32
const MAX_NEIGHBORS = 2

// Click "kick": an outward impulse that decays back. No rotation boost —
// there's no rigid body to spin, see the wander note below.
const KICK_DECAY = 2.2
const KICK_PUSH_FRACTION = 0.14

// Arrival flash: a brief spark toward white when a node crosses halfway
// from noise to resolved, so the assembly looks like it's clicking together.
const FLASH_DECAY = 3.5

// Idle breathing — a slight scale pulse so the field is never fully static.
const BREATH_SPEED = 0.5
const BREATH_AMOUNT = 0.02

/**
 * A field of 60 nodes condensing from a scattered noise cloud toward random
 * anchors (static → signal, same progression as everywhere else on the
 * site) — no rigid rotation; each node wanders continuously around its own
 * anchor at its own frequency/phase, so the motion is per-node and
 * asynchronous rather than one shape spinning as a whole. The cursor
 * chases nearby nodes away (never letting it actually reach one — see
 * REPEL_RADIUS_FRACTION), a live proximity graph connects whichever nodes
 * happen to be close together, drawn in one consistent color, and a click
 * gives it a satisfying kick. Built on three.js's standard
 * PointsMaterial/LineBasicMaterial rather than a custom shader — with only
 * 60 nodes, the CPU cost of an all-pairs distance check per frame is
 * trivial, and standard materials are far easier to reason about precisely
 * than hand-written GLSL.
 */
export function ResolveFieldPoints({
  colorStatic,
  colorSignal,
  targetResolveRef,
  pointerEnabled,
  containerRef,
}: ResolveFieldPointsProps) {
  const { nodes } = useMemo(() => buildFieldNodes(), [])
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
  const nodeDisplaceX = useMemo(() => new Float32Array(n), [n])
  const nodeDisplaceY = useMemo(() => new Float32Array(n), [n])
  // Each node keeps at most its MAX_NEIGHBORS nearest, so there are at most
  // n*MAX_NEIGHBORS edges — far fewer than the all-pairs worst case, and the
  // real bound this buffer needs to be sized for.
  const maxEdges = n * MAX_NEIGHBORS
  const linePositions = useMemo(() => new Float32Array(maxEdges * 2 * 3), [maxEdges])
  const lineColors = useMemo(() => new Float32Array(maxEdges * 2 * 3), [maxEdges])
  // Scratch for the nearest-neighbor search — reset and rebuilt each frame,
  // reused across frames (no per-frame array allocation).
  const nearestIdx = useMemo(() => new Int32Array(n * MAX_NEIGHBORS), [n])
  const nearestDist2 = useMemo(() => new Float32Array(n * MAX_NEIGHBORS), [n])

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
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  )

  // Pointer tracked on `window`, not R3F's canvas-scoped pointer — the
  // canvas has pointer-events-none (so it never blocks clicks on real
  // content), and an element with pointer-events-none never receives its
  // own pointer events. NDC is computed against the scoped container's own
  // bounding rect, NOT window dimensions — this canvas covers a small box
  // around the portrait, not the full viewport, so window-relative NDC
  // would put the ±1 range far outside where the cursor actually needs to
  // be for the field to react.
  const pointerNdc = useRef(new THREE.Vector2(0, 0))
  const pointerWorld = useRef(new THREE.Vector2(0, 0))
  const pointerActive = useRef(false)
  const kickStrength = useRef(0)

  useEffect(() => {
    if (!pointerEnabled) return
    const onMove = (event: PointerEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect || rect.width === 0 || rect.height === 0) return
      pointerNdc.current.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1),
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
  const elapsed = useRef(0)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    elapsed.current += dt

    globalResolveRef.current = THREE.MathUtils.lerp(
      globalResolveRef.current,
      targetResolveRef.current,
      Math.min(dt * 2.4, 1),
    )
    const resolve = globalResolveRef.current

    kickStrength.current = Math.max(0, kickStrength.current - dt * KICK_DECAY)

    const vw = state.viewport.width / 2
    const vh = state.viewport.height / 2
    const breath = 1 + Math.sin(elapsed.current * BREATH_SPEED) * BREATH_AMOUNT
    // vw/vh are now derived from the SCOPED canvas's own small size (the
    // container wraps the portrait with -20% inset, not the full viewport),
    // so a hero-like fraction of that box is correct again — it's sized
    // relative to its own (portrait-scale) container, not the whole screen.
    const scale = Math.min(vw, vh) * 0.8 * breath

    if (pointerEnabled && pointerActive.current) {
      const targetX = pointerNdc.current.x * vw
      const targetY = pointerNdc.current.y * vh
      const follow = Math.min(dt * 6, 1)
      pointerWorld.current.x = THREE.MathUtils.lerp(pointerWorld.current.x, targetX, follow)
      pointerWorld.current.y = THREE.MathUtils.lerp(pointerWorld.current.y, targetY, follow)
    }

    const repelRadius = Math.min(vw, vh) * REPEL_RADIUS_FRACTION
    const connectRadius = scale * CONNECT_RADIUS_FRACTION

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

      // Independent wander: each node drifts around its own position at its
      // own frequency and phase (both randomized per node at construction) —
      // asynchronous per-node motion, never a rigid body moving as one.
      const wx = bx + Math.sin(elapsed.current * node.wanderFreq.x + node.wanderPhase.x) * node.wanderAmplitude
      const wy = by + Math.sin(elapsed.current * node.wanderFreq.y + node.wanderPhase.y) * node.wanderAmplitude
      const wz = bz + Math.sin(elapsed.current * node.wanderFreq.z + node.wanderPhase.z) * node.wanderAmplitude

      let x = wx * scale
      let y = wy * scale
      const z = wz * scale

      // Chase-away repulsion: the TARGET displacement is whatever's needed
      // to hold this node exactly repelRadius from the cursor's CURRENT
      // position — not a bounded nudge, so the cursor can never close the
      // gap no matter how it moves. The spring below only smooths how fast
      // the DISPLAYED position converges to that target, never the target
      // itself, which is why this reads as smooth rather than snappy.
      let glow = 0
      let targetDx = 0
      let targetDy = 0
      if (pointerEnabled && pointerActive.current) {
        const dx = x - pointerWorld.current.x
        const dy = y - pointerWorld.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < repelRadius) {
          const nx = dist > 0.0001 ? dx / dist : 1
          const ny = dist > 0.0001 ? dy / dist : 0
          const targetX = pointerWorld.current.x + nx * repelRadius
          const targetY = pointerWorld.current.y + ny * repelRadius
          targetDx = targetX - x
          targetDy = targetY - y
          glow = (1 - dist / repelRadius) * eased
        }
      }
      const springT = Math.min(dt * REPULSION_SPRING_RATE, 1)
      nodeDisplaceX[i] = THREE.MathUtils.lerp(nodeDisplaceX[i]!, targetDx, springT)
      nodeDisplaceY[i] = THREE.MathUtils.lerp(nodeDisplaceY[i]!, targetDy, springT)
      x += nodeDisplaceX[i]!
      y += nodeDisplaceY[i]!

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

    // 3) Connections: each node's MAX_NEIGHBORS nearest within connectRadius
    // — not every pair in range, which is what produced a dense tangle once
    // several nodes drifted close together. One consistent color, no
    // per-edge variation.
    const connRadius2 = connectRadius * connectRadius
    nearestIdx.fill(-1)
    nearestDist2.fill(Infinity)

    // Pass 1: for every node, keep only its closest MAX_NEIGHBORS candidates
    // (insertion-sort into a tiny fixed-size slot — cheap since MAX_NEIGHBORS
    // is small, and avoids allocating a sortable array per node).
    for (let i = 0; i < n; i++) {
      const xi = currentPos[i * 3 + 0]!
      const yi = currentPos[i * 3 + 1]!
      const zi = currentPos[i * 3 + 2]!
      for (let j = 0; j < n; j++) {
        if (j === i) continue
        const dx = xi - currentPos[j * 3 + 0]!
        const dy = yi - currentPos[j * 3 + 1]!
        const dz = zi - currentPos[j * 3 + 2]!
        const d2 = dx * dx + dy * dy + dz * dz
        if (d2 >= connRadius2) continue

        const rowBase = i * MAX_NEIGHBORS
        let insertAt = -1
        for (let k = 0; k < MAX_NEIGHBORS; k++) {
          if (d2 < nearestDist2[rowBase + k]!) {
            insertAt = k
            break
          }
        }
        if (insertAt === -1) continue
        for (let k = MAX_NEIGHBORS - 1; k > insertAt; k--) {
          nearestDist2[rowBase + k] = nearestDist2[rowBase + k - 1]!
          nearestIdx[rowBase + k] = nearestIdx[rowBase + k - 1]!
        }
        nearestDist2[rowBase + insertAt] = d2
        nearestIdx[rowBase + insertAt] = j
      }
    }

    // Pass 2: draw an edge for every pair where EITHER side kept the other
    // as one of its nearest — a mutual-AND requirement produces a much
    // sparser, often visually disconnected graph at this node count.
    let vertexCount = 0
    for (let i = 0; i < n && vertexCount < linePositions.length - 6; i++) {
      for (let j = i + 1; j < n; j++) {
        let isNeighbor = false
        for (let k = 0; k < MAX_NEIGHBORS; k++) {
          if (nearestIdx[i * MAX_NEIGHBORS + k] === j || nearestIdx[j * MAX_NEIGHBORS + k] === i) {
            isNeighbor = true
            break
          }
        }
        if (!isNeighbor) continue

        const base = vertexCount * 3
        linePositions[base + 0] = currentPos[i * 3 + 0]!
        linePositions[base + 1] = currentPos[i * 3 + 1]!
        linePositions[base + 2] = currentPos[i * 3 + 2]!
        lineColors[base + 0] = colorSignalVec.r
        lineColors[base + 1] = colorSignalVec.g
        lineColors[base + 2] = colorSignalVec.b

        linePositions[base + 3] = currentPos[j * 3 + 0]!
        linePositions[base + 4] = currentPos[j * 3 + 1]!
        linePositions[base + 5] = currentPos[j * 3 + 2]!
        lineColors[base + 3] = colorSignalVec.r
        lineColors[base + 4] = colorSignalVec.g
        lineColors[base + 5] = colorSignalVec.b

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
