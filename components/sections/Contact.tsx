'use client'

import { site } from '@/data/site.config'
import { Section } from '@/components/layout/Section'
import { Resolve } from '@/components/primitives/Resolve'
import { CopyEmail } from '@/components/ui/CopyEmail'
import { useLocalTime } from '@/hooks/useLocalTime'

interface ContactProps {
  /** Homepage usage numbers this as movement 04; reused as-is on /about without that numbering. */
  id?: string
  index?: number
  label?: string
  compact?: boolean
}

/** Direct, generous, one click to email. Homepage's closing movement — also reused on /about. */
export function Contact({ id = 'contact', index = 4, label = 'Signal / end', compact }: ContactProps) {
  const time = useLocalTime(site.timezone)
  const socials = site.socials.filter((s) => s.id !== 'email')

  return (
    <Section id={id} index={index} label={label} compact={compact}>
      <Resolve>
        <h2 className="text-display-l">Let&apos;s build something.</h2>
      </Resolve>

      <Resolve index={1}>
        <CopyEmail email={site.email} className="mt-8" />
      </Resolve>

      <Resolve index={2}>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-label text-[var(--color-text-dim)]">
          {socials.map((s) => (
            <a
              key={s.id}
              href={s.href}
              target={s.href.startsWith('http') ? '_blank' : undefined}
              rel={s.href.startsWith('http') ? 'noreferrer' : undefined}
              className="hover:text-[var(--color-signal)]"
            >
              {s.label}
            </a>
          ))}
          <a href={site.resume.path} className="hover:text-[var(--color-signal)]">
            Résumé PDF
          </a>
          <span>{site.location}</span>
          <span className="tabular-nums" suppressHydrationWarning>
            {time ? `${time} local` : ''}
          </span>
        </div>
      </Resolve>
    </Section>
  )
}
