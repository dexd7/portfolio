import type { ContributionDay } from '@/lib/github'

const DAY_LABEL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Opacity steps mirroring GitHub's own 5-level "Less → More" legend. */
function levelFor(count: number, max: number): number {
  if (count === 0) return 0
  if (max === 0) return 0
  const ratio = count / max
  if (ratio > 0.75) return 1
  if (ratio > 0.5) return 0.8
  if (ratio > 0.25) return 0.6
  return 0.4
}

interface ContributionStripProps {
  days: ContributionDay[]
}

/**
 * A 7-tile row, not GitHub's full year grid — this page tracks the last
 * week's activity specifically, so it deliberately doesn't try to look like
 * the calendar on github.com.
 */
export function ContributionStrip({ days }: ContributionStripProps) {
  const max = Math.max(...days.map((d) => d.count), 1)
  const total = days.reduce((sum, d) => sum + d.count, 0)

  return (
    <div>
      <div className="flex gap-3">
        {days.map((day) => {
          const level = levelFor(day.count, max)
          const date = new Date(`${day.date}T00:00:00`)
          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-label text-[var(--color-text-dim)]">{DAY_LABEL[date.getDay()]}</span>
              <div
                className="aspect-square w-full rounded-[var(--radius-soft)] border border-[var(--color-border)]"
                style={{
                  backgroundColor: level === 0 ? 'transparent' : 'var(--color-signal)',
                  opacity: level === 0 ? 1 : level,
                }}
                aria-hidden="true"
              />
              <span className="text-caption text-[var(--color-text-dim)]">{day.count}</span>
            </div>
          )
        })}
      </div>
      <p className="text-caption mt-6 text-[var(--color-text-dim)]">
        <span className="text-[var(--color-text)]">{total}</span> contributions in the last {days.length} days
      </p>
    </div>
  )
}
