import { type ResolvedTheme } from '../../lib/theme-context'
import { useTheme } from '../../lib/theme-context'

export type PillTone = 'success' | 'accent' | 'muted'

interface StatusPillProps {
  label: string
  tone?: PillTone
  dot?: boolean
}

function toneColor(theme: ResolvedTheme, tone: PillTone) {
  switch (tone) {
    case 'success':
      return { bg: theme.successSoft, fg: theme.success }
    case 'accent':
      return { bg: theme.accent, fg: theme.onAccent }
    case 'muted':
      return { bg: theme.highlight, fg: theme.textTertiary }
  }
}

export default function StatusPill({ label, tone = 'muted', dot = true }: StatusPillProps) {
  const theme = useTheme()
  const { bg, fg } = toneColor(theme, tone)
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full font-medium"
      style={{
        gap: '5px',
        padding: '3px 8px',
        fontSize: '11px',
        lineHeight: 1,
        backgroundColor: bg,
        color: fg,
      }}
    >
      {dot && (
        <span
          className="inline-block rounded-full"
          style={{ width: '5px', height: '5px', backgroundColor: fg, opacity: 0.9 }}
        />
      )}
      {label}
    </span>
  )
}
