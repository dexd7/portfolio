/** Joins class names, skipping falsy values. Deliberately dependency-free. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

/** `1` -> `"01"`. Used for the index numeral on projects and section markers. */
export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** `"2025-05"` -> `"May 2025"`; the literal `"present"` -> `"Present"`. */
function formatMonth(yearMonth: string): string {
  if (yearMonth === 'present') return 'Present'
  const [year, month] = yearMonth.split('-')
  return `${MONTHS[Number(month) - 1]} ${year}`
}

/** `("2025-05", "2025-11")` -> `"May 2025 – Nov 2025"`. */
export function formatMonthRange(start: string, end: string): string {
  return `${formatMonth(start)} – ${formatMonth(end)}`
}

/**
 * For education dates, which schema.ts allows as either `"YYYY"` or
 * `"YYYY-MM"` (see EducationSchema) — year-only entries render as just the
 * year rather than being coerced into a specific, unstated month.
 */
export function formatEduRange(start: string, end: string): string {
  const fmt = (value: string) => (/^\d{4}-\d{2}$/.test(value) ? formatMonth(value) : value)
  return `${fmt(start)} – ${fmt(end)}`
}
