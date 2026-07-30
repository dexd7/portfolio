import { cn } from '@/lib/utils'
import type { ElementType, ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  as?: ElementType
  className?: string
  /** Use the wider 1440 container instead of the 1200 content width. */
  wide?: boolean
}

export function Container({ children, as: Tag = 'div', className, wide = false }: ContainerProps) {
  return (
    <Tag
      className={cn('mx-auto w-full px-6 md:px-8', className)}
      style={{ maxWidth: wide ? 'var(--container-max)' : 'var(--content-max)' }}
    >
      {children}
    </Tag>
  )
}
