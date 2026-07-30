import { site } from '@/data/site.config'
import { headlineMetrics } from '@/data/metrics'
import { featuredProjects } from '@/data/projects'

/**
 * Phase 0 stub — proves the data layer end-to-end. Phase 1–2 replace this
 * with the real Hero / Proof / SelectedWork / Signals / Contact sections.
 */
export default function HomePage() {
  const thesisParts = site.thesis.split(/(\{noise\}|\{signal\})/g)

  return (
    <main id="main">
      <section style={{ padding: '4rem 1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.14em' }}>
          {site.role.toUpperCase()}
        </p>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>{site.name}</h1>
        <p style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}>
          {thesisParts.map((part, i) =>
            part === '{noise}' ? (
              <span key={i} style={{ color: 'var(--color-static)' }}>
                noise
              </span>
            ) : part === '{signal}' ? (
              <span key={i} style={{ color: 'var(--color-signal)' }}>
                signal
              </span>
            ) : (
              part
            ),
          )}
        </p>
        <p>{site.intro}</p>
      </section>

      <section style={{ padding: '2rem 1.5rem', display: 'flex', gap: '2rem' }}>
        {headlineMetrics.map((m) => (
          <div key={m.id}>
            <p style={{ fontSize: '2rem', fontFamily: 'var(--font-mono)' }}>{m.value}</p>
            <p>{m.label}</p>
          </div>
        ))}
      </section>

      <section style={{ padding: '2rem 1.5rem' }}>
        {featuredProjects().map((p) => (
          <div key={p.slug} style={{ padding: '1rem 0', borderTop: '1px solid var(--color-border)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-signal)' }}>
              {String(p.index).padStart(2, '0')}
            </span>{' '}
            {p.title} — <span style={{ color: 'var(--color-text-dim)' }}>{p.thesis}</span>
          </div>
        ))}
      </section>
    </main>
  )
}
