import type { Metadata } from 'next'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { projectBySlug } from '@/data/projects'
import { getProjectMdxSource } from '@/lib/mdx'
import { mdxComponents } from '@/components/mdx'
import { ProjectHeader } from '@/components/work/ProjectHeader'
import { ProjectCover } from '@/components/work/ProjectCover'
import { Section } from '@/components/layout/Section'

export const metadata: Metadata = {
  title: 'Colophon',
  description: 'How this site is built — the data architecture, the decisions behind it, and what changed along the way.',
}

export default async function ColophonPage() {
  const project = projectBySlug('this-site')!
  const source = await getProjectMdxSource('this-site')

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

      <Section wide>
        <Link href="/work" className="group block border-t border-[var(--color-border)] py-16">
          <p className="text-label mb-3 text-[var(--color-text-dim)]">Back to</p>
          <p className="text-display-l transition-colors duration-[var(--duration-ui)] group-hover:text-[var(--color-signal)]">
            All work →
          </p>
        </Link>
      </Section>
    </main>
  )
}
