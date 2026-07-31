import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { orderedProjects, projectBySlug } from '@/data/projects'
import { getProjectMdxSource } from '@/lib/mdx'
import { mdxComponents } from '@/components/mdx'
import { ProjectHeader } from '@/components/work/ProjectHeader'
import { ProjectCover } from '@/components/work/ProjectCover'
import { SystemDiagram } from '@/components/work/SystemDiagram'
import { Section } from '@/components/layout/Section'
import { Resolve } from '@/components/primitives/Resolve'
import { Counter } from '@/components/primitives/Counter'

interface PageProps {
  params: Promise<{ slug: string }>
}

// "this-site" routes to /colophon instead of its own case-study page (its
// links.internal already points there — see data/projects.ts), so it's
// deliberately excluded here.
export function generateStaticParams() {
  return orderedProjects()
    .filter((p) => p.slug !== 'this-site')
    .map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = projectBySlug(slug)
  if (!project) return {}
  return {
    title: project.title,
    description: project.summary,
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params
  const project = projectBySlug(slug)
  if (!project || project.slug === 'this-site') notFound()

  const source = await getProjectMdxSource(slug)
  const all = orderedProjects()
  const currentIndex = all.findIndex((p) => p.slug === slug)
  const next = all[(currentIndex + 1) % all.length]!

  return (
    <main id="main" style={{ paddingTop: '56px' }}>
      <Section wide>
        <ProjectHeader project={project} />
        <div className="mt-12 max-w-2xl">
          <ProjectCover project={project} />
        </div>
      </Section>

      {source && (
        <Section wide>
          <MDXRemote source={source} components={mdxComponents} />
        </Section>
      )}

      {project.diagram && (
        <Section wide label="Architecture">
          <SystemDiagram diagram={project.diagram} />
        </Section>
      )}

      {project.metrics.length > 0 && (
        <Section wide label="Results">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
            {project.metrics.map((metric, i) => (
              <Resolve key={metric.id} index={i}>
                <div className="border-t border-[var(--color-border)] pt-6">
                  <p className="text-display-l tabular-nums">
                    {metric.count ? (
                      <Counter to={metric.count.to} suffix={metric.count.suffix} />
                    ) : (
                      metric.value
                    )}
                  </p>
                  <p className="text-body mt-2">{metric.label}</p>
                  <p className="text-caption mt-1 text-[var(--color-text-dim)]">{metric.context}</p>
                </div>
              </Resolve>
            ))}
          </div>
        </Section>
      )}

      <Section wide>
        <Link
          href={next.links.internal ?? '/work'}
          className="group block border-t border-[var(--color-border)] py-16"
        >
          <p className="text-label mb-3 text-[var(--color-text-dim)]">Next</p>
          <p className="text-display-l transition-colors duration-[var(--duration-ui)] group-hover:text-[var(--color-signal)]">
            {next.title} →
          </p>
        </Link>
      </Section>
    </main>
  )
}
