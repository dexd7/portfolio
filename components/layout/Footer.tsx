import Link from 'next/link'
import { site } from '@/data/site.config'
import { projectBySlug } from '@/data/projects'
import { Container } from './Container'

export function Footer() {
  const year = new Date().getFullYear()
  const sourceHref = projectBySlug('this-site')?.links.repo

  return (
    <footer className="border-t border-[var(--color-border)] py-8">
      <Container wide>
        <div className="flex flex-wrap items-center justify-between gap-4 text-caption text-[var(--color-text-dim)]">
          <p>© {year} {site.name} · Built with Next.js</p>
          <nav className="flex items-center gap-6" aria-label="Footer">
            {sourceHref && (
              <a href={sourceHref} target="_blank" rel="noreferrer" className="hover:text-[var(--color-signal)]">
                Source ↗
              </a>
            )}
            <Link href="/colophon" className="hover:text-[var(--color-signal)]">
              Colophon
            </Link>
          </nav>
        </div>
      </Container>
    </footer>
  )
}
