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
    'Python, FastAPI, React. UW–Madison CS + Data Science, 2026 grad. Currently looking for full-stack and backend roles.',

  location: 'Madison, Wisconsin',
  timezone: 'America/Chicago',
  email: 'vihaansarin@gmail.com',
  phone: '+1 608-282-5559',

  // MUST be the www host: the domain redirects apex -> www
  // (http://vihaansarin.com -> https://vihaansarin.com -> https://www.…),
  // so www is the only variant that answers 200. This was previously the
  // apex, which meant metadataBase — and therefore every canonical, OG and
  // sitemap URL derived from it — advertised a host that only ever
  // redirects. Google then had no authoritative signal and picked a
  // representative URL per page on its own, which is why search results
  // showed http://vihaansarin.com for the homepage but
  // https://www.vihaansarin.com for /work. Everything canonical derives
  // from this — OG image URLs, sitemap, JSON-LD, RSS.
  url: 'https://www.vihaansarin.com',

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
      href: 'https://github.com/dexd7',
      handle: '@dexd7',
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
    { label: 'Résumé', href: '/resume' },
    { label: 'Accountability', href: '/accountability' },
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
