'use client'

import { skillGroups } from '@/data/skills'
import type { Skill } from '@/data/schema'
import { Section } from '@/components/layout/Section'
import { Resolve } from '@/components/primitives/Resolve'
import { useCrossHighlight } from '@/components/sections/CrossHighlight'

function SkillRow({ skill }: { skill: Skill }) {
  const { hovered, setHovered } = useCrossHighlight()

  const isDimmed =
    hovered !== null &&
    !(
      (hovered.kind === 'skill' && hovered.id === skill.id) ||
      (hovered.kind === 'project' && skill.provenBy.includes(hovered.id))
    )

  return (
    <li
      onMouseEnter={() => setHovered({ kind: 'skill', id: skill.id })}
      onMouseLeave={() => setHovered(null)}
      onFocus={() => setHovered({ kind: 'skill', id: skill.id })}
      onBlur={() => setHovered(null)}
      tabIndex={0}
      className="flex items-center justify-between gap-4 py-2 transition-opacity duration-[var(--duration-ui)]"
      style={{ opacity: isDimmed ? 0.4 : 1 }}
    >
      <span className="text-body">{skill.label}</span>
      <span className="flex items-center gap-1" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: i < skill.level ? 'var(--color-signal)' : 'var(--color-ink-700)' }}
          />
        ))}
      </span>
      <span className="sr-only">{skill.level} of 5</span>
    </li>
  )
}

interface SignalsProps {
  /** Homepage usage numbers this as movement 03; reused elsewhere (e.g. /about) without that numbering. */
  id?: string
  index?: number
  label?: string
}

/**
 * Movement 03 on the homepage — also reused as-is on /about (with the
 * homepage-specific id/index/label overridden) since it's the same curated,
 * proof-backed skill list either way. Hovering a skill highlights the work
 * rows that prove it, and vice versa — the cross-highlight is driven
 * entirely by `proves` / `provenBy` in the data layer, via CrossHighlightContext.
 */
export function Signals({ id = 'signals', index = 3, label = 'Signals' }: SignalsProps) {
  return (
    <Section id={id} index={index} label={label}>
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {skillGroups.map((group, gi) => (
          <Resolve key={group.id} index={gi}>
            <p className="text-label mb-4 text-[var(--color-text-dim)]">{group.label}</p>
            <ul>
              {group.skills.map((skill) => (
                <SkillRow key={skill.id} skill={skill} />
              ))}
            </ul>
          </Resolve>
        ))}
      </div>
    </Section>
  )
}
