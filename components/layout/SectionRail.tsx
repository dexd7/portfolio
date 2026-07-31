'use client'

import { useActiveSection } from '@/hooks/useActiveSection'
import { pad2 } from '@/lib/utils'

const SECTIONS = [
  { id: 'hero', index: 0 },
  { id: 'proof', index: 1 },
  { id: 'work', index: 2 },
  { id: 'signals', index: 3 },
  { id: 'contact', index: 4 },
] as const

const SECTION_IDS = SECTIONS.map((s) => s.id)

/**
 * Left-edge scroll progress, desktop only (≥1280px / Tailwind `xl`). Doubles
 * as a jump nav — click any marker to scroll to that movement.
 */
export function SectionRail() {
  const active = useActiveSection(SECTION_IDS)

  return (
    <nav
      aria-label="Page sections"
      className="fixed left-8 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-4 print:hidden xl:flex"
    >
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          aria-current={active === s.id ? 'true' : undefined}
          className="text-caption transition-colors duration-[var(--duration-ui)]"
          style={{ color: active === s.id ? 'var(--color-signal)' : 'var(--color-muted)' }}
        >
          {pad2(s.index)}
        </a>
      ))}
    </nav>
  )
}
