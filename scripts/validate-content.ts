/**
 * Runs in `prebuild`. Validates every data file against its zod schema and
 * cross-checks referential integrity (slugs referenced by other files must
 * exist). A malformed data file fails the build with a readable error
 * instead of shipping broken.
 */
import { siteSchema, site } from '../data/site.config'
import { projectsSchema, projects } from '../data/projects'
import { experienceSchema, experience } from '../data/experience'
import { educationSchema, education } from '../data/education'
import { skillGroupsSchema, skillGroups, allSkills } from '../data/skills'
import { resumeSkillsSchema, resumeSkills } from '../data/resumeSkills'
import { headlineMetricsSchema, headlineMetrics } from '../data/metrics'
import { nowSchema, now } from '../data/now'

type Problem = { file: string; message: string }

const problems: Problem[] = []

function check(file: string, schemaResult: { success: boolean; error?: { message: string } }) {
  if (!schemaResult.success) {
    problems.push({ file, message: schemaResult.error!.message })
  }
}

check('site.config.ts', siteSchema.safeParse(site))
check('projects.ts', projectsSchema.safeParse(projects))
check('experience.ts', experienceSchema.safeParse(experience))
check('education.ts', educationSchema.safeParse(education))
check('skills.ts', skillGroupsSchema.safeParse(skillGroups))
check('resumeSkills.ts', resumeSkillsSchema.safeParse(resumeSkills))
check('metrics.ts', headlineMetricsSchema.safeParse(headlineMetrics))
check('now.ts', nowSchema.safeParse(now))

// --- Referential integrity -------------------------------------------------

const projectSlugs = new Set(projects.map((p) => p.slug))
const skillIds = new Set(allSkills().map((s) => s.id))

for (const project of projects) {
  for (const skillId of project.proves) {
    if (!skillIds.has(skillId)) {
      problems.push({
        file: 'projects.ts',
        message: `project "${project.slug}" proves unknown skill "${skillId}"`,
      })
    }
  }
  if (project.diagram) {
    const nodeIds = new Set(project.diagram.nodes.map((n) => n.id))
    for (const edge of project.diagram.edges) {
      if (!nodeIds.has(edge.from)) {
        problems.push({
          file: 'projects.ts',
          message: `project "${project.slug}" diagram edge references unknown node "${edge.from}"`,
        })
      }
      if (!nodeIds.has(edge.to)) {
        problems.push({
          file: 'projects.ts',
          message: `project "${project.slug}" diagram edge references unknown node "${edge.to}"`,
        })
      }
    }
  }
}

for (const skill of allSkills()) {
  for (const slug of skill.provenBy) {
    if (!projectSlugs.has(slug)) {
      problems.push({
        file: 'skills.ts',
        message: `skill "${skill.id}" is provenBy unknown project "${slug}"`,
      })
    }
  }
}

for (const exp of experience) {
  if (exp.projectSlug && !projectSlugs.has(exp.projectSlug)) {
    problems.push({
      file: 'experience.ts',
      message: `experience "${exp.id}" references unknown project "${exp.projectSlug}"`,
    })
  }
}

for (const metric of headlineMetrics) {
  if (metric.projectSlug && !projectSlugs.has(metric.projectSlug)) {
    problems.push({
      file: 'metrics.ts',
      message: `metric "${metric.id}" references unknown project "${metric.projectSlug}"`,
    })
  }
}

// Duplicate slug / index / order checks
const slugCounts = new Map<string, number>()
const indexCounts = new Map<number, number>()
const orderCounts = new Map<number, number>()
for (const p of projects) {
  slugCounts.set(p.slug, (slugCounts.get(p.slug) ?? 0) + 1)
  indexCounts.set(p.index, (indexCounts.get(p.index) ?? 0) + 1)
  orderCounts.set(p.order, (orderCounts.get(p.order) ?? 0) + 1)
}
for (const [slug, count] of slugCounts) {
  if (count > 1) problems.push({ file: 'projects.ts', message: `duplicate project slug "${slug}"` })
}
for (const [index, count] of indexCounts) {
  if (count > 1) problems.push({ file: 'projects.ts', message: `duplicate project index ${index}` })
}
for (const [order, count] of orderCounts) {
  if (count > 1) problems.push({ file: 'projects.ts', message: `duplicate project order ${order}` })
}

// --- Report ------------------------------------------------------------

if (problems.length > 0) {
  console.error(`\n✖ Content validation failed (${problems.length} problem${problems.length === 1 ? '' : 's'}):\n`)
  for (const p of problems) {
    console.error(`  [${p.file}]`)
    console.error(`  ${p.message}\n`)
  }
  process.exit(1)
}

console.log(
  `✓ Content valid — ${projects.length} projects, ${experience.length} experience entries, ${allSkills().length} skills.`,
)
