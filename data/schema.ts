import { z } from 'zod'

/**
 * The contract for every piece of content on this site.
 *
 * Rule: components never contain content, and data files never contain JSX.
 * Everything authored in `data/` is validated against these schemas by
 * `scripts/validate-content.ts`, which runs in `prebuild`. A malformed data
 * file fails the build rather than shipping broken.
 *
 * No `.default()` anywhere on purpose — it makes zod's input and output types
 * diverge, which turns hand-authored data files into a guessing game. Fields
 * are either required or explicitly `.optional()`.
 */

/** Absolute http(s) URL. Deliberately not `z.url()` — this is stricter and version-proof. */
const httpUrl = z
  .string()
  .regex(/^https?:\/\/\S+$/, 'must be an absolute http(s) URL')

/** `YYYY-MM`, or the literal `present` for an ongoing role. */
const yearMonth = z
  .string()
  .regex(/^(\d{4}-(0[1-9]|1[0-2])|present)$/, 'must be YYYY-MM or "present"')

/** kebab-case identifier used in URLs and cross-references. */
const slugString = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'must be kebab-case')

// ---------------------------------------------------------------------------
// Site
// ---------------------------------------------------------------------------

export const SocialSchema = z.object({
  id: slugString,
  label: z.string().min(1),
  href: z.string().min(1),
  /** Shown in the command palette, e.g. "@vihaansarin". */
  handle: z.string().optional(),
})

export const NavItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  /** Renders with a download affordance rather than as a page link. */
  download: z.boolean().optional(),
})

export const SiteConfigSchema = z.object({
  name: z.string().min(1),
  initials: z.string().min(1).max(3),
  role: z.string().min(1),
  /**
   * The thesis line. `{noise}` and `{signal}` are rendered in the "unresolved"
   * and "resolved" colors respectively — this is the one string on the site
   * that carries the whole concept, so it lives in config, not in a component.
   */
  thesis: z.string().includes('{noise}').includes('{signal}'),
  /** One sentence of substance under the thesis. */
  intro: z.string().min(1),
  location: z.string().min(1),
  /** IANA zone, powers the live clock in the contact section. */
  timezone: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  url: httpUrl,
  availability: z.object({
    available: z.boolean(),
    label: z.string().min(1),
  }),
  resume: z.object({
    path: z.string().min(1),
    updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
  socials: z.array(SocialSchema).min(1),
  nav: z.array(NavItemSchema).min(1),
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(50).max(165),
    keywords: z.array(z.string().min(1)).min(3),
  }),
})

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const CoverSchema = z.discriminatedUnion('type', [
  /**
   * The default. A deterministic point-field motif rendered from `seed`,
   * tinted by `hue` degrees off the accent. Reads as a sleeve system rather
   * than as a missing screenshot.
   */
  z.object({
    type: z.literal('generative'),
    seed: z.number().int().nonnegative(),
    hue: z.number().min(-180).max(180),
  }),
  /** Drop-in replacement once real screenshots exist. No template changes. */
  z.object({
    type: z.literal('image'),
    src: z.string().min(1),
    alt: z.string().min(1),
  }),
])

export const MetricSchema = z.object({
  id: slugString,
  /** The truth, always. Rendered verbatim when `count` is absent or motion is reduced. */
  value: z.string().min(1),
  /** Optional count-up animation. Never allowed to disagree with `value`. */
  count: z
    .object({
      to: z.number(),
      prefix: z.string().optional(),
      suffix: z.string().optional(),
      decimals: z.number().int().min(0).max(2).optional(),
    })
    .optional(),
  label: z.string().min(1),
  context: z.string().min(1),
  projectSlug: slugString.optional(),
})

export const DiagramNodeSchema = z.object({
  id: slugString,
  label: z.string().min(1),
  kind: z.enum(['input', 'process', 'store', 'output', 'external']),
  /** Percentage coordinates within the diagram viewBox, 0–100. */
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  note: z.string().optional(),
})

export const DiagramEdgeSchema = z.object({
  from: slugString,
  to: slugString,
  label: z.string().optional(),
  kind: z.enum(['data', 'control']),
})

export const DiagramSchema = z.object({
  caption: z.string().min(1),
  nodes: z.array(DiagramNodeSchema).min(2),
  edges: z.array(DiagramEdgeSchema).min(1),
})

