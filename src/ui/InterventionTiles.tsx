import { INTERVENTIONS } from '../lib/interventions'
import type { InterventionId } from '../types'
import { useTheme } from './theme'
import { SquareTileGrid } from './SquareTileGrid'
import type { ReactElement } from 'react'

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
      <SquareTileGrid
        fill
        items={INTERVENTIONS.map((item) => ({
          id: item.id,
          icon: ICONS[item.id],
          label: item.title,
          meta: item.time,
          selected: selected.includes(item.id),
          onSelect: () => onToggle(item.id),
          pressedLabel: `${item.title}, ${item.time}`,
        }))}
      />
    </div>
  )
}
