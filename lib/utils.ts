/** Joins class names, skipping falsy values. Deliberately dependency-free. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

/** `1` -> `"01"`. Used for the index numeral on projects and section markers. */
export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}
