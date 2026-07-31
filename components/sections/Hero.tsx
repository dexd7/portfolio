import { site } from '@/data/site.config'
import { Container } from '@/components/layout/Container'
import { Resolve } from '@/components/primitives/Resolve'
import { Magnetic } from '@/components/primitives/Magnetic'
import { Button } from '@/components/ui/Button'
import { Thesis } from '@/components/ui/Thesis'
import { HeroMotif } from '@/components/visual/HeroMotif'

/**
 * Movement 00. Static poster today (HeroMotif) — Phase 5 swaps this exact
 * slot for the WebGL "Resolve Field" scene behind a next/dynamic import,
 * with this same decorative, aria-hidden contract.
 */
export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden"
      style={{ paddingBottom: 'clamp(4rem, 12vh, 8rem)' }}
    >
      <HeroMotif />
      <Container wide className="relative z-10">
        <Resolve>
          <p className="text-label text-[var(--color-text-dim)] mb-6">FULL-STACK · SYSTEMS · DATA &amp; AI</p>
        </Resolve>

        <Resolve index={1}>
          <h1 className="text-display-xl">{site.name}</h1>
        </Resolve>

        <Resolve index={2}>
          <p className="text-display-l mt-4 max-w-3xl">
            <Thesis />
          </p>
        </Resolve>

        <Resolve index={3}>
          <p className="text-body-l mt-6 max-w-xl text-[var(--color-text-secondary)]">{site.intro}</p>
        </Resolve>

        <Resolve index={4}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic>
              <Button href="/work">Work</Button>
            </Magnetic>
            <Button href="/about" variant="ghost">
              About
            </Button>
            <Button href={site.resume.path} variant="ghost">
              Résumé ↓
            </Button>
          </div>
        </Resolve>

        <Resolve index={5}>
          <p className="mt-8 flex items-center gap-2 text-label text-[var(--color-text-dim)]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: site.availability.available ? 'var(--color-signal)' : 'var(--color-muted)' }}
            />
            {site.availability.label}
          </p>
        </Resolve>
      </Container>
    </section>
  )
}
