'use client'

import type { ReactNode } from 'react'
import type { Project } from '@/data/schema'
import { useCrossHighlight } from '@/components/sections/CrossHighlight'
import { useWorkAccordion } from '@/components/work/WorkAccordion'
import { Resolve } from '@/components/primitives/Resolve'
import { Chip } from '@/components/ui/Chip'
import { BulletCascade } from '@/components/work/BulletCascade'
import { MetricsGrid } from '@/components/work/MetricsGrid'
import { pad2 } from '@/lib/utils'

interface WorkRowProps {
  project: Project
  /** Stagger index for the Resolve entrance. */
  index: number
  /** Resume bullets for the accordion panel — resolved by the Server Component parent (project.highlights, or the linked experience.ts entry's). */
  highlights?: string[]
  /** Pre-rendered MDX intro, if the project has one — resolved server-side, this component never touches MDX itself. */
  intro?: ReactNode
}

/**
 * A row in the work index — used on the homepage's featured list and on the
 * full /work page. Clicking expands an inline accordion panel in place (see
 * WorkAccordion for the shared "only one open" state) instead of navigating
 * to a case-study page — there isn't one anymore. A portaled modal was
 * tried instead of this and reverted — it added real weight (framer-motion,
 * scroll-gating, backdrop-blur) for content that reads fine inline.
 *
 * The panel's own content plays the site's normal `Resolve` reveal (see
 * that file) on open — the same blur→sharp/offset→settled motif every
 * other entrance on the site uses, just driven by `isOpen` instead of
 * scroll position (`visible={isOpen}` bypasses Resolve's IntersectionObserver).
 * One reveal for the whole panel, not a per-bullet stagger — a single
 * clean motion reads better here than several competing ones.
 */
export function WorkRow({ project, index, highlights, intro }: WorkRowProps) {
  const { hovered, setHovered } = useCrossHighlight()
  const { expandedSlug, setExpandedSlug } = useWorkAccordion()
  const isOpen = expandedSlug === project.slug
  const direction = index % 2 === 0 ? 'left' : 'right'

  const isDimmed =
    hovered !== null &&
    !(
      (hovered.kind === 'project' && hovered.id === project.slug) ||
      (hovered.kind === 'skill' && project.proves.includes(hovered.id))
    )

  return (
    <Resolve index={index} direction={direction}>
      <div id={project.slug} className="border-t border-[var(--color-border)]" style={{ opacity: isDimmed ? 0.4 : 1 }}>
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setExpandedSlug(isOpen ? null : project.slug)}
          onMouseEnter={() => setHovered({ kind: 'project', id: project.slug })}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered({ kind: 'project', id: project.slug })}
          onBlur={() => setHovered(null)}
          className="group flex w-full flex-col gap-3 py-6 text-left transition-[opacity] duration-[var(--duration-ui)] sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
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

          {/* Wrapper mirrors the title row's own "flex items-baseline gap-6"
              exactly, so the hidden index-width spacer forces this line to
              land flush under the title on mobile — measured by construction
              instead of a guessed padding value. sm:contents/sm:hidden fold
              it back to today's sm:flex-row desktop layout. */}
          <div className="flex items-baseline gap-6 sm:contents">
            <span aria-hidden="true" className="invisible text-label sm:hidden">
              {pad2(project.index)}
            </span>
            <div className="flex shrink-0 items-center gap-4">
              <span className="hidden text-caption text-[var(--color-text-dim)] md:inline">
                {project.stack.slice(0, 3).join(' · ')}
              </span>
              <span className="text-caption text-[var(--color-text-dim)]">{project.year}</span>
              <svg
                aria-hidden="true"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-[var(--color-signal)] transition-transform duration-[var(--duration-ui)]"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </button>

        <div className="accordion-panel" data-open={isOpen}>
          <div className="accordion-panel-inner pb-10">
            <Resolve visible={isOpen} direction={direction}>
              <div className="flex flex-wrap items-center gap-3">
                {project.stack.map((s) => (
                  <Chip key={s}>{s}</Chip>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-6 text-label text-[var(--color-text-dim)]">
                <span>
                  {project.role}
                  {project.org ? ` · ${project.org}` : ''}
                </span>
                {project.links.repo && (
                  <a href={project.links.repo} target="_blank" rel="noreferrer" className="hover:text-[var(--color-signal)]">
                    Repo ↗
                  </a>
                )}
                {project.links.live && (
                  <a href={project.links.live} target="_blank" rel="noreferrer" className="hover:text-[var(--color-signal)]">
                    Live ↗
                  </a>
                )}
              </div>

              {project.confidential && (
                <p className="text-caption mt-6 max-w-xl border-l-2 border-[var(--color-border)] pl-4 text-[var(--color-text-dim)]">
                  Some details omitted — NDA. Architecture and outcomes only, no client data.
                </p>
              )}

              {intro && <div className="mt-8 max-w-2xl text-body text-[var(--color-text-secondary)]">{intro}</div>}

              {highlights && highlights.length > 0 && (
                <div className="mt-8">
                  <BulletCascade bullets={highlights} />
                </div>
              )}

              {project.metrics.length > 0 && (
                <div className="mt-10">
                  <MetricsGrid metrics={project.metrics} />
                </div>
              )}
            </Resolve>
          </div>
        </div>
      </div>
    </Resolve>
  )
}