export const ProjectSchema = z.object({
  slug: slugString,
  /** Display index — `01`, `02`. Drives the oversized numeral on covers. */
  index: z.number().int().positive(),
  title: z.string().min(1),
  /** One line. Appears under the title everywhere the project is referenced. */
  thesis: z.string().min(1),
  /** Longer sentence used for meta description and OG cards. */
  summary: z.string().min(1),
  year: z.string().regex(/^\d{4}(–\d{4})?$/),
  role: z.string().min(1),
  org: z.string().optional(),
  /**
   * Renders a "some details omitted — NDA" note and suppresses any field the
   * template would otherwise expose. Restraint is itself a signal.
   */
  confidential: z.boolean(),
  status: z.enum(['shipped', 'archived', 'in-progress']),
  stack: z.array(z.string().min(1)).min(1),
  tags: z.array(z.string().min(1)),
  featured: z.boolean(),
  /** Sort order across /work and next/prev navigation. */
  order: z.number().int(),
  /**
   * Escape hatch. Six projects through one rigid template look like six rows
   * of a spreadsheet — the C projects should not look like the app projects.
   */
  layout: z.enum(['systems', 'product', 'standard']),
  links: z.object({
    repo: httpUrl.optional(),
    live: httpUrl.optional(),
    external: httpUrl.optional(),
    internal: z.string().optional(),
  }),
  cover: CoverSchema,
  metrics: z.array(MetricSchema),
  diagram: DiagramSchema.optional(),
  /** Skill ids this project demonstrates. Powers the two-way cross-highlight. */
  proves: z.array(slugString),
})

// ---------------------------------------------------------------------------
// Experience / education
// ---------------------------------------------------------------------------

export const ExperienceSchema = z.object({
  id: slugString,
  org: z.string().min(1),
  role: z.string().min(1),
  location: z.string().min(1),
  start: yearMonth,
  end: yearMonth,
  highlights: z.array(z.string().min(1)).min(1),
  stack: z.array(z.string().min(1)),
  projectSlug: slugString.optional(),
})

export const EducationSchema = z.object({
  id: slugString,
  institution: z.string().min(1),
  credential: z.string().optional(),
  detail: z.string().optional(),
  location: z.string().optional(),
  start: z.string().regex(/^\d{4}(-\d{2})?$/),
  end: z.string().regex(/^\d{4}(-\d{2})?$/),
})

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export const SkillSchema = z.object({
  id: slugString,
  label: z.string().min(1),
  /** 1–5, rendered as filled dots. Honest, not everything-is-a-5. */
  level: z.number().int().min(1).max(5),
  /** Project slugs that back this claim. Empty is allowed but discouraged. */
  provenBy: z.array(slugString),
})

export const SkillGroupSchema = z.object({
  id: slugString,
  label: z.string().min(1),
  skills: z.array(SkillSchema).min(1),
})

// ---------------------------------------------------------------------------
// Résumé skills — the exhaustive, categorized list for /resume (ATS-style).
// Distinct from `SkillGroupSchema`, which is the homepage's curated,
// proof-backed subset. A résumé is expected to be exhaustive; the homepage
// Signals section deliberately isn't.
// ---------------------------------------------------------------------------

export const ResumeSkillCategorySchema = z.object({
  label: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
})

// ---------------------------------------------------------------------------
// "Currently"
// ---------------------------------------------------------------------------

export const NowSchema = z.object({
  updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  items: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
        href: z.string().optional(),
      }),
    )
    .min(1),
})

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type Social = z.infer<typeof SocialSchema>
export type NavItem = z.infer<typeof NavItemSchema>
export type SiteConfig = z.infer<typeof SiteConfigSchema>
export type Cover = z.infer<typeof CoverSchema>
export type Metric = z.infer<typeof MetricSchema>
export type DiagramNode = z.infer<typeof DiagramNodeSchema>
export type DiagramEdge = z.infer<typeof DiagramEdgeSchema>
export type Diagram = z.infer<typeof DiagramSchema>
export type Project = z.infer<typeof ProjectSchema>
export type Experience = z.infer<typeof ExperienceSchema>
export type Education = z.infer<typeof EducationSchema>
export type Skill = z.infer<typeof SkillSchema>
export type SkillGroup = z.infer<typeof SkillGroupSchema>
export type ResumeSkillCategory = z.infer<typeof ResumeSkillCategorySchema>
export type Now = z.infer<typeof NowSchema>
