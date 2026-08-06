/**
 * A static, CSS-only dot field standing in for the WebGL "Resolve Field"
 * scene — the reduced-motion/Save-Data fallback. Purely decorative — every
 * piece of meaning the WebGL scene conveys also exists as real page
 * content, so this is aria-hidden and safe. Renders full-viewport (inside
 * ResolveField.tsx's fixed wrapper) sitting behind body copy, so it's kept
 * faint and full-bleed rather than the tighter, more opaque vignette this
 * had when it stood in for a hero-scale centerpiece.
 */
export function HeroMotif() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        opacity: 0.25,
        backgroundImage: 'radial-gradient(circle at center, var(--color-static) 1.5px, transparent 1.5px)',
        backgroundSize: '26px 26px',
        maskImage: 'radial-gradient(ellipse 120% 120% at 50% 40%, black, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 120% 120% at 50% 40%, black, transparent 100%)',
      }}
    />
  )
}
