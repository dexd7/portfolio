'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { site } from '@/data/site.config'
import { cn } from '@/lib/utils'

/**
 * 56px top bar. Hides on scroll-down, reveals on scroll-up. No desktop
 * hamburger — nav items are always visible ≥768px; below that, a full-height
 * sheet. Deliberately rejects hidden/gestural navigation (see plan §18.2):
 * a recruiter should never have to guess where things are.
 */
export function Nav() {
  const [hidden, setHidden] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    lastY.current = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      const goingDown = y > lastY.current
      setHidden(goingDown && y > 96)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [sheetOpen])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b border-[var(--color-border)] backdrop-blur transition-transform duration-[240ms]',
        )}
        style={{
          height: '56px',
          backgroundColor: 'color-mix(in srgb, var(--color-canvas) 80%, transparent)',
          transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
        }}
      >
        <div className="mx-auto flex h-full max-w-[var(--container-max)] items-center justify-between px-6 md:px-8">
          <Link href="/" className="text-label" aria-label={`${site.name} — home`}>
            {site.initials}
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
            {site.nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-label text-[var(--color-text-secondary)] hover:text-[var(--color-signal)]">
                {item.label}
              </Link>
            ))}
            <span className="flex items-center gap-2 text-label text-[var(--color-text-dim)]">
              <span
                aria-hidden="true"
                className={cn('h-1.5 w-1.5 rounded-full', site.availability.available && 'animate-pulse')}
                style={{ backgroundColor: site.availability.available ? 'var(--color-signal)' : 'var(--color-muted)' }}
              />
              {site.availability.label}
            </span>
          </nav>

          <button
            type="button"
            className="text-label md:hidden"
            aria-expanded={sheetOpen}
            aria-controls="mobile-nav-sheet"
            onClick={() => setSheetOpen((v) => !v)}
          >
            {sheetOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </header>

      <div
        id="mobile-nav-sheet"
        className={cn(
          'fixed inset-0 z-40 flex flex-col items-start justify-center gap-8 bg-[var(--color-canvas)] px-8 transition-opacity md:hidden',
          sheetOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        style={{ transitionDuration: '260ms' }}
        aria-hidden={!sheetOpen}
      >
        {site.nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-display-l"
            onClick={() => setSheetOpen(false)}
            tabIndex={sheetOpen ? 0 : -1}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </>
  )
}
