import { useTheme } from './theme'

interface SwitchProps {
  checked: boolean
  disabled?: boolean
  onChange: () => void
  label: string
}

export function Switch({ checked, disabled, onChange, label }: SwitchProps) {
  const t = useTheme()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      disabled={disabled}
      style={{
        width: 36,
        height: 20,
        padding: 0,
        border: 'none',
        borderRadius: 999,
        flexShrink: 0,
        backgroundColor: checked ? t.accent : t.toggleOff,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 150ms ease-out, opacity 150ms ease-out',
      }}
    >
      <span
        style={{
          display: 'block',
          width: 16,
          height: 16,
          marginLeft: 2,
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
          transform: checked ? 'translateX(16px)' : 'translateX(0)',
          transition: 'transform 150ms ease-out',
        }}
      />
    </button>
  )
}
