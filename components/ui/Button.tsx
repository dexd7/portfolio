import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

interface BaseProps {
  children: ReactNode
  variant?: 'primary' | 'ghost'
  className?: string
}

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined
  }

type ButtonAsLink = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }

type ButtonProps = ButtonAsButton | ButtonAsLink

const base =
  'text-label inline-flex items-center justify-center gap-2 px-6 py-3 transition-colors duration-[var(--duration-ui)] ease-[var(--ease-settle)]'

const variants = {
  primary: 'bg-[var(--color-signal)] text-[var(--color-ink-950)] hover:bg-[var(--color-ink-050)]',
  ghost:
    'border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-signal)] hover:text-[var(--color-signal)]',
}

/** Uses next/link when `href` is present, otherwise a real `<button>`. */
export function Button(props: ButtonProps) {
  const { children, variant = 'primary', className, ...rest } = props
  const classes = cn(base, variants[variant], className)

  if ('href' in props && props.href) {
    const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement>
    return (
      <Link href={props.href} className={classes} style={{ borderRadius: 'var(--radius-soft)' }} {...anchorRest}>
        {children}
      </Link>
    )
  }

  return (
    <button
      className={classes}
      style={{ borderRadius: 'var(--radius-soft)' }}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  )
}
