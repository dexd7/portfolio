import type { Project } from '@/data/schema'
import { Chip } from '@/components/ui/Chip'
import { pad2 } from '@/lib/utils'

export function ProjectHeader({ project }: { project: Project }) {
  return (
    <header>
      <p className="text-label mb-4 text-[var(--color-text-dim)]">
        {pad2(project.index)} · {project.year} · {project.status.toUpperCase()}
      </p>
      <h1 className="text-display-l max-w-4xl">{project.title}</h1>
      <p className="text-body-l mt-4 max-w-2xl text-[var(--color-text-secondary)]">{project.thesis}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {project.stack.map((s) => (
          <Chip key={s}>{s}</Chip>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-6 text-label text-[var(--color-text-dim)]">
        <span>
          {project.role}
          {project.org ? ` · ${project.org}` : ''}
        </span>
        {project.links.repo && (
          <a href={project.links.repo} target="_blank" rel="noreferrer" className="hover:text-[var(--color-signal)]">
            Repo ↗
          </a>
        )}
        {project.links.live && (
          <a href={project.links.live} target="_blank" rel="noreferrer" className="hover:text-[var(--color-signal)]">
            Live ↗
          </a>
        )}
      </div>

      {project.confidential && (
        <p className="text-caption mt-6 max-w-xl border-l-2 border-[var(--color-border)] pl-4 text-[var(--color-text-dim)]">
          Some details omitted — NDA. Architecture and outcomes only, no client data.
        </p>
      )}
    </header>
  )
}
