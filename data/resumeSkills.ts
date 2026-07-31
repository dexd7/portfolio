import { ResumeSkillCategorySchema, type ResumeSkillCategory } from './schema'
import { z } from 'zod'

/**
 * The exhaustive, ATS-style skills list for /resume — distinct from
 * data/skills.ts, which is the homepage's smaller, proof-backed subset.
 * A résumé is expected to list everything; the homepage isn't.
 */
export const resumeSkills: ResumeSkillCategory[] = [
  {
    label: 'Languages',
    items: ['Python', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'C++', 'C', 'Bash', 'R', 'HTML', 'CSS'],
  },
  {
    label: 'Frameworks & Tools',
    items: [
      'React.js',
      'React Native',
      'Node.js',
      'Express',
      'Flask',
      'FastAPI',
      'Apache Spark',
      'JUnit',
      'JavaFX',
      'Docker',
      'Git',
      'GCP',
      'BigQuery',
      'VS Code',
      'PyCharm',
      'IntelliJ',
      'Eclipse',
      'WSL',
    ],
  },
  {
    label: 'Databases & Libraries',
    items: ['PostgreSQL', 'MongoDB', 'Cassandra', 'pandas', 'NumPy', 'SDV', 'Bootstrap', 'dplyr', 'Tidyverse', 'ggplot2'],
  },
  {
    label: 'Systems & Platforms',
    items: [
      'Unix/Linux',
      'HDFS',
      'Distributed Systems',
      'POSIX Threads',
      'Concurrency',
      'Systems Programming',
      'REST APIs',
      'CI/CD Pipelines',
    ],
  },
  {
    label: 'Concepts & Coursework',
    items: [
      'Algorithms',
      'Data Structures',
      'Operating Systems',
      'Database Management',
      'Object-Oriented Design',
      'Machine Learning',
      'Data Architecture',
      'Data Modeling',
      'Data Visualization',
      'Big Data Systems',
    ],
  },
] satisfies ResumeSkillCategory[]

export const resumeSkillsSchema = z.array(ResumeSkillCategorySchema)
