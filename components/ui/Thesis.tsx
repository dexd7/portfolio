import { site } from '@/data/site.config'
import { cn } from '@/lib/utils'

interface ThesisProps {
  className?: string
}

/**
 * Renders `site.thesis`, coloring the `{noise}` / `{signal}` markers in the
 * unresolved / resolved tokens. The one place on the site that carries the
 * whole concept, so it's a shared component rather than copy duplicated
 * per-page.
 */
export function Thesis({ className }: ThesisProps) {
  const parts = site.thesis.split(/(\{noise\}|\{signal\})/g)

  return (
    <span className={cn(className)}>
      {parts.map((part, i) => {
        if (part === '{noise}') {
          return (
            <span key={i} className="text-accent" style={{ color: 'var(--color-static)' }}>
              noise
            </span>
          )
        }
        if (part === '{signal}') {
          return (
            <span key={i} className="text-accent" style={{ color: 'var(--color-signal)' }}>
              signal
            </span>
          )
        }
        return part
      })}
    </span>
  )
}
