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
      <div className="flex items-center min-w-0" style={{ gap: '8px' }}>
        {icon && <span className="shrink-0 flex items-center justify-center" style={{ width: '20px', height: '20px' }}>{icon}</span>}
        <div className="flex flex-col min-w-0 text-left" style={{ gap: '1px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.3, color: theme.textPrimary }}>{title}</span>
          {subtitle && (
            <span style={{ fontSize: '11px', fontWeight: 400, lineHeight: 1.3, color: theme.textSecondary }}>{subtitle}</span>
          )}
        </div>
      </div>
      {right && <span className="shrink-0" style={{ marginLeft: '8px' }}>{right}</span>}
    </>
  )

  if (variant === 'flat') {
    return (
      <div
        className="flex items-center justify-between w-full"
        style={{
          padding: '8px 10px',
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
        className="flex items-center justify-between w-full text-left transition-colors duration-150"
        style={{
          padding: '8px 10px',
          backgroundColor: theme.surface,
          border: `1px solid ${theme.borderSoft}`,
          borderRadius: '8px',
        }}
      >
        {body}
      </button>
    )
  }

  return (
    <div
      className="flex items-center justify-between w-full text-left"
      style={{
        padding: '8px 10px',
        backgroundColor: theme.surface,
        border: `1px solid ${theme.borderSoft}`,
        borderRadius: '8px',
      }}
    >
      {body}
    </div>
  )
}
