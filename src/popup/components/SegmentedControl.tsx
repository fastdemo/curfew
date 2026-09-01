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
      className="relative flex w-full"
      style={{
        padding: '3px',
        gap: '2px',
        borderRadius: '8px',
        backgroundColor: theme.surface,
        border: `1px solid ${theme.borderSoft}`,
      }}
    >
      <div
        className="absolute rounded-md transition-transform duration-150 ease-out"
        style={{
          top: 3,
          bottom: 3,
          left: 3,
          width: `calc((100% - 6px) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
          backgroundColor: theme.background,
          boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          marginRight: '2px',
        }}
      />
      {options.map(option => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className="relative z-10 flex flex-1 items-center justify-center transition-colors duration-150"
            style={{
              height: '28px',
              gap: '6px',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: active ? 600 : 500,
              color: active ? theme.textPrimary : theme.textTertiary,
            }}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
