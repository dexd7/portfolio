import { site } from '@/data/site.config'
import { Container } from '@/components/layout/Container'
import { Resolve } from '@/components/primitives/Resolve'
import { Magnetic } from '@/components/primitives/Magnetic'
import { Button } from '@/components/ui/Button'
import { Thesis } from '@/components/ui/Thesis'
import { ResolveField } from '@/components/visual/ResolveField'

/**
 * Movement 00. The particle field is the point — text stays small and
 * compact, a caption on top of the animation rather than competing with it
 * for the screen. ResolveField renders a static poster immediately and
 * swaps in the real WebGL scene once idle, unless reduced-motion/save-data
 * apply, in which case the poster is permanent.
 */
export function Hero() {
  return (
    <section id="hero" className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
      <ResolveField />
      <Container wide className="relative z-10 pb-12 sm:pb-16">
        <div className="max-w-md">
          <Resolve>
            <p className="text-label text-[var(--color-text-dim)] mb-3">FULL-STACK · SYSTEMS · DATA &amp; AI</p>
          </Resolve>

          <Resolve index={1}>
            <h1 className="text-h2">{site.name}</h1>
          </Resolve>

          <Resolve index={2}>
            <p className="text-h3 mt-2">
              <Thesis />
            </p>
          </Resolve>

          <Resolve index={3}>
            <p className="text-caption mt-3 text-[var(--color-text-secondary)]">{site.intro}</p>
          </Resolve>

          <Resolve index={4}>
            <div className="mt-6 flex flex-wrap items-center gap-3">
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
            <p className="mt-5 flex items-center gap-2 text-label text-[var(--color-text-dim)]">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: site.availability.available ? 'var(--color-signal)' : 'var(--color-muted)' }}
              />
              {site.availability.label}
            </p>
          </Resolve>
        </div>
      </Container>
    </section>
  )
}
