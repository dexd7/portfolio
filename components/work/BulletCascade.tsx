interface BulletCascadeProps {
  bullets: string[]
}

// A NEGATIVE margin (an actual overlap) was tried and reverted: bullets wrap
// to 1-2 lines depending on length, so a fixed overlap covers the second
// line of any longer bullet sitting under a shorter one — a real legibility
// bug, not a style tradeoff.
const GAP_PX = 14

/**
 * The project's real resume bullets, inside the accordion panel. No
 * animation of its own — it's part of whatever reveals the panel around it
 * (see WorkRow's `Resolve` wrapper). Several standalone versions of this
 * component were tried (an IntersectionObserver stagger, a scroll-position
 * pin, a wheel-gated scroll-driven cascade) and all were removed in favor
 * of one clean reveal on the panel as a whole.
 */
export function BulletCascade({ bullets }: BulletCascadeProps) {
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
