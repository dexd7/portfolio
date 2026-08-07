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
          <p className="text-body text-[var(--color-text-dim)]">
            GitHub isn&apos;t connected yet — set GITHUB_TOKEN and GITHUB_USERNAME.
          </p>
        )}
      </Section>

      <Section index={2} label="NEETCODE — LAST 12 MONTHS">
        <p className="text-body text-[var(--color-text-dim)]">Coming soon.</p>
      </Section>
    </main>
  )
}
