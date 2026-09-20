import { useBlockTheme } from './theme'

// Donut of the same rows the site list shows: the blocked domain's segment
// in accent, everything else in a single muted tone. No per-site colors —
// accent still means one thing. Segments crossfade via CSS transition on the
// dash offsets; empty state is a plain muted ring.
export function UsageDonut({
  rows,
  highlightDomain,
}: {
  rows: { domain: string; time: number }[]
  highlightDomain?: string
}) {
  const c = useBlockTheme()
  const SIZE = 120
  const STROKE = 10
  const R = (SIZE - STROKE) / 2
  const CIRC = 2 * Math.PI * R

  const total = rows.reduce((s, e) => s + e.time, 0)
  const mine = highlightDomain ? (rows.find((d) => d.domain === highlightDomain)?.time ?? 0) : 0
  const mineFrac = total > 0 ? mine / total : 0

  return (
    <div style={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={c.border} strokeWidth={STROKE} />
        {total > 0 && mineFrac < 1 && (
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none"
            stroke={c.tertiary} strokeWidth={STROKE}
            strokeDasharray={`${CIRC * (1 - mineFrac)} ${CIRC * mineFrac}`}
            strokeDashoffset={-CIRC * mineFrac}
            style={{ transition: 'stroke-dasharray 250ms ease-out, stroke-dashoffset 250ms ease-out', opacity: 0.55 }}
          />
        )}
        {total > 0 && mineFrac > 0 && (
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none"
            stroke={c.accent} strokeWidth={STROKE} strokeLinecap="round"
            strokeDasharray={`${CIRC * mineFrac} ${CIRC * (1 - mineFrac)}`}
            style={{ transition: 'stroke-dasharray 250ms ease-out' }}
          />
        )}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <span style={{ fontSize: 19, fontWeight: 800, color: c.primary, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {total > 0 ? `${Math.round(mineFrac * 100)}%` : '–'}
        </span>
        <span style={{ fontSize: 10, color: c.tertiary, lineHeight: 1.2 }}>this site</span>
      </div>
    </div>
  )
}
