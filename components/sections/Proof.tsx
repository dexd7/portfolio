import { headlineMetrics } from '@/data/metrics'
import { Section } from '@/components/layout/Section'
import { Resolve } from '@/components/primitives/Resolve'
import { Counter } from '@/components/primitives/Counter'

/**
 * Movement 01. Credibility before narrative — a recruiter who bounces after
 * two viewports still leaves having seen these three numbers.
 */
export function Proof() {
  return (
    <Section id="proof" index={1} label="Proof">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
        {headlineMetrics.map((metric, i) => (
          <Resolve key={metric.id} index={i}>
            <div className="border-t border-[var(--color-border)] pt-6">
              <p className="text-display-l tabular-nums">
                {metric.count ? (
                  <Counter
                    to={metric.count.to}
                    prefix={metric.count.prefix}
                    suffix={metric.count.suffix}
                    decimals={metric.count.decimals}
                  />
                ) : (
                  metric.value
                )}
              </p>
              <p className="text-body mt-2">{metric.label}</p>
              <p className="text-caption mt-1 text-[var(--color-text-dim)]">{metric.context}</p>
            </div>
          </Resolve>
        ))}
      </div>
    </Section>
  )
}
