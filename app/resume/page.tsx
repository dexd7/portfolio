import type { Metadata } from 'next'
import { site } from '@/data/site.config'
import { experience } from '@/data/experience'
import { education } from '@/data/education'
import { resumeSkills } from '@/data/resumeSkills'
import { featuredProjects } from '@/data/projects'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { PrintButton } from '@/components/ui/PrintButton'
import { formatMonthRange, formatEduRange } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Résumé',
  description: `${site.name} — résumé. ${site.role}, UW–Madison CS + Data Science.`,
}

export default function ResumePage() {
  return (
    <main id="main" style={{ paddingTop: '56px' }}>
      <Container className="py-16 print:py-0">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <p className="text-label text-[var(--color-text-dim)]">Résumé — last updated {site.resume.updated}</p>
          <div className="flex gap-3">
            <PrintButton />
            <Button href={site.resume.path} download>
              Download PDF ↓
            </Button>
          </div>
        </div>

        <header className="mb-10 border-b border-[var(--color-border)] pb-8 text-center print:mb-6 print:pb-4">
          <h1 className="text-display-l">{site.name}</h1>
          <p className="text-body mt-2 text-[var(--color-text-secondary)]">{site.role}</p>
          <p className="text-caption mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[var(--color-text-dim)]">
            <span>{site.phone}</span>
            <span>{site.email}</span>
            <span>{site.location}</span>
            {site.socials
              .filter((s) => s.id !== 'email')
              .map((s) => (
                <a key={s.id} href={s.href} className="hover:text-[var(--color-signal)]">
                  {s.handle ?? s.label}
                </a>
              ))}
          </p>
        </header>

        <section className="mb-10 print:mb-6">
          <h2 className="text-h3 mb-4 border-b border-[var(--color-border)] pb-2">Education</h2>
          {education.map((entry) => (
            <div key={entry.id} className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4">
              <div>
                <p className="text-body font-medium">{entry.institution}</p>
                {entry.credential && (
                  <p className="text-caption text-[var(--color-text-secondary)]">
                    {entry.credential}
                    {entry.detail ? ` — ${entry.detail}` : ''}
                  </p>
                )}
              </div>
              <p className="text-caption whitespace-nowrap text-[var(--color-text-dim)]">
                {entry.location ? `${entry.location} · ` : ''}
                {formatEduRange(entry.start, entry.end)}
              </p>
            </div>
          ))}
        </section>

        <section className="mb-10 print:mb-6">
          <h2 className="text-h3 mb-4 border-b border-[var(--color-border)] pb-2">Technical Skills</h2>
          <div className="space-y-2">
            {resumeSkills.map((category) => (
              <p key={category.label} className="text-caption text-[var(--color-text-secondary)]">
                <span className="text-[var(--color-text)]">{category.label}: </span>
                {category.items.join(', ')}
              </p>
            ))}
          </div>
        </section>

        <section className="mb-10 print:mb-6">
          <h2 className="text-h3 mb-4 border-b border-[var(--color-border)] pb-2">Experience</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="mb-6 last:mb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <p className="text-body font-medium">{exp.role}</p>
                <p className="text-caption whitespace-nowrap text-[var(--color-text-dim)]">
                  {formatMonthRange(exp.start, exp.end)}
                </p>
              </div>
              <p className="text-caption text-[var(--color-text-secondary)]">
                {exp.org} · {exp.location}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {exp.highlights.map((highlight, i) => (
                  <li key={i} className="text-caption text-[var(--color-text-secondary)]">
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-h3 mb-4 border-b border-[var(--color-border)] pb-2">Projects</h2>
          {featuredProjects().map((project) => (
            <div key={project.slug} className="mb-6 last:mb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <p className="text-body font-medium">
                  {project.title} <span className="text-caption text-[var(--color-text-dim)]">— {project.stack.join(', ')}</span>
                </p>
                <p className="text-caption whitespace-nowrap text-[var(--color-text-dim)]">{project.year}</p>
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li className="text-caption text-[var(--color-text-secondary)]">{project.summary}</li>
                {project.metrics.map((metric) => (
                  <li key={metric.id} className="text-caption text-[var(--color-text-secondary)]">
                    <span className="text-[var(--color-text)]">{metric.value}</span> {metric.label} — {metric.context}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </Container>
    </main>
  )
}
