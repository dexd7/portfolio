'use client'

import { useEffect, useMemo, useRef, type MutableRefObject, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { buildFieldNodes } from './resolveFieldGeometry'

interface ResolveFieldPointsProps {
  colorStatic: string
  colorSignal: string
  pointerEnabled: boolean
  containerRef: RefObject<HTMLDivElement | null>
}

// Field bounds extend this far beyond the viewport on every side (in
// height-units — see the note above the useFrame body). MUST stay bigger
// than CONNECT_SPACING_MULT's resulting connectRadius, or a node wrapping
// around the edge would still be inside another node's connection radius
// while off-screen, popping a line in/out of view. Verified for 160 nodes
// across common aspect ratios: connectRadius lands between 0.14 and 0.24,
// comfortably under this margin.
const MARGIN = 0.3

// connectRadius = mean node spacing * this. ~1.4x spacing means a node
// typically has 2-3 others within range to choose neighbors from.
const CONNECT_SPACING_MULT = 1.4
const MAX_NEIGHBORS = 3

// Ambient wander layered on top of straight-line drift, so paths curve
// gently instead of looking like mechanical linear travel.
const WANDER_SPEED = 0.004

// The cursor doesn't move nodes directly — it adds ACCELERATION to each
// node's impulse velocity, which then decays slowly (REPEL below is a
// radius, PUSH_ACCEL a rate). This is the entire difference from a
// spring-back model: nothing ever pulls a node back toward where it was:
// once pushed, it keeps coasting on its own momentum until the impulse
// naturally bleeds off, then it's back to ambient drift, not "home."
// Widened from 0.22: a node now starts moving while the cursor is still
// approaching it, rather than only once the cursor is nearly on top of it.
// Half the perceived "my cursor sits there before anything happens" was
// simply this zone being too tight to enter early.
const REPEL_RADIUS = 0.34
// RESPONSE TIME, not speed. Time to go from rest to MAX_IMPULSE_SPEED under
// pure acceleration is (cap / accel): at the old 0.5 that was 0.14/0.5 =
// 0.28s of *full-strength* contact, and realistically ~0.45s once the
// distance falloff is averaged in — nearly half a second of ramp during
// which the node is crawling at a speed too low to perceive. That lag was
// the entire complaint. At 9.0 the same ramp is 0.14/9 = ~16ms, about one
// frame, so a node reacts on contact instead of winding up. The cap below
// is unchanged, so nothing actually moves any faster than before — it just
// gets to its speed immediately. This is what makes it read as a real
// repulsion field rather than something slowly noticing the cursor.
const PUSH_ACCEL = 9.0
// Caps impulse speed so repeatedly hovering the same node can't launch it
// off-screen — each additional push adds less once already near the cap.
// At 0.14, a maxed-out node crosses one full screen height in ~7s.
const MAX_IMPULSE_SPEED = 0.14
// exp(-DAMPING_RATE * dt) each frame — frame-rate independent decay.
// Raised from 0.18 (half-life 3.9s, ~13s to bleed off) to 0.5: half-life
// ~1.4s, ~10% left at ~4.6s. With the near-instant accel above, a decay
// that slow smeared every push into a long tail, so the field accumulated
// displacement and no single interaction read as its own cause-and-effect
// event. Faster decay is what makes each push legible as a discrete
// "pushed, coasted, settled" — the coast is still clearly visible, it just
// resolves before the next interaction instead of stacking with it.
const DAMPING_RATE = 0.5

// Scroll parallax: scrolling shifts every node's Y by this fraction of the
// scroll delta (in height-units), on top of whatever the physics sim is
// already doing — a uniform translation, so relative spacing/connections
// between nodes are unaffected. Uses the same wrap-at-bounds logic as
// ordinary drift, so it never needs its own clamping over a long page.
const SCROLL_PARALLAX_FACTOR = 0.35

const POINT_SIZE = 5
const POINT_OPACITY = 0.78
const LINE_OPACITY = 0.22
const FADE_IN_SEC = 1.2

/**
 * A small solid-white circle on transparent, used as the point sprite's
 * `map`. Without one, THREE.PointsMaterial draws every point as a
 * hard-edged square (gl_PointSize just sizes a square in the vertex
 * shader; nothing masks it into a circle without a texture or custom
 * fragment shader) — a plain <canvas> circle is the standard way to get
 * round points from the stock material rather than hand-written GLSL.
 * White + vertexColors: true means the texture only contributes its alpha
 * (the circular mask); the RGB stays whatever each point's own vertex
 * color is.
 */
function createCircleSprite(): THREE.CanvasTexture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/**
 * The full-page background field: 160 nodes scattered across the whole
 * viewport, drifting on constant ambient velocity plus gentle wander, with
 * a live nearest-neighbor proximity graph connecting each node to its
 * closest few. A cursor push adds momentum (not a position target) that
 * decays slowly — nodes keep floating in the direction they were pushed
 * long after the cursor moves away, never springing back. Built on
 * three.js's standard PointsMaterial/LineBasicMaterial rather than a
 * custom shader — at 160 nodes the O(n^2) neighbor search is well under a
 * millisecond per frame, and standard materials are far easier to reason
 * about precisely than hand-written GLSL.
 */
export function ResolveFieldPoints({
  colorStatic,
  colorSignal,
  pointerEnabled,
  containerRef,
}: ResolveFieldPointsProps) {
  const { count, normX, normY, baseVelX, baseVelY, wanderFreqX, wanderFreqY, wanderPhaseX, wanderPhaseY } =
    useMemo(() => buildFieldNodes(), [])
  const n = count

  const colorStaticVec = useMemo(() => new THREE.Color(colorStatic), [colorStatic])
  const colorSignalVec = useMemo(() => new THREE.Color(colorSignal), [colorSignal])

  // Live position/velocity state — mutated in place every frame, never
  // reassigned, so this is stable across renders with no allocation.
  const posX = useMemo(() => new Float32Array(n), [n])
  const posY = useMemo(() => new Float32Array(n), [n])
  const impulseVelX = useMemo(() => new Float32Array(n), [n])
  const impulseVelY = useMemo(() => new Float32Array(n), [n])
  const currentPos = useMemo(() => new Float32Array(n * 3), [n])

  const maxEdges = n * MAX_NEIGHBORS
  const linePositions = useMemo(() => new Float32Array(maxEdges * 2 * 3), [maxEdges])
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
    geo.setDrawRange(0, 0)
    return geo
  }, [linePositions])

  const circleSprite = useMemo(() => createCircleSprite(), [])

  const pointsMaterial = useMemo(
    () =>
      new THREE.PointsMaterial({
        map: circleSprite,
        size: POINT_SIZE,
        sizeAttenuation: false,
        vertexColors: true,
        transparent: true,
        opacity: 0,
        blending: THREE.NormalBlending,
        depthWrite: false,
      }),
    [circleSprite],
  )

  const linesMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: colorStaticVec,
        transparent: true,
        opacity: 0,
        blending: THREE.NormalBlending,
        depthWrite: false,
      }),
    [colorStaticVec],
  )

  // Every node is exactly the signal color — one flat value, no per-node
  // variation at all. Two earlier versions of this were removed: a
  // per-frame cursor-proximity glow (distracting), and a static per-node
  // `depth` lerp between background and signal meant to fake 3D depth,
  // which just read as some nodes being randomly dimmer than others. Only
  // the theme can change this, so it's written into the GPU-backed buffer
  // once here and never touched by the frame loop.
  useEffect(() => {
    const colorAttr = pointsGeometry.getAttribute('color') as THREE.BufferAttribute
    const colorArr = colorAttr.array as Float32Array
    for (let i = 0; i < n; i++) {
      colorArr[i * 3 + 0] = colorSignalVec.r
      colorArr[i * 3 + 1] = colorSignalVec.g
      colorArr[i * 3 + 2] = colorSignalVec.b
    }
    colorAttr.needsUpdate = true
  }, [n, colorSignalVec, pointsGeometry])

  // Pointer tracked on `window`, not R3F's canvas-scoped pointer — the
  // canvas has pointer-events-none (so it never blocks clicks on real
  // content), and an element with pointer-events-none never receives its
  // own pointer events. NDC is computed against the scoped container's own
  // bounding rect — now the full viewport, since this is a fixed
  // full-page background.
  const pointerNdc = useRef(new THREE.Vector2(0, 0))
  const pointerWorld = useRef(new THREE.Vector2(0, 0))
  const pointerActive = useRef(false)

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
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [pointerEnabled])

  // Scroll tracked the same way as pointer — a ref written in a passive
  // listener, read once per frame, never setState (scroll fires far too
  // often for that). The frame loop below only needs the delta between
  // frames, so this just needs to hold the latest raw scrollY.
  const scrollY = useRef(0)
  useEffect(() => {
    scrollY.current = window.scrollY
    const onScroll = () => {
      scrollY.current = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const elapsed = useRef(0)
  const fade = useRef(0)
  const initialized = useRef(false)
  const prevFieldHalfW = useRef(0)
  const prevScrollY = useRef(0)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    elapsed.current += dt
    fade.current = Math.min(1, fade.current + dt / FADE_IN_SEC)

    const aspect = state.viewport.width / state.viewport.height
    const fieldHalfW = aspect / 2 + MARGIN
    const fieldHalfH = 0.5 + MARGIN

    if (!initialized.current) {
      for (let i = 0; i < n; i++) {
        posX[i] = normX[i]! * fieldHalfW
        posY[i] = normY[i]! * fieldHalfH
      }
      initialized.current = true
      prevFieldHalfW.current = fieldHalfW
      prevScrollY.current = scrollY.current
    } else if (fieldHalfW !== prevFieldHalfW.current) {
      // Resize/aspect change — rescale so nodes stay evenly spread rather
      // than leaving empty bands that ambient drift would take minutes to
      // refill.
      const k = fieldHalfW / prevFieldHalfW.current
      for (let i = 0; i < n; i++) posX[i]! *= k
      prevFieldHalfW.current = fieldHalfW
    }

    const fieldArea = fieldHalfW * 2 * (fieldHalfH * 2)
    const spacing = Math.sqrt(fieldArea / n)
    const connectRadius = spacing * CONNECT_SPACING_MULT

    // Scroll parallax: convert the raw pixel delta since last frame into
    // height-units (window.innerHeight, real CSS pixels — NOT
    // state.viewport.height, which is Three.js world units at the camera
    // plane, a different scale). +Y is up in this space (matches the
    // pointer NDC convention below), and scrolling down increases
    // window.scrollY while page content visually moves up — so nodes
    // shift by +scrollDelta to drift the same apparent direction as the
    // content scrolling past them.
    const scrollDeltaHeightUnits = (scrollY.current - prevScrollY.current) / window.innerHeight
    prevScrollY.current = scrollY.current
    const scrollShiftY = scrollDeltaHeightUnits * SCROLL_PARALLAX_FACTOR

    if (pointerEnabled && pointerActive.current) {
      pointerWorld.current.x = pointerNdc.current.x * fieldHalfW
      pointerWorld.current.y = pointerNdc.current.y * fieldHalfH
    }
    const pointerX = pointerWorld.current.x
    const pointerY = pointerWorld.current.y

    const heightPx = state.viewport.height
    const damp = Math.exp(-DAMPING_RATE * dt)

    for (let i = 0; i < n; i++) {
      // 1) Cursor impulse — an acceleration added to this node's own
      // velocity, not a target position. Nothing here ever pulls a node
      // back toward where it started.
      if (pointerEnabled && pointerActive.current) {
        const dx = posX[i]! - pointerX
        const dy = posY[i]! - pointerY
        const dist = Math.hypot(dx, dy)
        if (dist < REPEL_RADIUS && dist > 1e-5) {
          const t = 1 - dist / REPEL_RADIUS
          // sqrt, not smoothstep: rises fast and stays strong across most of
          // the radius instead of only near-full-strength right at the
          // cursor — smoothstep's slow start read as a sluggish trigger.
          const falloff = Math.sqrt(t)
          impulseVelX[i]! += (dx / dist) * PUSH_ACCEL * falloff * dt
          impulseVelY[i]! += (dy / dist) * PUSH_ACCEL * falloff * dt
        }
      }

      // 2) Cap impulse speed so repeated hovering can't fling a node
      // off-screen — each further push adds progressively less once near cap.
      const impulseSpeed = Math.hypot(impulseVelX[i]!, impulseVelY[i]!)
      if (impulseSpeed > MAX_IMPULSE_SPEED) {
        const k = MAX_IMPULSE_SPEED / impulseSpeed
        impulseVelX[i]! *= k
        impulseVelY[i]! *= k
      }

      // 3) Total velocity = constant ambient drift (never damped) +
      // damped cursor impulse + gentle wander. Splitting drift from
      // impulse is what makes "antigravity" work: a single damped
      // velocity would eventually go dead and motionless; keeping drift
      // undamped means the field is always gently alive, while a cursor
      // push adds momentum on top that fades on its own schedule.
      const wx = Math.sin(elapsed.current * wanderFreqX[i]! + wanderPhaseX[i]!) * WANDER_SPEED
      const wy = Math.sin(elapsed.current * wanderFreqY[i]! + wanderPhaseY[i]!) * WANDER_SPEED
      posX[i]! += (baseVelX[i]! + impulseVelX[i]! + wx) * dt
      posY[i]! += (baseVelY[i]! + impulseVelY[i]! + wy) * dt
      // 3b) Scroll parallax — a uniform shift, same for every node, so it
      // never disturbs relative spacing/connections between them.
      posY[i]! += scrollShiftY

      // 4) Impulse decays; ambient drift and wander do not.
      impulseVelX[i]! *= damp
      impulseVelY[i]! *= damp

      // 5) Wrap at the field bounds (well outside the viewport — see
      // MARGIN — so wrapping is never visible).
      if (posX[i]! > fieldHalfW) posX[i]! -= fieldHalfW * 2
      else if (posX[i]! < -fieldHalfW) posX[i]! += fieldHalfW * 2
      if (posY[i]! > fieldHalfH) posY[i]! -= fieldHalfH * 2
      else if (posY[i]! < -fieldHalfH) posY[i]! += fieldHalfH * 2

      currentPos[i * 3 + 0] = posX[i]! * heightPx
      currentPos[i * 3 + 1] = posY[i]! * heightPx
      currentPos[i * 3 + 2] = 0
    }

    ;(pointsGeometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true

    // Connections: each node's MAX_NEIGHBORS nearest within connectRadius —
    // not every pair in range, which produces a dense tangle once several
    // nodes drift close together. One consistent color, no per-edge
    // brightness variation.
    const connRadius2 = connectRadius * connectRadius
    nearestIdx.fill(-1)
    nearestDist2.fill(Infinity)

    // Pass 1: keep each node's closest MAX_NEIGHBORS candidates (tiny
    // fixed-size insertion sort — cheap since MAX_NEIGHBORS is small, and
    // avoids allocating a sortable array per node).
    for (let i = 0; i < n; i++) {
      const xi = posX[i]!
      const yi = posY[i]!
      for (let j = 0; j < n; j++) {
        if (j === i) continue
        const dx = xi - posX[j]!
        const dy = yi - posY[j]!
        const d2 = dx * dx + dy * dy
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

    // Pass 2: draw an edge wherever EITHER side kept the other as one of
    // its nearest (a mutual-AND requirement produces a much sparser, often
    // visually disconnected graph at this node count).
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
        linePositions[base + 2] = 0
        linePositions[base + 3] = currentPos[j * 3 + 0]!
        linePositions[base + 4] = currentPos[j * 3 + 1]!
        linePositions[base + 5] = 0
        vertexCount += 2
      }
    }

    ;(linesGeometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true
    linesGeometry.setDrawRange(0, vertexCount)

    pointsMaterial.opacity = POINT_OPACITY * fade.current
    linesMaterial.opacity = LINE_OPACITY * fade.current
  })

  return (
    <>
      <points geometry={pointsGeometry} material={pointsMaterial} frustumCulled={false} />
      <lineSegments geometry={linesGeometry} material={linesMaterial} frustumCulled={false} />
    </>
  )
}
