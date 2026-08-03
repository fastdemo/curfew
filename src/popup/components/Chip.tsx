import { type ReactNode } from 'react'
import { useTheme } from '../../lib/theme-context'

interface ChipProps {
  label: string
  selected?: boolean
  disabled?: boolean
  trailing?: ReactNode
  onClick?: () => void
}

export default function Chip({ label, selected, disabled, trailing, onClick }: ChipProps) {
  const theme = useTheme()
  const interactive = !!onClick
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !interactive}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150"
      style={{
        backgroundColor: selected ? theme.accent : theme.surface,
        color: selected ? theme.onAccent : theme.textSecondary,
        border: `1px solid ${selected ? theme.accent : theme.borderMuted}`,
        cursor: disabled ? 'not-allowed' : interactive ? 'pointer' : 'default',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <span>{label}</span>
      {trailing}
    </button>
  )
}