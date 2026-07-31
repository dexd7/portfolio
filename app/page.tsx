import { Hero } from '@/components/sections/Hero'

/**
 * The landing page is deliberately just the hero — a minimal stage for the
 * WebGL "Resolve Field" scene (Phase 5), with clear options to go to Work,
 * About, or Résumé rather than a scroll of homepage sections repeating
 * content that now lives on those pages.
 */
export default function HomePage() {
  return (
    <main id="main">
      <Hero />
    </main>
  )
}
