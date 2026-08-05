/** Shared between the layout's no-flash init script, the toggle, and useThemeColors — keeps the storage key/event name from drifting apart as bare strings in multiple files. */
export const THEME_STORAGE_KEY = 'theme'
export const THEME_CHANGE_EVENT = 'theme-change'

export type Theme = 'light' | 'dark'
