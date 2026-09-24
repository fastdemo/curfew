import type { ReactElement } from 'react'
import { INTERVENTIONS } from '../lib/interventions'
import type { InterventionId } from '../types'
import { useTheme } from './theme'

interface TilesProps {
  selected: InterventionId[]
  onToggle: (id: InterventionId) => void
}

const ICONS: Record<InterventionId, ReactElement> = {
  instant: (
    <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636" />
  ),
  hold: (
    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  ),
  slide: <path d="M8 9l4-4 4 4m0 6l-4 4-4-4" />,
  breathing: (
    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  ),
}

export function InterventionTiles({ selected, onToggle }: TilesProps) {
  const t = useTheme()
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          lineHeight: 1.3,
          color: t.textSecondary,
          margin: '0 0 6px',
          flexShrink: 0,
        }}
      >
        interventions
      </p>
      {/* Square tiles: 2-col grid, equal 1fr rows stretched to fill the
          leftover frame height — no dead space below the grid. Content
          stays vertically centered so short rows never clip. */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 8,
        }}
      >
        {INTERVENTIONS.map((item) => {
          const on = selected.includes(item.id)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.id)}
              aria-pressed={on}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                minHeight: 0,
                overflow: 'hidden',
                padding: 8,
                borderRadius: 10,
                cursor: 'pointer',
                backgroundColor: on ? t.highlight : t.bgSurface,
                border: `1px solid ${on ? t.accent : t.border}`,
                transition: 'background-color 150ms ease-out, border-color 150ms ease-out',
              }}
            >
              <svg
                width={17}
                height={17}
                viewBox="0 0 24 24"
                fill="none"
                stroke={on ? t.accent : t.textSecondary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0 }}
              >
                {ICONS[item.id]}
              </svg>
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: t.textPrimary,
                  textAlign: 'center',
                }}
              >
                {item.title}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: t.textSecondary,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {item.time}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
