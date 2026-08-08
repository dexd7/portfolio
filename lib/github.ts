export interface ContributionDay {
  date: string
  count: number
}

const QUERY = `
  query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`

/**
 * Last `days` days of GitHub contributions, oldest first. Requires
 * GITHUB_TOKEN (a fine-grained PAT, no scopes needed — contribution counts
 * are exposed to any authenticated caller) since the contribution calendar
 * isn't available through GitHub's unauthenticated REST API at all, only
 * the GraphQL API. Returns null on any missing config or upstream failure
 * so the page can render a "not connected" state instead of throwing.
 */
export async function getRecentContributions(days = 7): Promise<ContributionDay[] | null> {
  const token = process.env.GITHUB_TOKEN
  const login = process.env.GITHUB_USERNAME

  if (!token || !login) return null

  const to = new Date()
  const from = new Date(to)
  from.setUTCDate(from.getUTCDate() - (days - 1))

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { login, from: from.toISOString(), to: to.toISOString() },
      }),
      next: { revalidate: 300 },
    })

    if (!res.ok) return null

    const json = await res.json()
    const weeks = json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks
    if (!Array.isArray(weeks)) return null

    const allDays: ContributionDay[] = weeks.flatMap((week: { contributionDays: { date: string; contributionCount: number }[] }) =>
      week.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })),
    )

    return allDays.slice(-days)
  } catch {
    return null
  }
}
