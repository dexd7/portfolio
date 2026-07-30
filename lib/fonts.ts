import localFont from 'next/font/local'
import { GeistMono } from 'geist/font/mono'

/**
 * Switzer, self-hosted as a single variable woff2 (public/fonts). Geist Mono
 * comes from the `geist` package, itself a next/font export. Both expose a
 * CSS custom property (`--font-switzer`, `--font-geist-mono`) that
 * `globals.css` composes with the fallback stacks defined in
 * `data/theme.config.ts`.
 */
export const switzer = localFont({
  src: '../public/fonts/Switzer-Variable.woff2',
  variable: '--font-switzer',
  weight: '100 900',
  display: 'swap',
})

export const geistMono = GeistMono

export const fontVariables = `${switzer.variable} ${geistMono.variable}`
