/**
 * Single source of truth for color, type, and motion tokens.
 *
 * `scripts/generate-tokens.ts` reads this file and emits
 * `app/generated-tokens.css` at build/dev time — so changing `--signal` here
 * propagates to every component, the OG image renderer, and (via a uniform)
 * the WebGL hero, all from one edit.
 */

export const colors = {
  dark: {
    // Dark navy, not neutral charcoal — same ladder logic as before
    // (each tier a step lighter than the last), re-verified against the
    // new #0A0E16 canvas.
    ink950: '#0A0E16', // canvas
    ink900: '#0F1520', // elevated surface
    ink800: '#161F2E', // subtle fill
    ink700: '#20293B', // hairline / border
    ink500: '#4C5C74', // decorative marks only — never text (2.8:1, fails AA)
    ink400: '#7C90AA', // muted text — 5.9:1
    ink200: '#AEBED2', // secondary text — 10.2:1
    ink050: '#E7EDF5', // primary text — 16.4:1 (never pure white: OLED halation)
    signal: '#22D3EE', // the accent — cyan, 10.7:1
    static: '#3A4F68', // the "unresolved" state — muted dark blue
  },
  light: {
    // Warm off-white/cream, now the site's default — replaces an earlier
    // cool-blue "light" palette that was never actually warm. Each pair
    // verified against the #F6F1E8 canvas via the WCAG relative-luminance
    // formula before committing to hex, same rigor as the dark palette.
    ink950: '#F6F1E8', // canvas — warm ivory, not stark white
    ink900: '#EDE4D3', // elevated surface
    ink800: '#E1D4BC', // subtle fill
    ink700: '#CBB896', // hairline / border
    ink500: '#A38F6E', // decorative marks only — never text (~2.6:1, fails AA)
    ink400: '#6B5B42', // muted text — 5.83:1
    ink200: '#3E3323', // secondary text — 10.96:1
    ink050: '#1C160D', // primary text — 15.95:1 (warm near-black, not pure black)
    signal: '#93381A', // terracotta accent — 6.62:1
    static: '#B7A88C', // the "unresolved" state — muted warm tan
  },
} as const

export const type = {
  // Bebas Neue: display headlines only (name, thesis, big section titles).
  // Condensed and all-caps by design — sized larger and tracked looser than
  // a normal-width grotesk would need, to keep it legible rather than
  // over-compressed.
  display: {
    family: 'Bebas Neue',
    fallback: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
  },
  // Fivo Sans Modern Heavy Oblique: a single heavy italic cut, reserved for
  // the {noise} / {signal} thesis words — an accent, never body copy.
  accent: {
    family: 'Fivo Sans Modern',
    fallback: '"Arial Black", sans-serif',
  },
  // Geist Sans: body copy, nav, UI — everywhere Bebas Neue would be
  // unreadable at length.
  body: {
    family: 'Geist Sans',
    fallback: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  mono: {
    family: 'Geist Mono',
    fallback: 'ui-monospace, "SF Mono", Menlo, monospace',
  },
  scale: {
    displayXl: { size: 'clamp(4.5rem, 14vw, 13rem)', tracking: '0.01em', lh: '0.90' },
    displayL: { size: 'clamp(3rem, 8vw, 6.5rem)', tracking: '0.01em', lh: '0.95' },
    h2: { size: 'clamp(2rem, 4vw, 3.25rem)', tracking: '0', lh: '1.05' },
    h3: { size: '1.5rem', tracking: '0', lh: '1.15' },
    bodyL: { size: '1.25rem', tracking: '0', lh: '1.60' },
    body: { size: '1.0625rem', tracking: '0', lh: '1.65' },
    label: { size: '0.75rem', tracking: '0.14em', lh: '1.20' },
    caption: { size: '0.8125rem', tracking: '0.02em', lh: '1.40' },
  },
} as const

export const motion = {
  easing: {
    resolve: 'cubic-bezier(0.16, 1, 0.3, 1)',
    settle: 'cubic-bezier(0.33, 1, 0.68, 1)',
    exit: 'cubic-bezier(0.7, 0, 0.84, 0)',
  },
  duration: {
    micro: 120,
    ui: 220,
    reveal: 520,
    scene: 900,
    heroScene: 1400,
  },
  stagger: 40,
  staggerCap: 8,
} as const

export const layout = {
  containerMax: 1440,
  contentMax: 1200,
  gutter: 24,
  baseline: 8,
  sectionRhythm: 'clamp(96px, 14vh, 200px)',
} as const

export const radius = {
  sharp: '0px',
  soft: '2px',
} as const
