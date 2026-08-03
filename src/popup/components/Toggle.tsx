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
      className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-all duration-150"
      style={{
        backgroundColor: checked ? theme.accent : theme.borderMuted,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-150 ${
          checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  )
}