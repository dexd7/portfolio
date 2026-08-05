import { ProjectSchema, type Project } from './schema'
import { z } from 'zod'

/**
 * The project registry. Adding a project = one entry here + one MDX file in
 * `content/work/<slug>.mdx`. Routes, sitemap, OG images, next/prev links,
 * JSON-LD, the home "Selected Work" list, generative covers, and skill
 * cross-links all derive from this file — nothing else needs to change.
 */
export const projects: Project[] = [
  {
    slug: 'synthetic-data-platform',
    index: 1,
    title: 'Synthetic Data Platform',
    thesis: 'Statistically faithful data, with the sensitive parts removed.',
    summary:
      'A full-stack platform for generating synthetic relational data at scale — five SDV models, an LLM generation mode, and PII masking built in from the start.',
    year: '2025',
    role: 'Software Engineer Intern, Data & AI',
    org: 'Innover Digital',
    confidential: true,
    status: 'shipped',
    stack: ['React', 'FastAPI', 'Python', 'SDV', 'OpenAI SDK', 'spaCy'],
    tags: ['data', 'backend', 'ai'],
    featured: true,
    order: 1,
    layout: 'product',
    links: {},
    cover: { type: 'generative', seed: 1, hue: 0 },
    metrics: [
      {
        id: 'runtime-cut',
        value: '25–40%',
        label: 'pipeline runtime cut',
        context: 'Metadata inference and constraint-handling pipelines, measured across benchmark runs.',
      },
      {
        id: 'setup-time-cut',
        value: '30%',
        count: { to: 30, suffix: '%' },
        label: 'faster dataset-exploration setup',
        context: 'Tabbed previews, post-generation dashboards, and export pipelines.',
      },
      {
        id: 'internship-extended',
        value: '3 months',
        count: { to: 3, suffix: ' mo' },
        label: 'internship extended',
        context: 'Extended on the strength of the metadata inference work.',
      },
    ],
    proves: [
      'python',
      'fastapi',
      'react',
      'system-design',
      'data-modeling',
    ],
  },

  {
    slug: 'aura-farmer',
    index: 2,
    title: 'Aura Farmer',
    thesis: 'A social app that replaces the like button with something less noisy.',
    summary:
      'A React Native + Supabase social app exploring engagement without public likes or follower counts — an "aura points" system instead. Finished top 3 of 15 teams in Voodoo’s Studio incubator.',
    year: '2025',
    role: 'Team project',
    confidential: false,
    status: 'archived',
    stack: ['React Native', 'Supabase'],
    tags: ['mobile', 'product', 'frontend'],
    featured: true,
    order: 2,
    layout: 'product',
    links: {},
    cover: { type: 'generative', seed: 2, hue: 30 },
    metrics: [
      {
        id: 'incubator-finalist',
        value: '3 / 15',
        label: 'incubator finalist',
        context: "Top 3 of 15 teams, Voodoo's Studio incubator.",
      },
      {
        id: 'api-calls-cut',
        value: '40%',
        count: { to: 40, suffix: '%' },
        label: 'fewer redundant API calls',
        context: 'Supabase query optimization.',
      },
      {
        id: 'fetch-time-cut',
        value: '2.0s → 1.5s',
        label: 'faster profile fetch time',
        context: 'Same optimization pass, measured in testing.',
      },
    ],
    highlights: [
      'Integrated RESTful Supabase APIs for real-time post, comment, and media handling in React Native profile and vault interfaces.',
      'Optimized Supabase queries, cutting redundant API calls by 40% and reducing profile fetch time from 2.0s to 1.5s.',
      'Ran an agile, SCRUM-based development cycle to plan sprints and coordinate across roles.',
      'Recognized as 1 of 3 finalists from 15 teams in Voodoo’s Studio incubator.',
    ],
    proves: ['react-native', 'supabase'],
  },

  {
    slug: 'parallel-data-framework',
    index: 3,
    title: 'MiniSpark',
    thesis: 'A Spark-inspired framework for turning unordered concurrent work into ordered results.',
    summary:
      'A parallel data-processing framework written from scratch in C — Resilient Distributed Datasets, a DAG scheduler over a POSIX thread pool, and lineage-based recovery — built to understand what Spark actually does underneath the API.',
    year: '2025',
    role: 'Independent project',
    confidential: false,
    status: 'archived',
    stack: ['C', 'POSIX threads'],
    tags: ['systems', 'concurrency'],
    featured: true,
    order: 3,
    layout: 'systems',
    links: {
      // TODO(vihaan): replace once the repo is published.
      repo: 'https://github.com/vihaansarin/minispark',
    },
    cover: { type: 'generative', seed: 3, hue: -30 },
    metrics: [
      {
        id: 'throughput',
        value: '4×',
        count: { to: 4, suffix: '×' },
        label: 'throughput on multicore',
        context: 'DAG scheduler over a POSIX thread pool, datasets up to 10GB.',
      },
      {
        id: 'lineage-overhead',
        value: '<5%',
        label: 'overhead recovering lost partitions',
        context: 'RDD lineage recomputation.',
      },
      {
        id: 'fragmentation-cut',
        value: '20%',
        count: { to: 20, suffix: '%' },
        label: 'less memory fragmentation',
        context: 'Custom allocators, thread-safe queues and mutexes.',
      },
    ],
    highlights: [
      'Built RDDs supporting map, filter, join, and partitionBy, with lineage recomputation recovering lost partitions at under 5% overhead.',
      'Architected a DAG scheduler using POSIX threads and a worker pool, accelerating throughput 4× on datasets up to 10GB in multicore environments.',
      'Implemented thread-safe queues, mutexes, and custom memory allocators — eliminating race conditions and cutting memory fragmentation 20%.',
    ],
    proves: ['c', 'posix-threads', 'concurrent-programming', 'systems-programming'],
  },

  {
    slug: 'unix-shell',
    index: 4,
    title: 'WSH',
    thesis: 'Raw text in, running processes out — down to the memory allocator.',
    summary:
      'A POSIX-style shell written in C, interactive and batch modes — fork/exec, 128-argument parsing, environment variables, built-ins, piping, and background jobs, covering 80%+ of daily Bash use.',
    year: '2025',
    role: 'Independent project',
    confidential: false,
    status: 'archived',
    stack: ['C', 'POSIX'],
    tags: ['systems'],
    featured: true,
    order: 4,
    layout: 'systems',
    links: {
      // TODO(vihaan): replace once the repo is published.
      repo: 'https://github.com/vihaansarin/wsh',
    },
    cover: { type: 'generative', seed: 4, hue: 60 },
    metrics: [
      {
        id: 'bash-parity',
        value: '80%+',
        count: { to: 80, suffix: '%+' },
        label: 'of daily Bash functionality covered',
        context: 'fork/exec, piping, background jobs, built-ins.',
      },
      {
        id: 'memory-leaks',
        value: 'Zero',
        label: 'memory leaks under Valgrind',
        context: '500+ commands tested, including nested pipelines.',
      },
      {
        id: 'speed-parity',
        value: 'Within 5%',
        label: 'of Bash execution speed',
        context: 'On standard workloads.',
      },
    ],
    highlights: [
      'Authored a Unix-like shell from scratch with interactive and batch modes — fork/exec, 128-argument parsing, environment variables, built-in commands, piping, and background jobs.',
      'Covered over 80% of daily Bash functionality.',
      'Verified reliability running 500+ diverse commands, including nested pipelines and background jobs — zero memory leaks under Valgrind, execution speed within 5% of Bash.',
    ],
    proves: ['c', 'systems-programming'],
  },

  {
    slug: 'pet-adoption-platform',
    index: 5,
    title: 'Animal Adoption Platform',
    thesis: 'A faster, filterable adoption workflow across every device.',
    summary:
      'A full-stack animal adoption platform with interactive filtering and secure adoption workflows, optimized for responsive, cross-device layouts.',
    year: '2024',
    role: 'Web Development Intern',
    org: 'Thales',
    confidential: false,
    status: 'shipped',
    stack: ['HTML', 'CSS', 'JavaScript'],
    tags: ['frontend'],
    featured: false,
    order: 5,
    layout: 'standard',
    links: {},
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
