'use client'

import { motion, type Variants } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface BulletCascadeProps {
  bullets: string[]
}

// A NEGATIVE margin (an actual overlap) was tried and reverted: bullets wrap
// to 1-2 lines depending on length, so a fixed overlap covers the second
// line of any longer bullet sitting under a shorter one — a real legibility
// bug, not a style tradeoff.
const GAP_PX = 14
const SLIDE_PX = 56

const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
}

const tileVariants = (fromRight: boolean): Variants => ({
  hidden: { opacity: 0, x: fromRight ? SLIDE_PX : -SLIDE_PX },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.52, ease: [0.16, 1, 0.3, 1] },
  },
})

/**
 * The project's real resume bullets, inside `ProjectModal`. Since the modal
 * only mounts this while open (see `AnimatePresence` there), the stagger
 * below just plays on mount — no scroll-lock, no IntersectionObserver, no
 * manual scroll math (all three were tried in earlier versions of this
 * component; the modal made every one of them unnecessary by decoupling
 * this from page scroll entirely). Alternating left/right entry per bullet
 * is the "zig-zag" — no per-tile rotation, which used to read as a
 * rendering glitch rather than a design choice.
 */
export function BulletCascade({ bullets }: BulletCascadeProps) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return (
      <ul className="flex flex-col">
        {bullets.map((bullet, index) => (
          <li
            key={bullet}
            className="tile border-l-2 border-[var(--color-signal)] bg-[var(--color-fill)] px-5 py-4"
            style={{ marginTop: index === 0 ? 0 : GAP_PX }}
          >
            <p className="text-body text-[var(--color-text-secondary)]">{bullet}</p>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <motion.ul className="flex flex-col" initial="hidden" animate="visible" variants={listVariants}>
      {bullets.map((bullet, index) => (
        <motion.li
          key={bullet}
          variants={tileVariants(index % 2 === 1)}
          className="tile border-l-2 border-[var(--color-signal)] bg-[var(--color-fill)] px-5 py-4"
          style={{ marginTop: index === 0 ? 0 : GAP_PX }}
        >
          <p className="text-body text-[var(--color-text-secondary)]">{bullet}</p>
        </motion.li>
      ))}
    </motion.ul>
  )
}
