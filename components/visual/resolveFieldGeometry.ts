import * as THREE from 'three'

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

/** A uniformly-distributed random point on a sphere of the given radius. */
function randomOnSphere(rand: () => number, radius: number): THREE.Vector3 {
  const theta = rand() * Math.PI * 2
  const phi = Math.acos(rand() * 2 - 1)
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
  )
}

export interface FieldNode {
  /** Scattered starting position — a loose sphere the field condenses in from. */
  noise: THREE.Vector3
  /** Resolved anchor — a random point on a tighter sphere, NOT a symmetric solid's vertex, so 60 of them never coalesce into a recognizable shape. */
  lattice: THREE.Vector3
  /** 0..1 — randomized so the field assembles from noise organically, not as a directional wipe. */
  delay: number
  /** Per-axis wander frequency (rad/s) and phase — every node drifts around its own anchor independently, never a rigid whole-body rotation. */
  wanderFreq: THREE.Vector3
  wanderPhase: THREE.Vector3
  /** Per-node wander amplitude, in the same unit-sphere scale as `lattice`. */
  wanderAmplitude: number
}

export interface FieldGeometry {
  nodes: FieldNode[]
}

/**
 * A loose cloud of 60 nodes that condense from scattered noise toward
 * random anchors on a tighter sphere — deliberately NOT the vertices of any
 * symmetric solid, so it never reads as a recognizable shape regardless of
 * viewing angle. Each node also wanders continuously around its own anchor
 * at its own randomized frequency/phase, so the field never looks like a
 * single rigid body rotating — motion is per-node and asynchronous.
 * Connections between nodes are a live proximity graph computed in
 * ResolveFieldPoints.tsx, not anything fixed here.
 */
export function buildFieldNodes(seed = 7): FieldGeometry {
  const rand = mulberry32(seed)
  const n = 60

  const nodes: FieldNode[] = Array.from({ length: n }, () => {
    const noise = randomOnSphere(rand, 1.7 + rand() * 0.7)
    const lattice = randomOnSphere(rand, 0.55 + rand() * 0.35)
    const wanderFreq = new THREE.Vector3(0.12 + rand() * 0.28, 0.12 + rand() * 0.28, 0.12 + rand() * 0.28)
    const wanderPhase = new THREE.Vector3(rand() * Math.PI * 2, rand() * Math.PI * 2, rand() * Math.PI * 2)
    const wanderAmplitude = 0.1 + rand() * 0.12
    return { noise, lattice, delay: rand(), wanderFreq, wanderPhase, wanderAmplitude }
  })

  return { nodes }
}
