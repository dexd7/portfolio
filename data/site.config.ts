import { SiteConfigSchema, type SiteConfig } from './schema'

/**
 * Everything about the person. Change it here, it changes everywhere —
 * nav, footer, command palette, JSON-LD, OG cards, sitemap, résumé page.
 */
export const site: SiteConfig = {
  name: 'Vihaan Sarin',
  initials: 'VS',
  role: 'Full-Stack Software Engineer',

  // `{noise}` and `{signal}` are colored by <Thesis>. Keep both markers.
  thesis: 'I build systems that turn {noise} into {signal}.',
  intro:
    'Python, FastAPI, React. UW–Madison CS + Data Science, 2026. Currently looking for full-stack and backend roles.',

  location: 'Madison, Wisconsin',
  timezone: 'America/Chicago',
  email: 'vihaansarin@gmail.com',
  phone: '+1 608-282-5559',

  // TODO(vihaan): swap once the domain is purchased. Everything canonical
  // derives from this — OG image URLs, sitemap, JSON-LD, RSS.
  url: 'https://vihaansarin.com',

  availability: {
    available: true,
    label: 'Available — full-time, 2026',
  },

  resume: {
    path: '/resume.pdf',
    updated: '2026-07-30',
  },

  socials: [
    {
      id: 'github',
      label: 'GitHub',
      // TODO(vihaan): confirm the handle — repos are still being published.
      href: 'https://github.com/vihaansarin',
      handle: '@vihaansarin',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/vihaan-sarin',
      handle: 'in/vihaan-sarin',
    },
    {
      id: 'email',
      label: 'Email',
      href: 'mailto:vihaansarin@gmail.com',
      handle: 'vihaansarin@gmail.com',
    },
  ],

  nav: [
    { label: 'Work', href: '/work' },
    { label: 'About', href: '/about' },
    { label: 'Résumé', href: '/resume' },
  ],

  seo: {
    title: 'Vihaan Sarin — Full-Stack Software Engineer',
    description:
      'Full-stack engineer building backend-heavy, data-driven systems in Python, FastAPI and React. UW–Madison CS + Data Science, 2026.',
    keywords: [
      'Vihaan Sarin',
      'full-stack engineer',
      'backend engineer',
      'Python',
      'FastAPI',
      'React',
      'synthetic data',
      'systems programming',
      'UW–Madison',
    ],
  },
} satisfies SiteConfig

export const siteSchema = SiteConfigSchema
