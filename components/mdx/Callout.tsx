import type { ReactNode } from 'react'

/** A short aside within case-study prose — a caveat, a scope note, a caught assumption. */
export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="text-body max-w-2xl border-l-2 border-[var(--color-signal)] py-1 pl-4 text-[var(--color-text-secondary)]">
      {children}
    </div>
  )
}
