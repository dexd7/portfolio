import type { Metadata } from 'next'
import { site } from '@/data/site.config'
import { education } from '@/data/education'
import { now } from '@/data/now'
import { Section } from '@/components/layout/Section'
import { Resolve } from '@/components/primitives/Resolve'
import { PortraitStage } from '@/components/about/PortraitStage'
import { Timeline } from '@/components/about/Timeline'
import { Signals } from '@/components/sections/Signals'
import { Contact } from '@/components/sections/Contact'
import { CrossHighlightProvider } from '@/components/sections/CrossHighlight'
import { Button } from '@/components/ui/Button'
import { formatEduRange } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'About',
  description: `About ${site.name} — ${site.role.toLowerCase()}, UW–Madison CS + Data Science.`,
}

export default function AboutPage() {
  return (
    <CrossHighlightProvider>
      <main id="main" style={{ paddingTop: '56px' }}>
        <Section wide>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_420px] lg:items-start">
            <div>
              <Resolve>
                <p className="text-label mb-4 text-[var(--color-text-dim)]">About</p>
              </Resolve>
              <Resolve index={1}>
                <h1 className="text-display-l max-w-2xl">Hi, I&apos;m {site.name}.</h1>
              </Resolve>

              <div className="mt-10 max-w-2xl space-y-7">
                <Resolve index={2}>
                  <p className="text-[1.3rem] leading-[1.65] text-[var(--color-text-secondary)]">
                    I got into programming by wanting to know what was underneath the tools I was already using — what
                    a shell actually does between typing a command and a process running, what Spark is doing
                    underneath a DataFrame call. That curiosity turned into two systems projects built from scratch in
                    C, and it's the same instinct that shows up in how I approach backend and data work: build it once
                    to actually understand it, not just to make it work.
                  </p>
                </Resolve>
                <Resolve index={3}>
                  <p className="text-[1.3rem] leading-[1.65] text-[var(--color-text-secondary)]">
                    I'm a full-stack engineer who's most comfortable moving between the two ends of a system — React
                    on one side, FastAPI and PostgreSQL on the other, with enough systems-level understanding
                    underneath to know why a pipeline is slow instead of just guessing. At Innover, that meant
                    building a synthetic data platform end to end; on my own time, it's meant building a Unix shell
                    and a Spark-inspired parallel framework down to their memory allocators.
                  </p>
                </Resolve>
                <Resolve index={4}>
                  <p className="text-[1.3rem] leading-[1.65] text-[var(--color-text-secondary)]">
                    I'm finishing my CS + Data Science degree at UW–Madison in May 2026, and looking for full-stack or
                    backend roles starting this year. Open to relocating.
                  </p>
                </Resolve>
              </div>

              <Resolve index={5}>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Button href={site.resume.path}>Résumé ↓</Button>
                  <Button href="/work" variant="ghost">
                    See the work
                  </Button>
                </div>
              </Resolve>
            </div>

            <Resolve index={1}>
              <PortraitStage src="/images/vihaan-portrait.jpg" alt={`${site.name}, UW–Madison, 2026`} />
            </Resolve>
          </div>
        </Section>

        <Section index={undefined} label="Experience" compact>
          <Timeline />
        </Section>

        <Section index={undefined} label="Education" compact>
          <div className="space-y-8">
            {education.map((entry) => (
              <div key={entry.id}>
                <p className="text-h3">{entry.institution}</p>
                {entry.credential && (
                  <p className="text-body-l mt-1 text-[var(--color-text-secondary)]">{entry.credential}</p>
                )}
                <p className="text-caption mt-1 text-[var(--color-text-dim)]">
                  {entry.location ? `${entry.location} · ` : ''}
                  {formatEduRange(entry.start, entry.end)}
                  {entry.detail ? ` · ${entry.detail}` : ''}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Signals id="about-signals" index={undefined} label="Signals" compact />

        <Section index={undefined} label="Currently" compact>
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {now.items.map((item) => (
              <div key={item.label}>
                <dt className="text-label text-[var(--color-text-dim)]">{item.label}</dt>
                <dd className="text-body-l mt-1 text-[var(--color-text-secondary)]">
                  {item.href ? (
                    <a href={item.href} className="hover:text-[var(--color-signal)]">
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-caption mt-8 text-[var(--color-text-dim)]">Last updated {now.updated}.</p>
        </Section>

        <Contact id="about-contact" index={undefined} label="Let's talk" compact />
      </main>
    </CrossHighlightProvider>
  )
}
