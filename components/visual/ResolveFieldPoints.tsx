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
// Widened from 0.22: a node starts moving while the cursor is still
// approaching rather than only once the cursor is nearly on top of it.
const REPEL_RADIUS = 0.3
// RESPONSE TIME, not speed. Time from rest to a given speed under pure
// acceleration is (speed / accel): at the old 0.5 that was 0.14/0.5 =
// 0.28s of *full-strength* contact, ~0.45s once the distance falloff is
// averaged in — nearly half a second of ramp during which the node crawls
// too slowly to perceive. That lag was the whole "my cursor sits there
// before anything happens" complaint. At 25 even the strongest near-field
// push saturates in ~30ms (about two frames), so nodes react on contact
// instead of winding up. Accel governs *how fast a node reaches* its
// speed; the caps below govern what that speed actually is.
const PUSH_ACCEL = 25
// Peak impulse speed, reached only with the cursor essentially on top of a
// node. Scaled by proximity SQUARED (see the frame loop), so the field has
// a real gradient instead of one flat speed everywhere inside the radius:
// grazing the fringe is a nudge, closing in genuinely throws the node.
// The old model capped every in-radius node at the same 0.14 no matter how
// close the cursor was, which is why proximity didn't read as aggression.
// Tuned down from 0.8, which read as too fast — note this is purely the
// SPEED knob and is independent of PUSH_ACCEL above (the response-time
// knob), so lowering it keeps the instant on-contact reaction intact.
const MAX_PUSH_SPEED = 0.45
// Absolute safety ceiling on accumulated impulse, independent of distance —
// stops repeated pushes on an already-coasting node from compounding into
// something that rockets off-screen.
const HARD_MAX_IMPULSE_SPEED = 0.6
// exp(-DAMPING_RATE * dt) each frame — frame-rate independent decay. Total
// coast distance after a push is (speed / DAMPING_RATE), so at 1.2 a
// full-strength 0.45 push carries ~0.38 screen-heights before settling —
// punchy and clearly ballistic, but it resolves in about a second instead
// of smearing into the next interaction. Raised from 0.18 (half-life 3.9s):
// with the much higher speeds above, that slow a decay let displacement
// accumulate across the whole field and no single push read as its own
// cause-and-effect event.
const DAMPING_RATE = 1.2

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

    // NDC spans +/-1 across the VIEWPORT, so it must be scaled by the
    // viewport half-extent (aspect/2 horizontally, 0.5 vertically) — NOT by
    // fieldHalfW/fieldHalfH, which include MARGIN and describe the larger
    // wrap-around field extending past the screen edges. Using the field
    // extent here stretched the cursor's effective position outward from
    // center by 1.6x vertically: correct at dead center, off by 0.15 at
    // mid-screen, and off by a full 0.3 (larger than REPEL_RADIUS itself)
    // at the top/bottom edges. That's what made nodes right under the
    // cursor sit still while nodes further away reacted instead.
    if (pointerEnabled && pointerActive.current) {
      pointerWorld.current.x = pointerNdc.current.x * (aspect / 2)
      pointerWorld.current.y = pointerNdc.current.y * 0.5
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
          const speedBefore = Math.hypot(impulseVelX[i]!, impulseVelY[i]!)
          impulseVelX[i]! += (dx / dist) * PUSH_ACCEL * dt
          impulseVelY[i]! += (dy / dist) * PUSH_ACCEL * dt

          // The gradient lives here, in a proximity-scaled ceiling, rather
          // than in the acceleration: accel is deliberately high enough to
          // saturate within a frame or two at any distance (that's the
          // response time), so if the ceiling were flat every in-radius
          // node would end up at the same speed and closing in on a node
          // would feel identical to grazing it. Squaring proximity
          // concentrates the strength near the cursor — at the fringe the
          // ceiling is near zero (so there's no pop at the radius edge),
          // at half the radius it's a quarter strength, and only right on
          // top of a node does it reach MAX_PUSH_SPEED.
          const proximity = 1 - dist / REPEL_RADIUS
          const localCap = MAX_PUSH_SPEED * proximity * proximity

          // max(localCap, speedBefore): the push may raise a node up to
          // this distance's ceiling, but must never drag an already-faster
          // node back DOWN to it. Without that, a node thrown hard from
          // point-blank range would be throttled frame by frame as it
          // coasts outward into weaker parts of the field — a braking
          // force, which is exactly the spring-back behavior this whole
          // momentum model exists to avoid.
          const cap = Math.max(localCap, speedBefore)
          const speedAfter = Math.hypot(impulseVelX[i]!, impulseVelY[i]!)
          if (speedAfter > cap) {
            const k = cap / speedAfter
            impulseVelX[i]! *= k
            impulseVelY[i]! *= k
          }
        }
      }

      // 2) Absolute ceiling, applied regardless of cursor distance, so
      // repeated pushes can't compound a node into escaping the field.
      const impulseSpeed = Math.hypot(impulseVelX[i]!, impulseVelY[i]!)
      if (impulseSpeed > HARD_MAX_IMPULSE_SPEED) {
        const k = HARD_MAX_IMPULSE_SPEED / impulseSpeed
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
