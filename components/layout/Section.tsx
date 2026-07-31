import { Container } from './Container'
import { cn } from '@/lib/utils'
import { pad2 } from '@/lib/utils'
import type { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  id?: string
  className?: string
  /** Section number for the left rail (00–04) and mono eyebrow. */
  index?: number
  /** Eyebrow label, e.g. "SELECTED WORK". */
  label?: string
  wide?: boolean
  /** Tighter vertical rhythm for content-dense pages (About) — full rhythm stays the default everywhere else. */
  compact?: boolean
}

/**
 * The vertical rhythm unit for the whole site — every homepage movement and
 * every page section is a <Section>, so spacing never drifts per-page.
 */
export function Section({ children, id, className, index, label, wide, compact }: SectionProps) {
  return (
    <section
      id={id}
      data-section-index={index !== undefined ? pad2(index) : undefined}
      className={cn('relative', className)}
      style={{ paddingBlock: compact ? 'clamp(56px, 8vh, 112px)' : 'var(--section-rhythm)' }}
      aria-label={label}
    >
      <Container wide={wide}>
        {label !== undefined && (
          <p className="text-label text-[var(--color-text-dim)] mb-8 flex items-center gap-3">
            {index !== undefined && <span className="text-[var(--color-signal)]">{pad2(index)}</span>}
            <span>{label}</span>
          </p>
        )}
        {children}
      </Container>
    </section>
  )
}
