import { useTheme } from '../../lib/theme-context'

interface SectionHeaderProps {
  title: string
  subtitle?: string
}

export default function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  const theme = useTheme()
  return (
    <div className="flex flex-col text-left" style={{ gap: '2px', marginBottom: '4px' }}>
      <h2
        style={{
          fontSize: '11px',
          fontWeight: 600,
          lineHeight: 1.3,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: theme.textTertiary,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: '11px', fontWeight: 400, lineHeight: 1.3, color: theme.textSecondary }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
