import { ExperienceSchema, type Experience } from './schema'
import { z } from 'zod'

export const experience = [
  {
    id: 'innover-digital',
    org: 'Innover Digital',
    role: 'Software Engineering Intern (Data & AI)',
    location: 'Alpharetta, GA',
    start: '2025-05',
    end: '2025-11',
    highlights: [
      'Built a full-stack synthetic data platform (React, FastAPI) integrating five SDV models for large-scale relational data benchmarking, plus an LLM-based generation mode.',
      'Implemented a PII masking engine and constraint-handling logic for secure, accurate multi-table synthesis.',
      'Optimized metadata inference pipelines, cutting runtime 25–40%. Internship extended based on impact.',
    ],
    stack: ['React', 'FastAPI', 'Python', 'SDV', 'PostgreSQL'],
    projectSlug: 'synthetic-data-platform',
  },
  {
    id: 'uw-madison-peer-mentor',
    org: 'University of Wisconsin–Madison',
    role: 'Classroom Peer Mentor',
    location: 'Madison, WI',
    start: '2024-09',
    end: '2024-12',
    highlights: [
      'Gave feedback on assignments and practice problems, helping students improve problem-solving strategies and mathematical reasoning.',
      'Coordinated group discussions and study groups, keeping students engaged in collaborative learning.',
    ],
    stack: [],
  },
  {
    id: 'thales',
    org: 'Thales',
    role: 'Web Developer',
    location: 'Noida, India',
    start: '2024-07',
    end: '2024-08',
    highlights: [
      'Built a full-stack animal adoption platform (HTML, CSS, JavaScript) with interactive filtering and secure adoption workflows across responsive, cross-device layouts.',
      'Optimized client-side rendering through modular components, reducing page load times by 25%.',
    ],
    stack: ['HTML', 'CSS', 'JavaScript'],
    projectSlug: 'pet-adoption-platform',
  },
] satisfies Experience[]

export const experienceSchema = z.array(ExperienceSchema)
