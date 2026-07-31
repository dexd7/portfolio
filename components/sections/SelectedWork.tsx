import Link from 'next/link'
import { featuredProjects } from '@/data/projects'
import { Section } from '@/components/layout/Section'
import { WorkRow } from '@/components/work/WorkRow'

/** Movement 02. An index, not a card grid. */
export function SelectedWork() {
  return (
    <Section id="work" index={2} label="Selected work">
      <div>
        {featuredProjects().map((project, i) => (
          <WorkRow key={project.slug} project={project} index={i} />
        ))}
      </div>
      <div className="mt-8 border-t border-[var(--color-border)] pt-6">
        <Link href="/work" className="text-label text-[var(--color-signal)] hover:underline">
          All work →
        </Link>
      </div>
    </Section>
  )
}
