import type { Metadata } from 'next'
import { orderedProjects } from '@/data/projects'
import { site } from '@/data/site.config'
import { Section } from '@/components/layout/Section'
import { WorkRow } from '@/components/work/WorkRow'
import { CrossHighlightProvider } from '@/components/sections/CrossHighlight'

export const metadata: Metadata = {
  title: 'Work',
  description: `Selected projects by ${site.name} — synthetic data systems, mobile product design, and systems programming from scratch in C.`,
}

export default function WorkPage() {
  return (
    <CrossHighlightProvider>
      <main id="main" style={{ paddingTop: '56px' }}>
        <Section label="All work">
          <div>
            {orderedProjects().map((project, i) => (
              <WorkRow key={project.slug} project={project} index={i} />
            ))}
          </div>
        </Section>
      </main>
    </CrossHighlightProvider>
  )
}
