import { useTheme } from '../../lib/theme-context'

interface ToggleProps {
  checked: boolean
  disabled?: boolean
  onChange: () => void
}

export default function Toggle({ checked, disabled, onChange }: ToggleProps) {
  const theme = useTheme()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className="relative inline-flex shrink-0 items-center rounded-full transition-colors duration-150"
      style={{
        width: '32px',
        height: '18px',
        backgroundColor: checked ? theme.accent : theme.borderMuted,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span
        className="inline-block rounded-full bg-white shadow-sm transition-transform duration-150"
        style={{
          width: '14px',
          height: '14px',
          transform: checked ? 'translateX(16px)' : 'translateX(2px)',
        }}
      />
    </button>
  )
}
