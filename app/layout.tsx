import type { Metadata } from 'next'
import { site } from '@/data/site.config'
import { fontVariables } from '@/lib/fonts'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { THEME_STORAGE_KEY } from '@/lib/theme'
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

// Synchronous, runs before first paint — the standard no-flash-of-wrong-
// theme pattern. Sets data-theme explicitly (even to 'light') so every
// later reader (ThemeToggle, useThemeColors) can trust the attribute is
// already correct rather than absent.
const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');document.documentElement.dataset.theme=t==='dark'?'dark':'light';}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
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
