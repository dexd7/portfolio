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

const PHI = (1 + Math.sqrt(5)) / 2

/**
 * The 12 vertices of a regular icosahedron — the standard construction: all
 * cyclic permutations (not all 6 permutations, just the 3 cyclic ones) of
 * (0, ±1, ±φ).
 */
function icosahedronVertices(): THREE.Vector3[] {
  const base: [number, number, number] = [0, 1, PHI]
  const cyclicOrders = [
    [0, 1, 2],
    [2, 0, 1],
    [1, 2, 0],
  ]
  const signsFor = (v: number) => (v === 0 ? [1] : [1, -1])

  const verts: THREE.Vector3[] = []
  for (const [i0, i1, i2] of cyclicOrders) {
    const t: [number, number, number] = [base[i0!]!, base[i1!]!, base[i2!]!]
    for (const s0 of signsFor(t[0])) {
      for (const s1 of signsFor(t[1])) {
        for (const s2 of signsFor(t[2])) {
          verts.push(new THREE.Vector3(s0 * t[0], s1 * t[1], s2 * t[2]))
        }
      }
    }
  }
  return verts
}

/**
 * Finds edges by distance rather than hardcoded topology: both the
 * icosahedron and the truncated icosahedron are Archimedean/Platonic
 * solids, so every true edge shares one exact minimum length — any pair of
 * vertices at (close to) that minimum distance is an edge.
 */
function findEdges(vertices: THREE.Vector3[], tolerance = 1.001): [number, number][] {
  const n = vertices.length
  let minDist = Infinity
  const dist: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(Infinity))

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = vertices[i]!.distanceTo(vertices[j]!)
      dist[i]![j] = d
      dist[j]![i] = d
      if (d < minDist) minDist = d
    }
  }

  const edges: [number, number][] = []
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (dist[i]![j]! <= minDist * tolerance) edges.push([i, j])
    }
  }
  return edges
}

/**
 * Builds a truncated icosahedron — the actual geometry behind a soccer
 * ball's panel pattern (12 pentagons + 20 hexagons) — by truncating each
 * icosahedron vertex: every icosahedron edge (30 of them) contributes two
 * new vertices at 1/3 and 2/3 along its length, giving the 60 vertices of
 * the truncated solid. Edges are then re-derived the same distance-based
 * way. Normalized to unit circumradius.
 */
function truncatedIcosahedron(): { vertices: THREE.Vector3[]; edgeLength: number } {
  const icoVerts = icosahedronVertices()
  const icoEdges = findEdges(icoVerts) // expect 30

  const vertices: THREE.Vector3[] = []
  for (const [a, b] of icoEdges) {
    const va = icoVerts[a]!
    const vb = icoVerts[b]!
    vertices.push(va.clone().lerp(vb, 1 / 3))
    vertices.push(va.clone().lerp(vb, 2 / 3))
  }
  // expect 60 vertices

  let circumradius = 0
  for (const v of vertices) circumradius = Math.max(circumradius, v.length())
  for (const v of vertices) v.divideScalar(circumradius)

  const edges = findEdges(vertices) // expect 90
  let edgeLength = Infinity
  for (const [a, b] of edges) edgeLength = Math.min(edgeLength, vertices[a]!.distanceTo(vertices[b]!))

  if (vertices.length !== 60 || edges.length !== 90) {
    // Self-check: if this ever fires, the construction above is wrong.
    console.warn(
      `[resolveFieldGeometry] truncated icosahedron has ${vertices.length} vertices / ${edges.length} edges — expected 60 / 90.`,
    )
  }

  return { vertices, edgeLength }
}

export interface WebNode {
  /** Scattered starting position — a loose sphere the ball condenses in from. */
  noise: THREE.Vector3
  /** Resolved position: a vertex of the truncated icosahedron, unit circumradius. */
  lattice: THREE.Vector3
  /** 0..1 — randomized so the ball assembles from noise organically, not as a directional wipe. */
  delay: number
}

export interface FootballGeometry {
  nodes: WebNode[]
  /** True edge length in the same unit-circumradius scale as `lattice`, for connection-distance tuning. */
  edgeLength: number
}

/** The soccer-ball node set the field resolves into. */
export function buildFootballNodes(seed = 7): FootballGeometry {
  const { vertices, edgeLength } = truncatedIcosahedron()
  const rand = mulberry32(seed)

  const nodes: WebNode[] = vertices.map((lattice) => {
    const theta = rand() * Math.PI * 2
    const phi = Math.acos(rand() * 2 - 1)
    const r = 1.7 + rand() * 0.7
    const noise = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    )
    return { noise, lattice, delay: rand() }
  })

  return { nodes, edgeLength }
}
