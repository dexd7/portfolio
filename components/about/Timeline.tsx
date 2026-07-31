import Link from 'next/link'
import { experience } from '@/data/experience'
import { Resolve } from '@/components/primitives/Resolve'
import { formatMonthRange } from '@/lib/utils'

/** Vertical hairline spine, amber node per role — the experience timeline. */
export function Timeline() {
  return (
    <div className="border-l border-[var(--color-border)] pl-8">
      {experience.map((exp, i) => (
        <Resolve key={exp.id} index={i}>
          <div className="relative pb-12 last:pb-0">
            <span
              aria-hidden="true"
              className="absolute h-2 w-2 rounded-full"
              style={{ backgroundColor: 'var(--color-signal)', left: 'calc(-2rem - 4.5px)', top: '0.4rem' }}
            />
            <p className="text-label text-[var(--color-text-dim)]">{formatMonthRange(exp.start, exp.end)}</p>
            <p className="text-h3 mt-1">{exp.role}</p>
            <p className="text-body text-[var(--color-text-secondary)]">
              {exp.org} · {exp.location}
            </p>
            {exp.highlights.length > 0 && (
              <ul className="mt-3 max-w-2xl list-disc space-y-2 pl-5">
                {exp.highlights.map((highlight, hi) => (
                  <li key={hi} className="text-body text-[var(--color-text-secondary)]">
                    {highlight}
                  </li>
                ))}
              </ul>
            )}
            {exp.projectSlug && (
              <Link
                href={`/work/${exp.projectSlug}`}
                className="text-label mt-3 inline-block text-[var(--color-signal)] hover:underline"
              >
                Related project ↗
              </Link>
            )}
          </div>
        </Resolve>
      ))}
    </div>
  )
}
