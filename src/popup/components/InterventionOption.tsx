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
      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-150"
      style={{
        cursor: 'pointer',
        borderTop: divider ? `1px solid ${theme.borderSoft}` : 'none',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{
            backgroundColor: selected ? theme.highlight : theme.surface,
            color: theme.textPrimary,
            border: `1px solid ${theme.borderSoft}`,
          }}
        >
          {icon}
        </span>
        <span className="text-sm font-medium leading-tight min-w-0" style={{ color: theme.textPrimary }}>
          {title}
        </span>
      </div>
      <span className="flex items-center gap-2.5 shrink-0">
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-mono font-medium"
          style={{
            backgroundColor: selected ? theme.accent : theme.surface,
            color: selected ? theme.onAccent : theme.textSecondary,
            border: `1px solid ${selected ? theme.accent : theme.borderMuted}`,
          }}
        >
          {time}
        </span>
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full"
          style={{
            boxSizing: 'border-box',
            border: `2px solid ${selected ? theme.accent : theme.borderMuted}`,
            backgroundColor: selected ? theme.accent : 'transparent',
          }}
        >
          {selected && (
            <span
              className="block rounded-full"
              style={{ width: 5, height: 5, backgroundColor: theme.onAccent }}
            />
          )}
        </span>
      </span>
    </button>
  )
}