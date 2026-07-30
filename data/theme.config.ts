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
    ink950: '#0A0B0D', // canvas
    ink900: '#101215', // elevated surface
    ink800: '#16191D', // subtle fill
    ink700: '#21262C', // hairline / border
    ink500: '#565E67', // decorative marks only — never text (4.1:1, fails AA)
    ink400: '#7C858F', // muted text — 5.3:1```
    ink200: '#A8B0B8', // secondary text — 9.0:1
    ink050: '#E8EBED', // primary text — 16.4:1 (never pure white: OLED halation)
    signal: '#FFB020', // the accent — 10.8:1
    static: '#5B6672', // the "unresolved" state
  },
  light: {
    ink950: '#F4F2ED', // canvas — warm paper, not white
    ink900: '#EAE7DF',
    ink800: '#DDD9CF',
    ink700: '#C7C2B5',
    ink500: '#8B8578',
    ink400: '#5C574C',
    ink200: '#3A362E',
    ink050: '#161410',
    signal: '#8A5200', // darkened for text — 5.7:1 (bright #FFB020 is 3.8:1, fails)
    static: '#8B8578',
  },
} as const

export const type = {
  display: {
    family: 'Switzer',
    fallback:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  mono: {
    family: 'Geist Mono',
    fallback: 'ui-monospace, "SF Mono", Menlo, monospace',
  },
  scale: {
    displayXl: { size: 'clamp(3.5rem, 11vw, 10rem)', tracking: '-0.04em', lh: '0.92' },
    displayL: { size: 'clamp(2.5rem, 6vw, 5rem)', tracking: '-0.03em', lh: '1.00' },
    h2: { size: 'clamp(1.75rem, 3vw, 2.75rem)', tracking: '-0.02em', lh: '1.10' },
    h3: { size: '1.25rem', tracking: '-0.01em', lh: '1.30' },
    bodyL: { size: '1.125rem', tracking: '0', lh: '1.60' },
    body: { size: '1rem', tracking: '0', lh: '1.65' },
    label: { size: '0.6875rem', tracking: '0.14em', lh: '1.20' },
    caption: { size: '0.75rem', tracking: '0.02em', lh: '1.40' },
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
