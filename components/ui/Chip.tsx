import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface ChipProps {
  children: ReactNode
  className?: string
}

/** Mono pill for stack items, tags, status. No fill, just a hairline. */
export function Chip({ children, className }: ChipProps) {
  return (
    <span
      className={cn(
        'text-caption inline-flex items-center border border-[var(--color-border)] px-2.5 py-1 text-[var(--color-text-secondary)]',
        className,
      )}
      style={{ borderRadius: 'var(--radius-soft)' }}
    >
      {children}
    </span>
  )
}
