import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { featuredProjects } from '@/data/projects'
import { experience } from '@/data/experience'
import { getProjectMdxSource } from '@/lib/mdx'
import { mdxComponents } from '@/components/mdx'
import { Section } from '@/components/layout/Section'
import { WorkRow } from '@/components/work/WorkRow'
import { WorkAccordionProvider } from '@/components/work/WorkAccordion'

/** Movement 02. An index, not a card grid. */
export async function SelectedWork() {
  const rows = await Promise.all(
    featuredProjects().map(async (project) => {
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
    <Section id="work" index={2} label="Selected work">
      <WorkAccordionProvider>
        <div>
          {rows.map(({ project, highlights, intro }, i) => (
            <WorkRow key={project.slug} project={project} index={i} highlights={highlights} intro={intro} />
          ))}
        </div>
      </WorkAccordionProvider>
      <div className="mt-8 border-t border-[var(--color-border)] pt-6">
        <Link href="/work" className="text-label text-[var(--color-signal)] hover:underline">
          All work →
        </Link>
      </div>
    </Section>
  )
}
