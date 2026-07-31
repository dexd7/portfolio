import type { Metadata } from 'next'
import { site } from '@/data/site.config'
import { fontVariables } from '@/lib/fonts'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.seo.title,
    template: `%s — ${site.name}`,
  },
  description: site.seo.description,
  keywords: site.seo.keywords,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} data-scroll-behavior="smooth">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  )
}
