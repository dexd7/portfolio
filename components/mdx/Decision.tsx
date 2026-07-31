import type { ReactNode } from 'react'

interface DecisionProps {
  title: string
  alternatives?: string
  children: ReactNode
}

/**
 * The highest-signal block in a case study: what was decided, what else was
 * considered, and why. MDX-authored (qualitative reasoning, not structured
 * data) — used inside content/work/<slug>.mdx.
 */
export function Decision({ title, alternatives, children }: DecisionProps) {
  return (
    <div className="max-w-2xl border-t border-[var(--color-border)] py-8">
      <p className="text-label mb-2 text-[var(--color-signal)]">Decision</p>
      <h3 className="text-h3">{title}</h3>
      {alternatives && (
        <p className="text-caption mt-3 text-[var(--color-text-dim)]">
          <span className="text-[var(--color-text-secondary)]">Alternatives considered — </span>
          {alternatives}
        </p>
      )}
      <div className="text-body mt-3 text-[var(--color-text-secondary)]">{children}</div>
    </div>
  )
}
