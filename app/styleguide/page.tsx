import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { Resolve } from '@/components/primitives/Resolve'
import { Scramble } from '@/components/primitives/Scramble'
import { Counter } from '@/components/primitives/Counter'
import { Hairline } from '@/components/primitives/Hairline'
import { Magnetic } from '@/components/primitives/Magnetic'
import { CursorField } from '@/components/primitives/CursorField'

const colorTokens = [
  ['ink-950', 'canvas'],
  ['ink-900', 'surface'],
  ['ink-800', 'fill'],
  ['ink-700', 'border'],
  ['ink-500', 'muted — decorative only'],
  ['ink-400', 'text-dim'],
  ['ink-200', 'text-secondary'],
  ['ink-050', 'text'],
  ['signal', 'the accent'],
  ['static', 'unresolved state'],
] as const

const typeTokens = [
  ['text-display-xl', 'Display XL'],
  ['text-display-l', 'Display L'],
  ['text-h2', 'Heading 2'],
  ['text-h3', 'Heading 3'],
  ['text-body-l', 'Body Large'],
  ['text-body', 'Body'],
  ['text-label', 'Label'],
  ['text-caption', 'Caption'],
] as const

/**
 * Not a route the site links to publicly — a working reference for every
 * design token and motion primitive, so new UI is built from this vocabulary
 * instead of one-off values.
 */
export default function StyleguidePage() {
  return (
    <main id="main" style={{ paddingTop: '56px' }}>
      <Section index={0} label="Colors">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {colorTokens.map(([token, desc]) => (
            <div key={token}>
              <div
                className="mb-2 h-16 w-full border border-[var(--color-border)]"
                style={{ backgroundColor: `var(--color-${token})` }}
              />
              <p className="text-caption">{token}</p>
              <p className="text-caption text-[var(--color-text-dim)]">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Hairline />

      <Section index={1} label="Typography">
        <div className="flex flex-col gap-6">
          {typeTokens.map(([cls, label]) => (
            <div key={cls}>
              <p className="text-caption text-[var(--color-text-dim)] mb-1">{label} — .{cls}</p>
              <p className={cls}>The quick brown fox turns noise into signal.</p>
            </div>
          ))}
        </div>
      </Section>

      <Hairline />

      <Section index={2} label="Buttons & chips">
        <div className="flex flex-wrap items-center gap-4">
          <Magnetic>
            <Button href="/work">View work</Button>
          </Magnetic>
          <Button href="/resume" variant="ghost">
            Résumé ↓
          </Button>
          <Chip>Python</Chip>
          <Chip>FastAPI</Chip>
          <Chip>React</Chip>
        </div>
      </Section>

      <Hairline />

      <Section index={3} label="Motion primitives">
        <div className="flex flex-col gap-12">
          <div>
            <p className="text-caption text-[var(--color-text-dim)] mb-2">Resolve — scroll into view</p>
            <div className="flex flex-col gap-2">
              <Resolve index={0}>
                <p className="text-h3">First line resolves first.</p>
              </Resolve>
              <Resolve index={1}>
                <p className="text-h3">Second line, 40ms later.</p>
              </Resolve>
              <Resolve index={2}>
                <p className="text-h3">Third, another 40ms.</p>
              </Resolve>
            </div>
          </div>

          <div>
            <p className="text-caption text-[var(--color-text-dim)] mb-2">Scramble — decodes once, on view</p>
            <Scramble text="NOISE → SIGNAL" className="text-h2" />
          </div>

          <div>
            <p className="text-caption text-[var(--color-text-dim)] mb-2">Counter — eased count-up</p>
            <p className="text-display-l tabular-nums">
              <Counter to={40} suffix="%" />
            </p>
          </div>

          <div>
            <p className="text-caption text-[var(--color-text-dim)] mb-2">CursorField — proximity brightening</p>
            <CursorField className="flex gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className="cursor-dot h-2 w-2 rounded-full"
                  style={{ backgroundColor: 'var(--color-signal)' }}
                />
              ))}
            </CursorField>
          </div>
        </div>
      </Section>
    </main>
  )
}
