import Image from 'next/image'
import type { Project } from '@/data/schema'
import { pad2 } from '@/lib/utils'

/** Deterministic PRNG — same seed always produces the same point field. */
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

const BASE_HUE = 189 // the site's cyan
const DOT_COUNT = 48

interface ProjectCoverProps {
  project: Project
  className?: string
}

/**
 * The no-screenshots answer: a procedural point-field cover generated from
 * the project's seed, tinted by its hue offset — reads as a deliberate
 * sleeve system, not a placeholder. Zero client JS; the point field is
 * computed once per render on the server. Swaps for a real image with no
 * template changes once `project.cover.type === 'image'`.
 */
export function ProjectCover({ project, className }: ProjectCoverProps) {
  if (project.cover.type === 'image') {
    return (
      <div className={`relative aspect-[4/3] w-full overflow-hidden border border-[var(--color-border)] ${className ?? ''}`}>
        <Image src={project.cover.src} alt={project.cover.alt} fill className="object-cover" />
      </div>
    )
  }

  const { seed, hue } = project.cover
  const rand = mulberry32(seed)
  const points = Array.from({ length: DOT_COUNT }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    r: 0.4 + rand() * 1.1,
  }))
  const dotHue = (BASE_HUE + hue + 360) % 360

  return (
    <div
      className={`relative aspect-[4/3] w-full overflow-hidden border border-[var(--color-border)] bg-[var(--color-ink-900)] ${className ?? ''}`}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={`hsl(${dotHue} 90% 60%)`} opacity={0.5} />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        <span className="text-display-l text-[var(--color-ink-050)]">{pad2(project.index)}</span>
        <span className="text-caption text-[var(--color-text-secondary)]">{project.stack.slice(0, 3).join(' · ')}</span>
      </div>
    </div>
  )
}
