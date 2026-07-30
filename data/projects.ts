import { ProjectSchema, type Project } from './schema'
import { z } from 'zod'

/**
 * The project registry. Adding a project = one entry here + one MDX file in
 * `content/work/<slug>.mdx`. Routes, sitemap, OG images, next/prev links,
 * JSON-LD, the home "Selected Work" list, generative covers, and skill
 * cross-links all derive from this file — nothing else needs to change.
 */
export const projects = [
  {
    slug: 'synthetic-data-platform',
    index: 1,
    title: 'Synthetic Data Platform',
    thesis: 'Statistically faithful data, with the sensitive parts removed.',
    summary:
      'A full-stack platform for generating synthetic relational data at scale — five SDV models, an LLM generation mode, and PII masking built in from the start.',
    year: '2025',
    role: 'Software Engineering Intern, Data & AI',
    org: 'Innover Digital',
    confidential: true,
    status: 'shipped',
    stack: ['React', 'FastAPI', 'Python', 'SDV', 'PostgreSQL'],
    tags: ['data', 'backend', 'ai'],
    featured: true,
    order: 1,
    layout: 'product',
    links: { internal: '/work/synthetic-data-platform' },
    cover: { type: 'generative', seed: 1, hue: 0 },
    metrics: [
      {
        id: 'runtime-cut',
        value: '25–40%',
        label: 'pipeline runtime cut',
        context: 'Metadata inference optimization, measured across benchmark runs.',
      },
      {
        id: 'internship-extended',
        value: '7 months',
        label: 'internship extended',
        context: 'Extended based on the impact of the metadata inference work.',
      },
      {
        id: 'models-integrated',
        value: '5',
        count: { to: 5 },
        label: 'SDV models integrated',
        context: 'Plus one LLM-based generation mode for cases SDV modeling underfits.',
      },
    ],
    diagram: {
      caption: 'Request flow: raw relational data in, masked synthetic data out.',
      nodes: [
        { id: 'source-db', label: 'Source DB', kind: 'external', x: 6, y: 50 },
        { id: 'metadata', label: 'Metadata inference', kind: 'process', x: 26, y: 25 },
        { id: 'pii-mask', label: 'PII masking', kind: 'process', x: 26, y: 75 },
        { id: 'sdv', label: 'SDV models (×5)', kind: 'process', x: 50, y: 25 },
        { id: 'llm', label: 'LLM generation mode', kind: 'process', x: 50, y: 75 },
        { id: 'constraints', label: 'Constraint handling', kind: 'process', x: 72, y: 50 },
        { id: 'output', label: 'Synthetic dataset', kind: 'output', x: 94, y: 50 },
      ],
      edges: [
        { from: 'source-db', to: 'metadata', kind: 'data' },
        { from: 'source-db', to: 'pii-mask', kind: 'data' },
        { from: 'metadata', to: 'sdv', kind: 'data' },
        { from: 'pii-mask', to: 'llm', kind: 'data' },
        { from: 'sdv', to: 'constraints', kind: 'data' },
        { from: 'llm', to: 'constraints', kind: 'data' },
        { from: 'constraints', to: 'output', kind: 'data' },
      ],
    },
    proves: [
      'python',
      'fastapi',
      'react',
      'postgresql',
      'system-design',
      'data-modeling',
    ],
  },

  {
    slug: 'aura-farmer',
    index: 2,
    title: 'Aura Farmer',
    thesis: 'A social app with the likes and follows designed out.',
    summary:
      'A React Native + Supabase social app that strips out likes and follower counts — the social noise most apps optimize for. Finished top 3 of 15 teams in Voodoo’s Studio incubator.',
    year: '2024–2025',
    role: 'Founding Engineer',
    confidential: false,
    status: 'archived',
    stack: ['React Native', 'Supabase', 'TypeScript', 'PostgreSQL'],
    tags: ['mobile', 'product', 'frontend'],
    featured: true,
    order: 2,
    layout: 'product',
    links: { internal: '/work/aura-farmer' },
    cover: { type: 'generative', seed: 2, hue: 30 },
    metrics: [
      {
        id: 'incubator-finalist',
        value: '3 / 15',
        label: 'incubator finalist',
        context: "Top 3 of 15 teams, Voodoo's Studio incubator.",
      },
    ],
    proves: ['react-native', 'typescript', 'supabase', 'postgresql'],
  },

  {
    slug: 'parallel-data-framework',
    index: 3,
    title: 'Parallel Data Framework',
    thesis: 'A Spark-inspired framework for turning unordered concurrent work into ordered results.',
    summary:
      'A parallel data-processing framework written from scratch in C — a thread pool, a work queue, and a map/reduce execution model, built to understand what Spark actually does underneath the API.',
    year: '2024',
    role: 'Independent project',
    confidential: false,
    status: 'archived',
    stack: ['C', 'POSIX threads', 'Make'],
    tags: ['systems', 'concurrency'],
    featured: true,
    order: 3,
    layout: 'systems',
    links: {
      // TODO(vihaan): replace once the repo is published.
      repo: 'https://github.com/vihaansarin/parallel-data-framework',
      internal: '/work/parallel-data-framework',
    },
    cover: { type: 'generative', seed: 3, hue: -30 },
    metrics: [],
    diagram: {
      caption: 'Work queue feeding a fixed thread pool; results merged in a reduce stage.',
      nodes: [
        { id: 'input', label: 'Input partitions', kind: 'input', x: 6, y: 50 },
        { id: 'queue', label: 'Work queue', kind: 'store', x: 28, y: 50 },
        { id: 'worker-1', label: 'Worker thread', kind: 'process', x: 52, y: 15 },
        { id: 'worker-2', label: 'Worker thread', kind: 'process', x: 52, y: 50 },
        { id: 'worker-3', label: 'Worker thread', kind: 'process', x: 52, y: 85 },
        { id: 'reduce', label: 'Reduce stage', kind: 'process', x: 76, y: 50 },
        { id: 'output', label: 'Ordered result', kind: 'output', x: 96, y: 50 },
      ],
      edges: [
        { from: 'input', to: 'queue', kind: 'data' },
        { from: 'queue', to: 'worker-1', kind: 'control' },
        { from: 'queue', to: 'worker-2', kind: 'control' },
        { from: 'queue', to: 'worker-3', kind: 'control' },
        { from: 'worker-1', to: 'reduce', kind: 'data' },
        { from: 'worker-2', to: 'reduce', kind: 'data' },
        { from: 'worker-3', to: 'reduce', kind: 'data' },
        { from: 'reduce', to: 'output', kind: 'data' },
      ],
    },
    proves: ['c', 'posix-threads', 'concurrent-programming', 'systems-programming'],
  },

  {
    slug: 'unix-shell',
    index: 4,
    title: 'Unix Shell, From Scratch',
    thesis: 'Raw text in, running processes out — down to the memory allocator.',
    summary:
      'A POSIX-style shell written in C: parsing, job control, pipes and redirection, and a custom arena allocator instead of leaning on libc malloc for everything.',
    year: '2024',
    role: 'Independent project',
    confidential: false,
    status: 'archived',
    stack: ['C', 'POSIX', 'Systems programming'],
    tags: ['systems'],
    featured: true,
    order: 4,
    layout: 'systems',
    links: {
      // TODO(vihaan): replace once the repo is published.
      repo: 'https://github.com/vihaansarin/unix-shell',
      internal: '/work/unix-shell',
    },
    cover: { type: 'generative', seed: 4, hue: 60 },
    metrics: [],
    diagram: {
      caption: 'A command line, parsed, forked, and executed with pipes wired between stages.',
      nodes: [
        { id: 'input', label: 'Command line', kind: 'input', x: 6, y: 50 },
        { id: 'parser', label: 'Parser', kind: 'process', x: 26, y: 50 },
        { id: 'fork', label: 'fork()', kind: 'process', x: 46, y: 25 },
        { id: 'pipe', label: 'pipe()', kind: 'process', x: 46, y: 75 },
        { id: 'exec', label: 'exec()', kind: 'process', x: 66, y: 25 },
        { id: 'arena', label: 'Arena allocator', kind: 'store', x: 66, y: 75 },
        { id: 'output', label: 'Running process', kind: 'output', x: 90, y: 50 },
      ],
      edges: [
        { from: 'input', to: 'parser', kind: 'data' },
        { from: 'parser', to: 'fork', kind: 'control' },
        { from: 'parser', to: 'pipe', kind: 'control' },
        { from: 'fork', to: 'exec', kind: 'control' },
        { from: 'pipe', to: 'arena', kind: 'data' },
        { from: 'exec', to: 'output', kind: 'control' },
        { from: 'arena', to: 'output', kind: 'data' },
      ],
    },
    proves: ['c', 'systems-programming', 'posix-threads', 'concurrent-programming'],
  },

  {
    slug: 'pet-adoption-platform',
    index: 5,
    title: 'Animal Adoption Platform',
    thesis: 'A faster, filterable adoption workflow across every device.',
    summary:
      'A full-stack animal adoption platform with interactive filtering and secure adoption workflows, optimized for responsive, cross-device layouts.',
    year: '2024',
    role: 'Web Developer',
    org: 'Thales',
    confidential: false,
    status: 'shipped',
    stack: ['HTML', 'CSS', 'JavaScript'],
    tags: ['frontend'],
    featured: false,
    order: 5,
    layout: 'standard',
    links: { internal: '/work/pet-adoption-platform' },
    cover: { type: 'generative', seed: 5, hue: -60 },
    metrics: [
      {
        id: 'load-time-cut',
        value: '25%',
        label: 'faster page loads',
        context: 'From optimizing client-side rendering through modular components.',
      },
    ],
    proves: ['javascript', 'html-css', 'responsive-design'],
  },

  {
    slug: 'this-site',
    index: 6,
    title: 'This Site',
    thesis: 'The portfolio, as its own case study.',
    summary:
      'The site you’re on — a modular, data-driven Next.js build with a single WebGL moment, budgeted performance, and content that never touches a component. Full write-up at the colophon.',
    year: '2026',
    role: 'Designer & Engineer',
    confidential: false,
    status: 'in-progress',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Zod', 'Three.js'],
    tags: ['frontend', 'systems'],
    featured: false,
    order: 6,
    layout: 'systems',
    links: {
      // TODO(vihaan): replace once the repo is public.
      repo: 'https://github.com/dexd7/portfolio.git',
      internal: '/colophon',
    },
    cover: { type: 'generative', seed: 6, hue: 90 },
    metrics: [],
    proves: ['typescript', 'react', 'system-design'],
  },
] satisfies Project[]

export const projectsSchema = z.array(ProjectSchema)

export const projectBySlug = (slug: string) =>
  projects.find((p) => p.slug === slug)

export const featuredProjects = () =>
  [...projects].filter((p) => p.featured).sort((a, b) => a.order - b.order)

export const orderedProjects = () =>
  [...projects].sort((a, b) => a.order - b.order)
