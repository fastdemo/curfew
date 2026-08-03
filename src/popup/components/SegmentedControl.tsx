import { type ReactNode } from 'react'
import { useTheme } from '../../lib/theme-context'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
  icon?: ReactNode
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const theme = useTheme()
  const index = Math.max(0, options.findIndex(o => o.value === value))

  return (
    <div
      className="relative flex w-full rounded-xl p-1"
      style={{
        backgroundColor: theme.surface,
        border: `1px solid ${theme.borderSoft}`,
      }}
    >
      <div
        className="absolute rounded-lg transition-transform duration-150 ease-in-out"
        style={{
          top: 4,
          bottom: 4,
          left: 4,
          width: `calc((100% - 8px) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
          backgroundColor: theme.background,
        }}
      />
      {options.map(option => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className="relative z-10 flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors duration-150"
            style={{ color: active ? theme.textPrimary : theme.textTertiary }}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}