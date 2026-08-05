import type { Metric } from '@/data/schema'
import { Resolve } from '@/components/primitives/Resolve'
import { Counter } from '@/components/primitives/Counter'

interface MetricsGridProps {
  metrics: Metric[]
}

/** The project metrics grid — extracted from the old /work/[slug] case-study page so it's reusable inside WorkRow's accordion panel. */
export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
      {metrics.map((metric, i) => (
        <Resolve key={metric.id} index={i}>
          <div className="border-t border-[var(--color-border)] pt-6">
            <p className="text-display-l tabular-nums">
              {metric.count ? <Counter to={metric.count.to} suffix={metric.count.suffix} /> : metric.value}
            </p>
            <p className="text-body mt-2">{metric.label}</p>
            <p className="text-caption mt-1 text-[var(--color-text-dim)]">{metric.context}</p>
          </div>
        </Resolve>
      ))}
    </div>
  )
}
