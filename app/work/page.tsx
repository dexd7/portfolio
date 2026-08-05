import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { orderedProjects } from '@/data/projects'
import { experience } from '@/data/experience'
import { site } from '@/data/site.config'
import { getProjectMdxSource } from '@/lib/mdx'
import { mdxComponents } from '@/components/mdx'
import { Section } from '@/components/layout/Section'
import { WorkRow } from '@/components/work/WorkRow'
import { CrossHighlightProvider } from '@/components/sections/CrossHighlight'
import { WorkAccordionProvider } from '@/components/work/WorkAccordion'

export const metadata: Metadata = {
  title: 'Work',
  description: `Selected projects by ${site.name} — synthetic data systems, mobile product design, and systems programming from scratch in C.`,
}

export default async function WorkPage() {
  const rows = await Promise.all(
    orderedProjects().map(async (project) => {
      const source = await getProjectMdxSource(project.slug)
      const highlights = project.highlights ?? experience.find((e) => e.projectSlug === project.slug)?.highlights
      return {
        project,
        highlights,
        intro: source ? <MDXRemote source={source} components={mdxComponents} /> : null,
      }
    }),
  )

  return (
    <WorkAccordionProvider>
      <CrossHighlightProvider>
        <main id="main" style={{ paddingTop: '56px' }}>
          <Section label="All work">
            <div>
              {rows.map(({ project, highlights, intro }, i) => (
                <WorkRow key={project.slug} project={project} index={i} highlights={highlights} intro={intro} />
              ))}
            </div>
          </Section>
        </main>
      </CrossHighlightProvider>
    </WorkAccordionProvider>
  )
}
