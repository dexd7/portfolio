'use client'

import { useEffect, useState } from 'react'
import { useInView } from '@/hooks/useInView'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

interface ScrambleProps {
  text: string
  className?: string
  /** ms between glyph ticks. */
  tickMs?: number
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
}

/**
 * Mono text that decodes from random glyphs once, on view. Intended for
 * short labels (index numerals, eyebrows) — long strings just look noisy and
 * take too long to resolve.
 *
 * Accessibility: the animated glyphs are aria-hidden; the real string lives
 * in a visually-hidden sibling span, so screen readers never read gibberish
 * mid-decode.
 */
export function Scramble({ text, className, tickMs = 28 }: ScrambleProps) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.25, once: true })
  const reducedMotion = useReducedMotion()
  const [display, setDisplay] = useState(text)

  if (process.env.NODE_ENV !== 'production' && text.length > 24) {
    console.warn(`<Scramble> text exceeds the 24-character guideline: "${text}"`)
  }

  useEffect(() => {
    if (!inView) return
    if (reducedMotion) {
      setDisplay(text)
      return
    }

    let frame = 0
    const revealEvery = 2 // characters revealed per tick, roughly
    const interval = setInterval(() => {
      frame += revealEvery
      setDisplay(
        text
          .split('')
          .map((ch, i) => (ch === ' ' ? ' ' : i < frame ? ch : randomGlyph()))
          .join(''),
      )
      if (frame >= text.length) {
        clearInterval(interval)
        setDisplay(text)
      }
    }, tickMs)

    return () => clearInterval(interval)
  }, [inView, reducedMotion, text, tickMs])

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{text}</span>
    </span>
  )
}
