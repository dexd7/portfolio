import type { ContributionDay } from '@/lib/github'
import { LEVEL_OPACITY, levelForCount } from '@/lib/calendarHeatmap'

const DAY_LABEL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface ContributionStripProps {
  days: ContributionDay[]
}

/** GitHub's own contribution-calendar layout, a 7-day-wide slice of it, recolored onto this site's tokens — see .activity-card in globals.css. */
export function ContributionStrip({ days }: ContributionStripProps) {
  const total = days.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="activity-card p-6">
      <div className="flex gap-[3px] sm:gap-1">
        {days.map((day) => {
          const date = new Date(`${day.date}T00:00:00`)
          const level = levelForCount(day.count)
          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-label text-[var(--color-text-dim)]">{DAY_LABEL[date.getDay()]}</span>
              <div
                className="aspect-square w-full rounded-[2px]"
                style={{ backgroundColor: level === 0 ? 'var(--color-fill)' : 'var(--color-signal)', opacity: LEVEL_OPACITY[level] }}
                title={`${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`}
              />
            </div>
          )
        })}
      </div>

      <div className="text-caption mt-4 flex flex-wrap items-center justify-between gap-2 text-[var(--color-text-dim)]">
        <span>
          {total} contribution{total === 1 ? '' : 's'} in the last {days.length} days
        </span>
        <span className="flex items-center gap-1">
          Less
          {LEVEL_OPACITY.map((opacity, i) => (
            <span
              key={i}
              className="h-[10px] w-[10px] rounded-[2px]"
              style={{ backgroundColor: i === 0 ? 'var(--color-fill)' : 'var(--color-signal)', opacity }}
            />
          ))}
          More
        </span>
      </div>
    </div>
  )
}
