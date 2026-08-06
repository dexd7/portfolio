'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CopyEmailProps {
  email: string
  className?: string
}

/** Click-to-copy email, announced via aria-live so screen readers hear the confirmation too. */
export function CopyEmail({ email, className }: CopyEmailProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable (older browser, denied permission) — the
      // mailto link in the socials row below is the fallback, so fail quiet.
    }
  }

  return (
    <button type="button" onClick={handleCopy} className={cn('group inline-flex flex-wrap items-baseline gap-4 text-left', className)}>
      <span className="text-h2 sm:text-display-l break-all transition-colors duration-[var(--duration-ui)] group-hover:text-[var(--color-signal)]">
        {email}
      </span>
      <span className="text-label text-[var(--color-signal)]" aria-live="polite">
        {copied ? 'COPIED ✓' : ''}
      </span>
    </button>
  )
}
