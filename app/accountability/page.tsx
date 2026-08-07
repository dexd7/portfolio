import type { Metadata } from 'next'
import { Section } from '@/components/layout/Section'
import { ContributionStrip } from '@/components/accountability/ContributionStrip'
import { getRecentContributions } from '@/lib/github'

export const metadata: Metadata = {
  title: 'Accountability',
  description: 'A running, public record of GitHub and NeetCode activity — no cherry-picking, just what actually happened.',
}

export const revalidate = 3600

export default async function AccountabilityPage() {
  const contributions = await getRecentContributions(7)

  return (
    <main id="main" style={{ paddingTop: '56px' }}>
      <Section index={0} label="ACCOUNTABILITY">
        <h1 className="text-display-l">Keeping score.</h1>
        <p className="text-body mt-4 max-w-xl text-[var(--color-text-secondary)]">
          This tab pulls straight from GitHub and NeetCode. No editing after the fact.
        </p>
      </Section>

      <Section index={1} label="GITHUB — LAST 7 DAYS">
        {contributions ? (
          <ContributionStrip days={contributions} />
        ) : (
          <div className="bomb-console p-8 text-center">
            <p className="bomb-led text-body text-[var(--bomb-warn)]">GitHub not connected</p>
          </div>
        )}
      </Section>

      <Section index={2} label="NEETCODE — LAST 12 MONTHS">
        <div className="bomb-console flex items-center justify-center border-dashed p-8 text-center">
          <p className="bomb-led text-body text-[var(--bomb-warn)] opacity-70">Awaiting connection</p>
        </div>
      </Section>
    </main>
  )
}
