'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface WorkAccordionValue {
  expandedSlug: string | null
  setExpandedSlug: (slug: string | null) => void
}

const WorkAccordionContext = createContext<WorkAccordionValue | null>(null)

/**
 * Which project's dropdown is open — shared across every WorkRow in the
 * tree (the /work list and the homepage's featured list both wrap their
 * rows in this), so opening one closes whichever other one was open.
 * Mirrors components/sections/CrossHighlight.tsx's shape exactly; a
 * separate context because hover cross-highlighting and accordion-open
 * state are unrelated concerns.
 */
export function WorkAccordionProvider({ children }: { children: ReactNode }) {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)

  // Deep link: /work#some-slug opens that row and scrolls to it. Read once
  // on mount, not on every hash change — this isn't a router, just a
  // one-shot "land here already open" affordance for Timeline's "Related
  // project" links.
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return
    setExpandedSlug(hash)
    document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <WorkAccordionContext.Provider value={{ expandedSlug, setExpandedSlug }}>{children}</WorkAccordionContext.Provider>
  )
}

export function useWorkAccordion(): WorkAccordionValue {
  const ctx = useContext(WorkAccordionContext)
  if (!ctx) throw new Error('useWorkAccordion must be used within a WorkAccordionProvider')
  return ctx
}
