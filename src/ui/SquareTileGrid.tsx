import type { ReactElement } from 'react'
import { useTheme } from './theme'

export interface SquareTileItem {
  id: string
  icon: ReactElement
  /** Large prominent label at the bottom ("instant block", "1 min"). */
  label: string
  /** Secondary text beside the label ("0s", "reset"). Clearly lighter. */
  meta: string
  selected: boolean
  onSelect: () => void
  pressedLabel: string
}

// Shared square tile: left-aligned, large icon top, prominent label bottom
// with secondary meta beside it. One component drives home's intervention
// tiles and strict's duration tiles so they stay consistent automatically.
// Same radius/border/selected language as the rest of the app: accent
// border + fill when selected, neutral otherwise.
export function SquareTileGrid({ items, fill }: { items: SquareTileItem[]; fill?: boolean }) {
  const t = useTheme()
  return (
    <div
      style={{
        ...(fill
          ? { flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }
          : { display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '86px' }),
        gap: 8,
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={item.onSelect}
          aria-pressed={item.selected}
          aria-label={item.pressedLabel}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            minHeight: 0,
            overflow: 'hidden',
            padding: 10,
            borderRadius: 10,
            cursor: 'pointer',
            textAlign: 'left',
            backgroundColor: item.selected ? t.highlight : t.bgSurface,
            border: `1px solid ${item.selected ? t.accent : t.border}`,
            transition: 'background-color 150ms ease-out, border-color 150ms ease-out',
          }}
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke={item.selected ? t.accent : t.textSecondary}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            {item.icon}
          </svg>
          <span style={{ width: '100%' }}>
            <span
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 700,
                lineHeight: 1.2,
                color: t.textPrimary,
                textAlign: 'left',
              }}
            >
              {item.label}
            </span>
            <span
              style={{
                display: 'block',
                marginTop: 1,
                fontSize: 11,
                fontWeight: 500,
                color: t.textSecondary,
                fontVariantNumeric: 'tabular-nums',
                textAlign: 'left',
              }}
            >
              {item.meta}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}
