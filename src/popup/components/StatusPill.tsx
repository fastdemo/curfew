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
      return { bg: theme.surface, fg: theme.textTertiary }
  }
}

export default function StatusPill({ label, tone = 'muted', dot = true }: StatusPillProps) {
  const theme = useTheme()
  const { bg, fg } = toneColor(theme, tone)
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: bg, color: fg }}
    >
      {dot && (
        <span
          className="inline-block rounded-full"
          style={{ width: '6px', height: '6px', backgroundColor: fg, opacity: 0.9 }}
        />
      )}
      {label}
    </span>
  )
}