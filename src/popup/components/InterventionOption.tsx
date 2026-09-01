import { type ReactNode } from 'react'
import { useTheme } from '../../lib/theme-context'

interface InterventionOptionProps {
  icon: ReactNode
  title: string
  time: string
  selected: boolean
  onClick: () => void
  divider?: boolean
}

export default function InterventionOption({ icon, title, time, selected, onClick, divider }: InterventionOptionProps) {
  const theme = useTheme()
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between text-left transition-colors duration-150"
      style={{
        gap: '8px',
        padding: '8px 10px',
        cursor: 'pointer',
        borderTop: divider ? `1px solid ${theme.borderSoft}` : 'none',
      }}
    >
      <div className="flex items-center min-w-0" style={{ gap: '8px' }}>
        <span
          className="flex shrink-0 items-center justify-center"
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: selected ? theme.highlight : theme.surface,
            color: theme.textPrimary,
            border: `1px solid ${theme.borderSoft}`,
          }}
        >
          {icon}
        </span>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            lineHeight: 1.3,
            color: theme.textPrimary,
          }}
        >
          {title}
        </span>
      </div>
      <span className="flex items-center shrink-0" style={{ gap: '8px' }}>
        <span
          style={{
            padding: '2px 7px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 500,
            fontVariantNumeric: 'tabular-nums',
            backgroundColor: selected ? theme.accent : theme.surface,
            color: selected ? theme.onAccent : theme.textSecondary,
            border: `1px solid ${selected ? theme.accent : theme.borderMuted}`,
          }}
        >
          {time}
        </span>
        <span
          className="flex items-center justify-center rounded-full"
          style={{
            width: '18px',
            height: '18px',
            boxSizing: 'border-box',
            border: `1.5px solid ${selected ? theme.accent : theme.borderMuted}`,
            backgroundColor: selected ? theme.accent : 'transparent',
          }}
        >
          {selected && (
            <span
              className="block rounded-full"
              style={{ width: 6, height: 6, backgroundColor: theme.onAccent }}
            />
          )}
        </span>
      </span>
    </button>
  )
}
