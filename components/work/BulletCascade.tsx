'use client'

import { useInView } from '@/hooks/useInView'

interface BulletCascadeProps {
  bullets: string[]
}

function Tile({ bullet }: { bullet: string }) {
  const { ref, inView } = useInView<HTMLLIElement>({ threshold: 0.4, once: false })

  return (
    <li
      ref={ref}
      className="tile border-l-2 border-[var(--color-signal)] bg-[var(--color-surface)] px-5 py-4"
      data-visible={inView}
    >
      <p className="text-body text-[var(--color-text-secondary)]">{bullet}</p>
    </li>
  )
}

/**
 * The project's real resume bullets, replacing the old fabricated
 * architecture diagram. Each tile has its OWN IntersectionObserver (not one
 * shared trigger for the list) — the reveal is driven by actually scrolling
 * to each bullet, not a synthetic time-based stagger. `once: false` matches
 * the same replay-on-scroll-back convention components/primitives/Resolve.tsx
 * already uses elsewhere on this site. Generous vertical spacing between
 * tiles is what makes this read as "one at a time" rather than a short list
 * that all enters the viewport together — tune by eye once it's live.
 */
export function BulletCascade({ bullets }: BulletCascadeProps) {
  return (
    <ul className="flex flex-col gap-10 sm:gap-16">
      {bullets.map((bullet) => (
        <Tile key={bullet} bullet={bullet} />
      ))}
    </ul>
  )
}
