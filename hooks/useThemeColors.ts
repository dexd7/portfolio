'use client'

import { useEffect, useState } from 'react'
import { colors } from '@/data/theme.config'
import { THEME_CHANGE_EVENT, type Theme } from '@/lib/theme'

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

/**
 * The WebGL background's colors need to react to the light/dark toggle, not
 * stay hardcoded to one palette. Reads straight from `colors.light`/`dark`
 * in theme.config.ts (the source of truth the generated CSS is itself
 * derived from) rather than round-tripping through `getComputedStyle` string
 * parsing. Theme changes are rare, discrete events — plain useState here is
 * fine, this isn't the high-frequency scroll/pointer-listener pattern this
 * project avoids setState for.
 */
export function useThemeColors() {
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    setTheme(readTheme())
    const onChange = () => setTheme(readTheme())
    // Fires in the same tab that clicked the toggle.
    window.addEventListener(THEME_CHANGE_EVENT, onChange)
    // Fires in *other* open tabs when localStorage changes — storage events
    // never fire in the originating tab, so this is a complement, not a
    // duplicate, of the listener above.
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [])

  const palette = colors[theme]
  return { colorStatic: palette.static, colorSignal: palette.signal, colorBackground: palette.ink950 }
}
