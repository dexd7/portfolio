import { MetricSchema, type Metric } from './schema'
import { z } from 'zod'

/**
 * The three headline "Proof" metrics on the homepage — the credibility
 * viewport, before any narrative. Each links back to the project that earned
 * it via `projectSlug`.
 */
export const headlineMetrics = [
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
    value: '7 months',
    count: { to: 7, suffix: ' mo' },
    label: 'internship extended on impact',
    context: 'Data & AI, Innover Digital',
    projectSlug: 'synthetic-data-platform',
  },
] satisfies Metric[]

export const headlineMetricsSchema = z.array(MetricSchema)
