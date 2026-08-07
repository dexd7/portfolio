import type { ContributionDay } from '@/lib/github'
import { cn } from '@/lib/utils'

const DAY_LABEL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type Status = 'danger' | 'warn' | 'safe'

function statusFor(count: number): Status {
  if (count === 0) return 'danger'
  if (count <= 2) return 'warn'
  return 'safe'
}

const STATUS_COLOR: Record<Status, string> = {
  danger: 'var(--bomb-danger)',
  warn: 'var(--bomb-warn)',
  safe: 'var(--bomb-safe)',
}

/** Trailing zero-count days, counted back from today. `null` if the whole window is dark — the fuse has been unlit longer than this page can see. */
function daysSinceLastCommit(days: ContributionDay[]): number | null {
  for (let i = days.length - 1; i >= 0; i--) {
    if ((days[i]?.count ?? 0) > 0) return days.length - 1 - i
  }
  return null
}

interface ContributionStripProps {
  days: ContributionDay[]
}

/**
 * Styled as a bomb-defusal console — see the .bomb-console doc comment in
 * globals.css for why this page breaks from the site's usual palette. The
 * "days since last push" readout is the actual point: 0 reads as defused
 * (steady green), anything above 0 reads as armed and blinks red, getting
 * more alarming the longer it's been.
 */
export function ContributionStrip({ days }: ContributionStripProps) {
  const sinceLastCommit = daysSinceLastCommit(days)
  const armed = sinceLastCommit === null || sinceLastCommit > 0
  const total = days.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="bomb-console p-6 sm:p-8">
      <div className="flex flex-col items-center border-b border-[color-mix(in_srgb,var(--bomb-danger)_30%,transparent)] pb-6 text-center">
        <span className="text-label text-[var(--bomb-danger)] opacity-70">Days since last push</span>
        <span
          className={cn('bomb-led mt-2 text-display-xl tabular-nums', armed && 'bomb-armed')}
          style={{ color: armed ? 'var(--bomb-danger)' : 'var(--bomb-safe)' }}
        >
          {sinceLastCommit === null ? '7+' : sinceLastCommit}
        </span>
        <span className="text-caption mt-1 text-[color-mix(in_srgb,white_50%,transparent)]">
          {armed ? 'ARMED — PUSH SOMETHING' : 'DEFUSED'}
        </span>
      </div>

      <div className="mt-6 flex gap-2 sm:gap-3">
        {days.map((day) => {
          const status = statusFor(day.count)
          const color = STATUS_COLOR[status]
          const date = new Date(`${day.date}T00:00:00`)
          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-label text-[color-mix(in_srgb,white_45%,transparent)]">{DAY_LABEL[date.getDay()]}</span>
              <div
                className={cn('aspect-square w-full rounded-sm', status === 'danger' && 'bomb-armed')}
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 14px ${color}, 0 0 28px ${color}`,
                }}
                aria-hidden="true"
              />
              <span className="bomb-led text-caption tabular-nums" style={{ color }}>
                {day.count}
              </span>
            </div>
          )
        })}
      </div>

      <p className="text-caption mt-6 text-center text-[color-mix(in_srgb,white_45%,transparent)]">
        <span className="bomb-led text-[var(--bomb-safe)]">{total}</span> contributions detected in the last {days.length} days
      </p>
    </div>
  )
}
