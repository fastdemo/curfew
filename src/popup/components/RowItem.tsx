import { type ReactNode } from 'react'
import { useTheme } from '../../lib/theme-context'

interface RowItemProps {
  icon?: ReactNode
  title: string
  subtitle?: string
  right?: ReactNode
  onClick?: () => void
  variant?: 'card' | 'flat'
  divider?: boolean
}

export default function RowItem({
  icon,
  title,
  subtitle,
  right,
  onClick,
  variant = 'card',
  divider = false,
}: RowItemProps) {
  const theme = useTheme()
  const interactive = variant === 'card' && !!onClick

  const body = (
    <>
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && <span className="shrink-0">{icon}</span>}
        <div className="flex flex-col min-w-0 text-left">
          <span className="text-sm font-medium leading-tight" style={{ color: theme.textPrimary }}>{title}</span>
          {subtitle && (
            <span className="text-xs leading-tight mt-0.5" style={{ color: theme.textSecondary }}>{subtitle}</span>
          )}
        </div>
      </div>
      {right && <span className="shrink-0 ml-3">{right}</span>}
    </>
  )

  if (variant === 'flat') {
    return (
      <div
        className="flex items-center justify-between w-full px-4 py-3"
        style={{
          borderTop: divider ? `1px solid ${theme.borderSoft}` : 'none',
        }}
      >
        {body}
      </div>
    )
  }

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center justify-between w-full rounded-xl px-4 py-3.5 text-left transition-colors duration-150"
        style={{
          backgroundColor: theme.surface,
          border: `1px solid ${theme.borderSoft}`,
        }}
      >
        {body}
      </button>
    )
  }

  return (
    <div
      className="flex items-center justify-between w-full rounded-xl px-4 py-3.5 text-left"
      style={{
        backgroundColor: theme.surface,
        border: `1px solid ${theme.borderSoft}`,
      }}
    >
      {body}
    </div>
  )
}