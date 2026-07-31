'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type HoverTarget = { kind: 'project'; id: string } | { kind: 'skill'; id: string } | null

interface CrossHighlightValue {
  hovered: HoverTarget
  setHovered: (target: HoverTarget) => void
}

const CrossHighlightContext = createContext<CrossHighlightValue | null>(null)

/**
 * Shared hover state between Selected Work and Signals: hovering a project
 * row highlights the skills it proves, and hovering a skill highlights the
 * projects that prove it. Pure data (`project.proves` / `skill.provenBy`),
 * no bespoke wiring beyond this context.
 */
export function CrossHighlightProvider({ children }: { children: ReactNode }) {
  const [hovered, setHovered] = useState<HoverTarget>(null)
  return <CrossHighlightContext.Provider value={{ hovered, setHovered }}>{children}</CrossHighlightContext.Provider>
}

export function useCrossHighlight(): CrossHighlightValue {
  const ctx = useContext(CrossHighlightContext)
  if (!ctx) throw new Error('useCrossHighlight must be used within a CrossHighlightProvider')
  return ctx
}
