import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <main id="main" style={{ paddingTop: '56px' }}>
      <Container className="flex min-h-[calc(100svh-56px)] flex-col justify-center py-24">
        <p className="text-label text-[var(--color-text-dim)]">404</p>
        <h1 className="text-display-l mt-4 max-w-2xl">
          This page dissolved back into <span className="text-accent" style={{ color: 'var(--color-static)' }}>noise</span>.
        </h1>
        <p className="text-body-l mt-4 max-w-xl text-[var(--color-text-secondary)]">
          Whatever you were looking for isn't at this address. It might have moved, or never existed.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/">Back home</Button>
          <Button href="/work" variant="ghost">
            See the work
          </Button>
        </div>
      </Container>
    </main>
  )
}
