import { useTheme } from '../../lib/theme-context'

interface SectionHeaderProps {
  title: string
  subtitle?: string
}

export default function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  const theme = useTheme()
  return (
    <div className="flex flex-col gap-1 mb-1.5 text-left">
      <h2
        className="text-xs font-semibold tracking-wide"
        style={{ color: theme.textTertiary }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-xs leading-tight" style={{ color: theme.textSecondary }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}