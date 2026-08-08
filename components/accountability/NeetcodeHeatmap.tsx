'use client'

import { useEffect, useRef } from 'react'
import { buildWeekGrid, LEVEL_OPACITY, levelForCount } from '@/lib/calendarHeatmap'
import neetcode from '@/data/neetcode-heatmap.json'

const DAY_ROW_LABEL: Record<number, string> = { 1: 'Mon', 3: 'Wed', 5: 'Fri' }
const WEEKS = 53
const CELL = 11
const GAP = 3
const ROW_LABEL_WIDTH = 24
const ROW_LABEL_MARGIN = 4 // mr-1 on the day-row-label column below
// Week 0's cells sit to the right of the day-row-label column (width + its
// margin + the flex gap to the first week), but the month-label row above
// has no such column — without this offset, month labels render ~2 columns
// left of the data they're supposed to sit over (July's label over August's
// cells, etc).
const ROW_LABEL_OFFSET = ROW_LABEL_WIDTH + ROW_LABEL_MARGIN + GAP

/**
 * NeetCode's own progress-page heatmap layout, recolored onto this site's
 * tokens — see .activity-card in globals.css. activityByDate is a manually
 * refreshed snapshot (data/neetcode-heatmap.json) rather than a live fetch:
 * NeetCode has no public API, and scraping a logged-in session isn't stable
 * enough to automate (session cookies expire hourly and the page only
 * renders the data once actually logged in and hard-reloaded).
 */
export function NeetcodeHeatmap() {
  const { weeks, monthLabels } = buildWeekGrid(neetcode.activityByDate, WEEKS)
  const activeDays = Object.values(neetcode.activityByDate).filter((c) => c > 0).length
  const colWidth = CELL + GAP
  const scrollRef = useRef<HTMLDivElement>(null)

  // The grid is wider than a mobile viewport, so overflow-x-auto starts
  // scrolled to its default (leftmost = oldest weeks) — on a 53-week grid
  // most of that early range has no data yet, so mobile users landed on a
  // blank-looking widget unless they scrolled right themselves. Anchor to
  // the most recent weeks on mount instead, matching GitHub's own mobile
  // behavior for its contribution calendar.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [])

  return (
    <div className="activity-card p-6">
      <div className="text-body flex flex-wrap gap-x-8 gap-y-2">
        <span>
          Active days <span className="text-[var(--color-text-dim)]">{activeDays}</span>
        </span>
        <span>
          Current streak <span className="text-[var(--color-text-dim)]">{neetcode.currentStreak} days</span>
        </span>
        <span>
          Max streak <span className="text-[var(--color-text-dim)]">{neetcode.maxStreak} days</span>
        </span>
      </div>

      <div ref={scrollRef} className="mt-4 overflow-x-auto">
        <div style={{ width: weeks.length * colWidth, minWidth: weeks.length * colWidth }}>
          <div className="relative h-4" style={{ width: weeks.length * colWidth + ROW_LABEL_OFFSET }}>
            {monthLabels.map(({ weekIndex, label }) => (
              <span
                key={`${weekIndex}-${label}`}
                className="text-label absolute top-0 text-[var(--color-text-dim)]"
                style={{ left: ROW_LABEL_OFFSET + weekIndex * colWidth }}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex" style={{ gap: GAP }}>
            <div className="relative mr-1" style={{ width: ROW_LABEL_WIDTH }}>
              {[1, 3, 5].map((row) => (
                <span
                  key={row}
                  className="text-label absolute text-[var(--color-text-dim)]"
                  style={{ top: row * (CELL + GAP) }}
                >
                  {DAY_ROW_LABEL[row]}
                </span>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col" style={{ gap: GAP }}>
                {week.days.map((day, di) => {
                  if (day === null) return <div key={di} style={{ width: CELL, height: CELL }} />
                  const level = levelForCount(day.count)
                  return (
                    <div
                      key={di}
                      className="rounded-[2px]"
                      style={{
                        width: CELL,
                        height: CELL,
                        backgroundColor: level === 0 ? 'var(--color-fill)' : 'var(--color-signal)',
                        opacity: LEVEL_OPACITY[level],
                      }}
                      title={`${day.count} on ${day.date}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-caption mt-4 flex flex-wrap items-center justify-between gap-2 text-[var(--color-text-dim)]">
        <span>
          {neetcode.totalSolvedOrSubmissions} total submissions · last updated {neetcode.lastUpdated}
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
