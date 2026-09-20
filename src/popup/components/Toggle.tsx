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
        padding: 0,
        backgroundColor: checked ? theme.accent : theme.toggleOff,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none',
      }}
    >
      <span
        className="inline-block rounded-full transition-transform duration-150"
        style={{
          width: '14px',
          height: '14px',
          marginLeft: '2px',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
          transform: checked ? 'translateX(14px)' : 'translateX(0)',
        }}
      />
    </button>
  )
}
