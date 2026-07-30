import { SkillGroupSchema, type SkillGroup } from './schema'
import { z } from 'zod'

/**
 * `provenBy` references project slugs. The home "Signals" section and the
 * work index cross-highlight each other from these arrays — no bespoke
 * wiring, just data both sides read.
 */
export const skillGroups = [
  {
    id: 'languages',
    label: 'Languages',
    skills: [
      { id: 'python', label: 'Python', level: 5, provenBy: ['synthetic-data-platform'] },
      { id: 'c', label: 'C', level: 4, provenBy: ['parallel-data-framework', 'unix-shell'] },
      { id: 'typescript', label: 'TypeScript', level: 4, provenBy: ['aura-farmer', 'this-site'] },
      { id: 'javascript', label: 'JavaScript', level: 4, provenBy: ['pet-adoption-platform'] },
    ],
  },
  {
    id: 'backend-data',
    label: 'Backend & Data',
    skills: [
      { id: 'fastapi', label: 'FastAPI', level: 5, provenBy: ['synthetic-data-platform'] },
      { id: 'postgresql', label: 'PostgreSQL', level: 4, provenBy: ['synthetic-data-platform', 'aura-farmer'] },
      { id: 'supabase', label: 'Supabase', level: 4, provenBy: ['aura-farmer'] },
      { id: 'data-modeling', label: 'Data modeling', level: 4, provenBy: ['synthetic-data-platform'] },
    ],
  },
  {
    id: 'frontend',
    label: 'Frontend',
    skills: [
      { id: 'react', label: 'React', level: 5, provenBy: ['synthetic-data-platform', 'this-site'] },
      { id: 'react-native', label: 'React Native', level: 4, provenBy: ['aura-farmer'] },
      { id: 'html-css', label: 'HTML / CSS', level: 4, provenBy: ['pet-adoption-platform'] },
      { id: 'responsive-design', label: 'Responsive design', level: 4, provenBy: ['pet-adoption-platform'] },
    ],
  },
  {
    id: 'systems-tooling',
    label: 'Systems & Tooling',
    skills: [
      { id: 'systems-programming', label: 'Systems programming', level: 5, provenBy: ['unix-shell', 'parallel-data-framework'] },
      { id: 'concurrent-programming', label: 'Concurrent programming', level: 5, provenBy: ['parallel-data-framework', 'unix-shell'] },
      { id: 'posix-threads', label: 'POSIX threads', level: 5, provenBy: ['parallel-data-framework', 'unix-shell'] },
      { id: 'system-design', label: 'System design', level: 4, provenBy: ['synthetic-data-platform', 'this-site'] },
    ],
  },
] satisfies SkillGroup[]

export const skillGroupsSchema = z.array(SkillGroupSchema)

export const allSkills = () => skillGroups.flatMap((g) => g.skills)
