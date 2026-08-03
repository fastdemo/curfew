import { useTheme } from '../../lib/theme-context'
import StatusPill, { type PillTone } from './StatusPill'

interface HeaderProps {
  blocking: boolean
  timerLabel?: string
  timerMode?: 'strict' | 'bypass'
  showTimer?: boolean
}

export default function Header({ blocking, timerLabel, timerMode, showTimer }: HeaderProps) {
  const theme = useTheme()

  let statusLabel: string
  let tone: PillTone
  if (showTimer && timerMode === 'strict') {
    statusLabel = `locked · ${timerLabel}`
    tone = 'success'
  } else if (showTimer && timerMode === 'bypass') {
    statusLabel = `bypass · ${timerLabel}`
    tone = 'accent'
  } else {
    statusLabel = blocking ? 'active' : 'idle'
    tone = blocking ? 'success' : 'muted'
  }

  return (
    <header
      className="relative flex shrink-0 items-center justify-between px-4"
      style={{
        height: '48px',
        backgroundColor: theme.background,
        borderBottom: `1px solid ${theme.borderSoft}`,
      }}
    >
      <div className="flex items-center gap-2.5">
        <img
          src={chrome.runtime.getURL('icons/anko128.png')}
          alt="Curfew"
          className="h-7 w-7 rounded-full"
        />
        <h1
          className="text-base font-bold tracking-tight"
          style={{ color: theme.textPrimary, fontFamily: "'Sora', sans-serif" }}
        >
          curfew
        </h1>
      </div>
      <StatusPill label={statusLabel} tone={tone} dot />
    </header>
  )
}