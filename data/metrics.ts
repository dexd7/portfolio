import { MetricSchema, type Metric } from './schema'
import { z } from 'zod'

/**
 * The three headline "Proof" metrics on the homepage — the credibility
 * viewport, before any narrative. Each links back to the project that earned
 * it via `projectSlug`.
 */
// The explicit `: Metric[]` annotation (alongside `satisfies`) matters: without
// it, TS infers each element's own narrow literal type, so a field present on
// only one array entry (like `count` here) becomes inaccessible on the others
// — `satisfies` alone validates the literal but doesn't widen the binding's
// type for consumers. See also data/projects.ts, experience.ts, etc.
export const headlineMetrics: Metric[] = [
  {
    id: 'runtime-cut',
    value: '25–40%',
    label: 'pipeline runtime cut',
    context: 'Metadata inference, Innover Digital',
    projectSlug: 'synthetic-data-platform',
  },
  {
    id: 'incubator-finalist',
    value: '3 / 15',
    label: 'incubator finalist',
    context: "Voodoo's Studio incubator — Aura Farmer",
    projectSlug: 'aura-farmer',
  },
  {
    id: 'internship-extended',
    value: '3 months',
    count: { to: 3, suffix: ' mo' },
    label: 'internship extended on impact',
    context: 'Data & AI, Innover Digital',
    projectSlug: 'synthetic-data-platform',
  },
] satisfies Metric[]

export const headlineMetricsSchema = z.array(MetricSchema)
