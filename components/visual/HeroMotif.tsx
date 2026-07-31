/**
 * A static, CSS-only dot field standing in for the WebGL "Resolve Field"
 * scene (Phase 5). Purely decorative — every piece of meaning the eventual
 * scene conveys also exists as text in the hero copy, so this is aria-hidden
 * and safe to swap out with zero layout impact later.
 */
export function HeroMotif() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        opacity: 0.55,
        backgroundImage: 'radial-gradient(circle at center, var(--color-static) 1.5px, transparent 1.5px)',
        backgroundSize: '26px 26px',
        maskImage: 'radial-gradient(ellipse 75% 85% at 72% 45%, black, transparent)',
        WebkitMaskImage: 'radial-gradient(ellipse 75% 85% at 72% 45%, black, transparent)',
      }}
    />
  )
}
