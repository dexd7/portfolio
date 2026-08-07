import { buildWeekGrid, LEVEL_COLOR, levelForCount } from '@/lib/calendarHeatmap'
import neetcode from '@/data/neetcode-heatmap.json'

const DAY_ROW_LABEL: Record<number, string> = { 1: 'Mon', 3: 'Wed', 5: 'Fri' }
const WEEKS = 53
const CELL = 11
const GAP = 3

/**
 * NeetCode's own progress-page heatmap — activityByDate is a manually
 * refreshed snapshot (data/neetcode-heatmap.json) rather than a live fetch:
 * NeetCode has no public API, and scraping a logged-in session isn't stable
 * enough to automate (session cookies expire hourly and the page only
 * renders the data once actually logged in and hard-reloaded).
 */
export function NeetcodeHeatmap() {
  const { weeks, monthLabels } = buildWeekGrid(neetcode.activityByDate, WEEKS)
  const activeDays = Object.values(neetcode.activityByDate).filter((c) => c > 0).length
  const colWidth = CELL + GAP

  return (
    <div className="activity-card p-6">
      <div className="flex flex-wrap gap-x-8 gap-y-2 text-[13px] text-[#e6edf3]">
        <span>
          Active days <span className="text-[#7d8590]">{activeDays}</span>
        </span>
        <span>
          Current streak <span className="text-[#7d8590]">{neetcode.currentStreak} days</span>
        </span>
        <span>
          Max streak <span className="text-[#7d8590]">{neetcode.maxStreak} days</span>
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div style={{ width: weeks.length * colWidth, minWidth: weeks.length * colWidth }}>
          <div className="relative h-4" style={{ width: weeks.length * colWidth }}>
            {monthLabels.map(({ weekIndex, label }) => (
              <span
                key={`${weekIndex}-${label}`}
                className="absolute top-0 text-[11px] text-[#7d8590]"
                style={{ left: weekIndex * colWidth }}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex" style={{ gap: GAP }}>
            <div className="relative mr-1" style={{ width: 24 }}>
              {[1, 3, 5].map((row) => (
                <span
                  key={row}
                  className="absolute text-[11px] text-[#7d8590]"
                  style={{ top: row * (CELL + GAP) }}
                >
                  {DAY_ROW_LABEL[row]}
                </span>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                {week.days.map((day, di) =>
                  day === null ? (
                    <div key={di} style={{ width: CELL, height: CELL }} />
                  ) : (
                    <div
                      key={di}
                      className="rounded-[2px]"
                      style={{ width: CELL, height: CELL, backgroundColor: LEVEL_COLOR[levelForCount(day.count)] }}
                      title={`${day.count} on ${day.date}`}
                    />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#7d8590]">
        <span>{neetcode.totalSolvedOrSubmissions} total solved · last updated {neetcode.lastUpdated}</span>
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
