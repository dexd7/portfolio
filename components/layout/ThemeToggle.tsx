'use client'

import { useEffect, useState } from 'react'
import { THEME_STORAGE_KEY, THEME_CHANGE_EVENT, type Theme } from '@/lib/theme'
import { cn } from '@/lib/utils'

/**
 * Sun/moon toggle, top-left beside the logo. `theme` starts 'light' on the
 * server (SSR has no localStorage) but the layout's inline init script has
 * already set the real value on `<html>` before this hydrates, so the
 * `useEffect` below reconciles state to match on mount without a visible
 * flash — the same script also means the *page* never rendered the wrong
 * palette in the first place, this is just getting the button's own state
 * in sync. A click is a discrete, low-frequency event, not the
 * scroll/pointer-listener pattern this project avoids setState for.
 */
export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    setThemeState(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
  }, [])

  const setTheme = (next: Theme) => {
    document.documentElement.dataset.theme = next
    localStorage.setItem(THEME_STORAGE_KEY, next)
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: next }))
    setThemeState(next)
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Theme">
      <button
        type="button"
        aria-label="Switch to light theme"
        aria-pressed={theme === 'light'}
        onClick={() => setTheme('light')}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
          theme === 'light' ? 'text-[var(--color-signal)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-secondary)]',
        )}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" />
          <path
            strokeLinecap="round"
            d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8L6 18M18 6l1.8-1.8"
          />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Switch to dark theme"
        aria-pressed={theme === 'dark'}
        onClick={() => setTheme('dark')}
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
          theme === 'dark' ? 'text-[var(--color-signal)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text-secondary)]',
        )}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.5 14.7A8.5 8.5 0 0 1 9.3 3.5a8.5 8.5 0 1 0 11.2 11.2Z" />
        </svg>
      </button>
    </div>
  )
}
