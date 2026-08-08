/** Deterministic PRNG — same seed always produces the same field. */
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

const NODE_COUNT = 160
const BASE_DRIFT_MIN = 0.006
const BASE_DRIFT_MAX = 0.018
const WANDER_FREQ_MIN = 0.05
const WANDER_FREQ_MAX = 0.15

/**
 * The full-page background field: 160 nodes scattered across the whole
 * viewport (not condensing toward any particular shape — see
 * ResolveFieldPoints.tsx for why: a symmetric/recognizable resolved shape
 * was explicitly rejected earlier in this project). Everything here is
 * flat `Float32Array`s rather than an array of node objects — the frame
 * loop touches every field of every node 160x per frame, and typed arrays
 * avoid pointer-chasing at that rate.
 *
 * Positions/velocities are seeded in normalized [-1, 1] space; the frame
 * loop (ResolveFieldPoints.tsx) scales them into real height-unit field
 * bounds on first mount and on resize — this file has no notion of
 * viewport size, only the random seeds.
 */
export interface FieldGeometry {
  count: number
  /** Normalized [-1, 1] scatter seeds — scaled into real field bounds once, on first frame. */
  normX: Float32Array
  normY: Float32Array
  /** Constant ambient drift, in height-units/second. Never damped — this is what keeps the field always gently moving ("antigravity": nothing pulls a node back to rest). */
  baseVelX: Float32Array
  baseVelY: Float32Array
  /** Cursor-imparted velocity — starts at 0, accumulates on a cursor push, decays slowly. Written every frame in ResolveFieldPoints.tsx; this file only sizes the buffers. */
  impulseVelX: Float32Array
  impulseVelY: Float32Array
  /** Per-node wander frequency (rad/s) and phase — a gentle sinusoidal curve added on top of straight-line drift so paths don't look mechanically linear. */
  wanderFreqX: Float32Array
  wanderFreqY: Float32Array
  wanderPhaseX: Float32Array
  wanderPhaseY: Float32Array
}
// A static per-node `depth` in [0.65, 1] used to live here, lerping each
// node's color between the page background and the signal color so the
// field read as having faux 3D depth. Removed deliberately: the varying
// brightness just looked like inconsistent nodes rather than depth, and a
// single uniform color reads cleaner. Every node is now exactly the signal
// color — don't reintroduce per-node color variation without being asked.

export function buildFieldNodes(seed = 7): FieldGeometry {
  const rand = mulberry32(seed)
  const count = NODE_COUNT

  const normX = new Float32Array(count)
  const normY = new Float32Array(count)
  const baseVelX = new Float32Array(count)
  const baseVelY = new Float32Array(count)
  const impulseVelX = new Float32Array(count) // stays 0 — no impulse until the cursor imparts one
  const impulseVelY = new Float32Array(count)
  const wanderFreqX = new Float32Array(count)
  const wanderFreqY = new Float32Array(count)
  const wanderPhaseX = new Float32Array(count)
  const wanderPhaseY = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    normX[i] = rand() * 2 - 1
    normY[i] = rand() * 2 - 1

    const driftAngle = rand() * Math.PI * 2
    const driftSpeed = BASE_DRIFT_MIN + rand() * (BASE_DRIFT_MAX - BASE_DRIFT_MIN)
    baseVelX[i] = Math.cos(driftAngle) * driftSpeed
    baseVelY[i] = Math.sin(driftAngle) * driftSpeed

    wanderFreqX[i] = WANDER_FREQ_MIN + rand() * (WANDER_FREQ_MAX - WANDER_FREQ_MIN)
    wanderFreqY[i] = WANDER_FREQ_MIN + rand() * (WANDER_FREQ_MAX - WANDER_FREQ_MIN)
    wanderPhaseX[i] = rand() * Math.PI * 2
    wanderPhaseY[i] = rand() * Math.PI * 2
  }

  return {
    count,
    normX,
    normY,
    baseVelX,
    baseVelY,
    impulseVelX,
    impulseVelY,
    wanderFreqX,
    wanderFreqY,
    wanderPhaseX,
    wanderPhaseY,
  }
}
