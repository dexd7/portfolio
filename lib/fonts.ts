import localFont from 'next/font/local'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

/**
 * Four-font system, self-hosted:
 *  - Bebas Neue                    display headlines (public/fonts, OFL — see LICENSES.md)
 *  - Fivo Sans Modern Heavy Oblique accent only — the {noise}/{signal} thesis words (OFL)
 *  - Geist Sans                    body copy, nav, UI text (via the `geist` package)
 *  - Geist Mono                    labels, indices, metrics, code (via the `geist` package)
 *
 * Each exposes a CSS custom property (`--font-bebas`, `--font-fivo`,
 * `--font-geist-sans`, `--font-geist-mono`) that globals.css composes with
 * the fallback stacks defined in data/theme.config.ts.
 */
export const bebasNeue = localFont({
  src: '../public/fonts/BebasNeue-Regular.woff2',
  variable: '--font-bebas',
  weight: '400',
  display: 'swap',
})

export const fivoSansModern = localFont({
  src: '../public/fonts/FivoSansModern-HeavyOblique.woff2',
  variable: '--font-fivo',
  weight: '800',
  style: 'italic',
  display: 'swap',
})

export const geistSans = GeistSans
export const geistMono = GeistMono

export const fontVariables = `${bebasNeue.variable} ${fivoSansModern.variable} ${geistSans.variable} ${geistMono.variable}`
