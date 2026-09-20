import { useBlockTheme } from './theme'
import { fmtDuration } from './usage'

// Site list fed by the same rows as the donut. Favicons stay grayscale so
// brand colors never compete with the accent; the blocked row reads via the
// accent time-chip instead.
export function UsageList({
  rows,
  highlightDomain,
}: {
  rows: { domain: string; time: number }[]
  highlightDomain?: string
}) {
  const c = useBlockTheme()
  if (rows.length === 0) {
    return <p style={{ margin: 0, fontSize: 11, color: c.tertiary, textAlign: 'center' }}>no usage data yet</p>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {rows.map((e) => {
        const hot = e.domain === highlightDomain
        return (
          <div key={e.domain} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${c.border}` }}>
            <img
              src={`https://www.google.com/s2/favicons?domain=${e.domain}&sz=32`}
              alt=""
              width={14}
              height={14}
              style={{ width: 14, height: 14, borderRadius: 3, flexShrink: 0, filter: 'grayscale(1)', opacity: 0.75 }}
            />
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, fontWeight: hot ? 600 : 400, color: hot ? c.primary : c.secondary }}>
              {e.domain}
            </span>
            <span style={{
              flexShrink: 0,
              fontSize: 11,
              fontWeight: hot ? 600 : 500,
              padding: '2px 7px',
              borderRadius: 999,
              color: hot ? c.onAccent : c.secondary,
              backgroundColor: hot ? c.accent : c.inset,
              border: `1px solid ${hot ? c.accent : c.border}`,
            }}>
              {fmtDuration(e.time)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
