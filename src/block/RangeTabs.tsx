import { useBlockTheme } from './theme'
import { RANGE_LABEL, type UsageRange } from './usage'

export function RangeTabs({
  range,
  onChange,
}: {
  range: UsageRange
  onChange: (r: UsageRange) => void
}) {
  const c = useBlockTheme()
  return (
    <div
      role="tablist"
      aria-label="usage range"
      style={{
        display: 'flex', gap: 3, padding: 3,
        backgroundColor: c.inset, border: `1px solid ${c.border}`,
        borderRadius: 8, width: 'fit-content', margin: '0 auto', alignItems: 'center',
      }}
    >
      {(['today', 'week', 'month'] as UsageRange[]).map((r) => (
        <button
          key={r}
          role="tab"
          aria-selected={range === r}
          type="button"
          onClick={() => onChange(r)}
          style={{
            padding: '5px 10px',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: range === r ? 600 : 500,
            backgroundColor: range === r ? c.accent : 'transparent',
            color: range === r ? c.onAccent : c.tertiary,
            transition: 'background-color 180ms ease-out, color 180ms ease-out',
          }}
        >
          {RANGE_LABEL[r]}
        </button>
      ))}
    </div>
  )
}
