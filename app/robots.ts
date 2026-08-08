import type { MetadataRoute } from 'next'
import { site } from '@/data/site.config'

/**
 * The site previously served no robots.txt at all (404). Pointing crawlers
 * at the sitemap from here is the second half of the canonicalization fix:
 * the canonical tags in app/layout.tsx say which URL is authoritative for a
 * page, and this says which pages exist in the first place.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Internal design reference, not content — kept out of search for the
      // same reason it's omitted from sitemap.ts.
      disallow: '/styleguide',
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  }
}
