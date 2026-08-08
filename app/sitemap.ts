import type { MetadataRoute } from 'next'
import { site } from '@/data/site.config'

/**
 * Static routes only — projects render as inline accordions on /work rather
 * than as their own /work/<slug> pages, so there is nothing per-project to
 * list here. Every URL is built off site.url, which MUST stay the www host
 * (see the comment there): a sitemap advertising URLs that merely redirect
 * is a weaker canonical signal than one listing the URLs that answer 200.
 *
 * /styleguide is deliberately absent — it's an internal design reference,
 * not content anyone should reach from search. robots.ts disallows it too.
 */
const ROUTES = ['', '/work', '/accountability', '/resume', '/colophon'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return ROUTES.map((route) => ({
    url: `${site.url}${route}`,
    lastModified,
    changeFrequency: route === '/accountability' ? 'daily' : 'monthly',
    // The homepage is the entry point; everything else is secondary.
    priority: route === '' ? 1 : 0.7,
  }))
}
