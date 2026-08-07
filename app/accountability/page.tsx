import type { Metadata } from 'next'
import { Section } from '@/components/layout/Section'
import { Resolve } from '@/components/primitives/Resolve'
import { ContributionStrip } from '@/components/accountability/ContributionStrip'
import { NeetcodeHeatmap } from '@/components/accountability/NeetcodeHeatmap'
import { getRecentContributions } from '@/lib/github'
import { pad2 } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Accountability',
  description: 'A running, public record of GitHub and NeetCode activity — no cherry-picking, just what actually happened.',
}

export const revalidate = 3600

export default async function AccountabilityPage() {
  const contributions = await getRecentContributions(7)

  return (
    <main id="main" style={{ paddingTop: '56px' }}>
      <Section index={0} label="ACCOUNTABILITY" compact>
        <h1 className="text-display-l">Keeping score.</h1>
        <p className="text-body mt-4 max-w-xl text-[var(--color-text-secondary)]">
          This tab pulls straight from GitHub and NeetCode. No editing after the fact.
        </p>
      </Section>

      <Section compact>
        <div className="space-y-10">
          <div>
            <p className="text-label mb-4 flex items-center gap-3 text-[var(--color-text-dim)]">
              <span className="text-[var(--color-signal)]">{pad2(1)}</span>
              <span>GITHUB — LAST 7 DAYS</span>
            </p>
            <Resolve direction="left">
              {contributions ? (
                <ContributionStrip days={contributions} />
              ) : (
                <div className="activity-card p-8 text-center">
                  <p className="text-body text-[#7d8590]">GitHub not connected</p>
                </div>
              )}
            </Resolve>
          </div>

          <div>
            <p className="text-label mb-4 flex items-center gap-3 text-[var(--color-text-dim)]">
              <span className="text-[var(--color-signal)]">{pad2(2)}</span>
              <span>NEETCODE — LAST 12 MONTHS</span>
            </p>
            <Resolve direction="right">
              <NeetcodeHeatmap />
            </Resolve>
          </div>
        </div>
      </Section>
    </main>
  )
}
