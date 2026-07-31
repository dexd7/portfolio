'use client'

import Link from 'next/link'
import type { Project } from '@/data/schema'
import { useCrossHighlight } from '@/components/sections/CrossHighlight'
import { Resolve } from '@/components/primitives/Resolve'
import { pad2 } from '@/lib/utils'

interface WorkRowProps {
  project: Project
  /** Stagger index for the Resolve entrance. */
  index: number
}

/**
 * A row in the work index — used on the homepage's featured list and on the
 * full /work page. Everything shown here is visible by default (title,
 * thesis, stack, year); hover/focus only enhance position and color, never
 * reveal information that would otherwise be hidden — no hover-only content.
 */
export function WorkRow({ project, index }: WorkRowProps) {
  const { hovered, setHovered } = useCrossHighlight()

  const isDimmed =
    hovered !== null &&
    !(
      (hovered.kind === 'project' && hovered.id === project.slug) ||
      (hovered.kind === 'skill' && project.proves.includes(hovered.id))
    )

  const href = project.links.internal ?? project.links.live ?? project.links.repo ?? '#'

  return (
    <Resolve index={index} direction={index % 2 === 0 ? 'left' : 'right'}>
      <Link
        href={href}
        onMouseEnter={() => setHovered({ kind: 'project', id: project.slug })}
        onMouseLeave={() => setHovered(null)}
        onFocus={() => setHovered({ kind: 'project', id: project.slug })}
        onBlur={() => setHovered(null)}
        className="group flex flex-col gap-3 border-t border-[var(--color-border)] py-6 transition-[opacity] duration-[var(--duration-ui)] sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
        style={{ opacity: isDimmed ? 0.4 : 1 }}
      >
        <div className="flex items-baseline gap-6">
          <span className="text-label text-[var(--color-signal)]">{pad2(project.index)}</span>
          <div>
            <p className="text-h3 transition-transform duration-[var(--duration-ui)] ease-[var(--ease-settle)] group-hover:translate-x-2 group-focus-visible:translate-x-2">
              {project.title}
            </p>
            <p className="text-caption mt-1 text-[var(--color-text-dim)]">{project.thesis}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 pl-[calc(1.5rem+1.7em)] sm:pl-0">
          <span className="hidden text-caption text-[var(--color-text-dim)] md:inline">
            {project.stack.slice(0, 3).join(' · ')}
          </span>
          <span className="text-caption text-[var(--color-text-dim)]">{project.year}</span>
          <span aria-hidden="true" className="text-[var(--color-signal)]">
            ↗
          </span>
        </div>
      </Link>
    </Resolve>
  )
}
