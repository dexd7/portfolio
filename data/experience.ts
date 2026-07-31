import { ExperienceSchema, type Experience } from './schema'
import { z } from 'zod'

export const experience: Experience[] = [
  {
    id: 'innover-digital',
    org: 'Innover Digital',
    role: 'Software Engineer Intern (Data & AI)',
    location: 'Remote / Atlanta, GA',
    start: '2025-05',
    end: '2025-11',
    highlights: [
      'Designed a full-stack React + FastAPI platform for synthetic data generation, including an LLM-based generation mode (OpenAI SDK, guardrails, preset templates) producing schema-validated sample rows.',
      'Integrated five SDV models (CTGAN, TVAE, GaussianCopula, CopulaGAN, HMASynthesizer) and a PII masking engine (spaCy NER + Faker) for secure, constraint-preserving relational synthesis.',
      'Built tabbed previews, post-generation dashboards, and export pipelines, cutting dataset-exploration setup time 30%.',
      'Optimized metadata inference and constraint-handling pipelines, cutting runtime 25–40%. Internship extended three months on the strength of it.',
    ],
    stack: ['React', 'FastAPI', 'Python', 'SDV', 'PostgreSQL', 'OpenAI SDK', 'spaCy'],
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
    role: 'Web Development Intern',
    location: 'Noida, India',
    start: '2024-07',
    end: '2024-08',
    highlights: [
      'Built a full-stack animal adoption platform (HTML, CSS, JavaScript) with interactive filtering and secure adoption workflows across responsive, cross-device layouts.',
      'Architected modular components and optimized client-side rendering with efficient DOM updates, cutting page load times 25%.',
      "Integrated and validated backend routes for data exchange, applying Thales' engineering standards for secure, fault-tolerant deployment.",
    ],
    stack: ['HTML', 'CSS', 'JavaScript'],
    projectSlug: 'pet-adoption-platform',
  },
] satisfies Experience[]

export const experienceSchema = z.array(ExperienceSchema)
