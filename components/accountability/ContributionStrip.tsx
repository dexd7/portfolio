import type { ContributionDay } from '@/lib/github'
import { LEVEL_COLOR, levelForCount } from '@/lib/calendarHeatmap'

const DAY_LABEL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface ContributionStripProps {
  days: ContributionDay[]
}

/** GitHub's own contribution-calendar square/color language, just a 7-day-wide slice of it instead of the full year grid. */
export function ContributionStrip({ days }: ContributionStripProps) {
  const total = days.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="activity-card p-6">
      <div className="flex gap-[3px] sm:gap-1">
        {days.map((day) => {
          const date = new Date(`${day.date}T00:00:00`)
          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[11px] text-[#7d8590]">{DAY_LABEL[date.getDay()]}</span>
              <div
                className="aspect-square w-full rounded-[2px]"
                style={{ backgroundColor: LEVEL_COLOR[levelForCount(day.count)] }}
                title={`${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`}
              />
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#7d8590]">
        <span>
          {total} contribution{total === 1 ? '' : 's'} in the last {days.length} days
        </span>
        <span className="flex items-center gap-1">
          Less
          {LEVEL_COLOR.map((color) => (
            <span key={color} className="h-[10px] w-[10px] rounded-[2px]" style={{ backgroundColor: color }} />
          ))}
          More
        </span>
      </div>
    </div>
  )
}
