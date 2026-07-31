import { createElement } from 'react'
import { cn } from '@/lib/utils'
import type { ElementType, ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  as?: ElementType
  className?: string
  /** Use the wider 1440 container instead of the 1200 content width. */
  wide?: boolean
}

/**
 * Rendered via createElement, not JSX, for the polymorphic `as` tag:
 * @react-three/fiber's global JSX.IntrinsicElements augmentation (needed
 * for the WebGL hero) breaks TS inference for a bare `ElementType` used
 * directly in JSX — the distributed union over every intrinsic element,
 * three.js's included, collapses `children` to `never`. createElement
 * doesn't go through that JSX-specific resolution.
 */
export function Container({ children, as: Tag = 'div', className, wide = false }: ContainerProps) {
  return createElement(
    Tag,
    {
      className: cn('mx-auto w-full px-6 md:px-8', className),
      style: { maxWidth: wide ? 'var(--container-max)' : 'var(--content-max)' },
    },
    children,
  )
}
