import Image from 'next/image'
import { cn } from '@/lib/utils'

interface PortraitProps {
  src: string
  alt: string
  className?: string
}

/**
 * The About page's optional portrait slot. When present, the photo gets a
 * desaturated + amber color-blend treatment (not a baked-in filter on the
 * file itself) so the tint stays tunable and consistent with the "Noise →
 * Signal" palette instead of running as a plain color photo.
 */
export function Portrait({ src, alt, className }: PortraitProps) {
  return (
    <div className={cn('relative aspect-[4/5] w-full overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        style={{ filter: 'grayscale(0.85) contrast(1.08) brightness(0.92)' }}
        sizes="(min-width: 1024px) 540px, 90vw"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: 'var(--color-signal)', mixBlendMode: 'color', opacity: 0.22 }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, transparent 55%, var(--color-ink-950) 100%)' }}
      />
      <div aria-hidden="true" className="absolute inset-0 border border-[var(--color-border)]" />
    </div>
  )
}
