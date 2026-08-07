export interface HeatmapDay {
  date: string
  count: number
}

export interface HeatmapWeek {
  days: (HeatmapDay | null)[]
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** GitHub's own dark-theme contribution scale — reused for the NeetCode grid too since it's the de facto convention for this kind of widget. */
export const LEVEL_COLOR = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']

export function levelForCount(count: number): number {
  if (count <= 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 10) return 3
  return 4
}

/**
 * A GitHub-style week grid (Sun-start columns) ending on the current week,
 * going back `weeks` weeks. Days beyond today are left null so the grid
 * doesn't render future squares. Month labels mark the week column where
 * each new month's first few days land, matching GitHub's own placement.
 */
export function buildWeekGrid(
  counts: Record<string, number>,
  weeks: number,
): { weeks: HeatmapWeek[]; monthLabels: { weekIndex: number; label: string }[] } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const end = new Date(today)
  end.setDate(end.getDate() + (6 - end.getDay()))

  const start = new Date(end)
  start.setDate(start.getDate() - (weeks * 7 - 1))

  const gridWeeks: HeatmapWeek[] = []
  const monthLabels: { weekIndex: number; label: string }[] = []
  let lastMonth = -1

  const cursor = new Date(start)
  for (let w = 0; w < weeks; w++) {
    const days: (HeatmapDay | null)[] = []
    for (let d = 0; d < 7; d++) {
      if (cursor > today) {
        days.push(null)
      } else {
        const month = cursor.getMonth()
        if (month !== lastMonth && cursor.getDate() <= 7) {
          monthLabels.push({ weekIndex: w, label: MONTHS[month]! })
          lastMonth = month
        }
        const iso = cursor.toISOString().slice(0, 10)
        days.push({ date: iso, count: counts[iso] ?? 0 })
      }
      cursor.setDate(cursor.getDate() + 1)
    }
    gridWeeks.push({ days })
  }

  return { weeks: gridWeeks, monthLabels }
}
