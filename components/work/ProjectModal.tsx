'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  titleId: string
  children: ReactNode
}

/**
 * Replaces the old inline accordion panel (see git history on WorkRow/
 * BulletCascade) — that approach fought its container's `overflow: hidden`
 * every step of the way (blocked `position: sticky`, forced a `position:
 * fixed` + manual scroll-math workaround for the bullet cascade, and still
 * looked like it was fighting the surrounding page). A modal sidesteps all
 * of it: the panel is portaled to `document.body`, fully decoupled from
 * the row's layout, so its own entrance animation is the only motion in
 * play — no scroll-lock, no fixed-position recalculation.
 */
export function ProjectModal({ isOpen, onClose, titleId, children }: ProjectModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
        >
          <div
            className="absolute inset-0 bg-[var(--color-ink-950)]/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="relative flex max-h-[85dvh] w-full max-w-2xl flex-col border border-[var(--color-border)] bg-[var(--color-surface)] outline-none"
            style={{ borderRadius: 'var(--radius-soft)' }}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 text-[var(--color-text-dim)] transition-colors duration-[var(--duration-ui)] hover:text-[var(--color-signal)]"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2l14 14M16 2L2 16" strokeLinecap="round" />
              </svg>
            </button>
            {/* Scroll container is separate from the outer panel so the close
                button (absolutely positioned against the outer, non-scrolling
                box) never scrolls away with long content — min-h-0 is
                load-bearing here, same reasoning as .accordion-panel-inner. */}
            <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-10">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
