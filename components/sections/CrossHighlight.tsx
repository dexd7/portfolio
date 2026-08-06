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
 *
 * Touch devices never get a real hover — tapping a row fires synthetic
 * mouseenter/mouseleave/focus events that leave rows stuck dimmed or
 * flickering the opacity transition against unrelated animations (the
 * accordion opening, Resolve's own reveal). `setHovered` is a no-op unless
 * the device actually has a fine pointer with real hover — same check
 * ResolveField.tsx uses for the same reason.
 */
export function CrossHighlightProvider({ children }: { children: ReactNode }) {
  const [hovered, setHoveredState] = useState<HoverTarget>(null)
  const [hoverCapable] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  )

  const setHovered = (target: HoverTarget) => {
    if (hoverCapable) setHoveredState(target)
  }

  return <CrossHighlightContext.Provider value={{ hovered, setHovered }}>{children}</CrossHighlightContext.Provider>
}

export function useCrossHighlight(): CrossHighlightValue {
  const ctx = useContext(CrossHighlightContext)
  if (!ctx) throw new Error('useCrossHighlight must be used within a CrossHighlightProvider')
  return ctx
}
