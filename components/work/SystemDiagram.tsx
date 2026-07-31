'use client'

import type { Diagram } from '@/data/schema'
import { useInView } from '@/hooks/useInView'

const KIND_STROKE: Record<string, string> = {
  input: 'var(--color-text-secondary)',
  process: 'var(--color-signal)',
  store: 'var(--color-text-secondary)',
  output: 'var(--color-signal)',
  external: 'var(--color-text-dim)',
}

// Node coordinates are authored as 0–100 percentages of the diagram's own
// space (see data/schema.ts). The viewBox is wider than it is tall, so y is
// scaled into that shorter range — SCALE_Y keeps circles/labels looking
// right without needing non-uniform SVG scaling (which would squash text).
const VB_WIDTH = 100
const VB_HEIGHT = 58
const SCALE_Y = VB_HEIGHT / 100
const NODE_RADIUS = 2.4

// A small margin around the 0–100 coordinate space so a node placed right at
// the edge (x≈4 or x≈96) doesn't have its label box clipped by the SVG.
const MARGIN = 4

// Labels render in a foreignObject (real HTML/CSS) below each node, not SVG
// <text> — a fixed-width box lets the browser wrap long labels naturally
// instead of them overflowing into a neighboring node's space.
const LABEL_WIDTH = 16
const LABEL_HEIGHT = 12

interface SystemDiagramProps {
  diagram: Diagram
}

/**
 * Renders a project's {nodes, edges} as an SVG that draws in on scroll —
 * edges as lines with an animated stroke-dashoffset, nodes fading in, and a
 * looping pulse traveling each edge via native SVG animateMotion (no JS
 * needed for the pulse itself, just a CSS rule gating it under
 * reduced-motion).
 */
export function SystemDiagram({ diagram }: SystemDiagramProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2, once: true })
  const nodeById = new Map(diagram.nodes.map((n) => [n.id, n]))

  return (
    <div ref={ref}>
      <div className="overflow-x-auto">
        <svg
          viewBox={`${-MARGIN} 0 ${VB_WIDTH + MARGIN * 2} ${VB_HEIGHT}`}
          className="w-full min-w-[640px]"
          style={{ aspectRatio: `${VB_WIDTH + MARGIN * 2} / ${VB_HEIGHT}` }}
          role="img"
          aria-label={diagram.caption}
        >
          {diagram.edges.map((edge, i) => {
            const from = nodeById.get(edge.from)
            const to = nodeById.get(edge.to)
            if (!from || !to) return null
            const x1 = from.x
            const y1 = from.y * SCALE_Y
            const x2 = to.x
            const y2 = to.y * SCALE_Y
            const length = Math.hypot(x2 - x1, y2 - y1)

            return (
              <g key={`${edge.from}-${edge.to}-${i}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={edge.kind === 'control' ? 'var(--color-static)' : 'var(--color-border)'}
                  strokeWidth={0.4}
                  strokeDasharray={length}
                  strokeDashoffset={inView ? 0 : length}
                  style={{ transition: `stroke-dashoffset var(--duration-scene) var(--ease-resolve)` }}
                />
                <g className="diagram-pulse">
                  <circle r="0.8" fill="var(--color-signal)">
                    <animateMotion
                      dur="3s"
                      begin={`${i * 0.4}s`}
                      repeatCount="indefinite"
                      path={`M ${x1} ${y1} L ${x2} ${y2}`}
                    />
                  </circle>
                </g>
              </g>
            )
          })}

          {diagram.nodes.map((node) => {
            const cx = node.x
            const cy = node.y * SCALE_Y
            return (
              <g
                key={node.id}
                opacity={inView ? 1 : 0}
                style={{ transition: 'opacity var(--duration-reveal) var(--ease-resolve)' }}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={NODE_RADIUS}
                  fill="var(--color-ink-900)"
                  stroke={KIND_STROKE[node.kind]}
                  strokeWidth={0.4}
                />
                <foreignObject x={cx - LABEL_WIDTH / 2} y={cy + NODE_RADIUS + 1} width={LABEL_WIDTH} height={LABEL_HEIGHT}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '2.1px',
                      lineHeight: 1.25,
                      color: 'var(--color-text-dim)',
                      textAlign: 'center',
                      wordBreak: 'break-word',
                    }}
                  >
                    {node.label}
                  </div>
                </foreignObject>
              </g>
            )
          })}
        </svg>
      </div>
      <p className="text-caption mt-4 max-w-xl text-[var(--color-text-dim)]">{diagram.caption}</p>
    </div>
  )
}
