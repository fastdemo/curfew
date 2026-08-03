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
      className="relative flex shrink-0 items-center justify-between px-3"
      style={{
        height: '48px',
        backgroundColor: theme.background,
        borderBottom: `1px solid ${theme.borderSoft}`,
      }}
    >
      <button
        type="button"
        onClick={() => chrome.tabs.create({ url: 'https://github.com/fastdemo/curfew' })}
        className="flex cursor-pointer items-center gap-[0.3rem] rounded-lg focus-visible:outline-none"
        aria-label="open curfew on github"
        title="open curfew on github"
      >
        <img
          src={chrome.runtime.getURL('icons/anko128.png')}
          alt="Curfew"
          className="h-7 w-7 rounded-full transition-transform duration-200 ease-in-out hover:scale-110 hover:rotate-6"
        />
        <h1
          className="text-base font-bold text-text-primary transition-colors duration-200 ease-in-out hover:text-accent"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          curfew
        </h1>
      </button>
      <StatusPill label={statusLabel} tone={tone} dot />
    </header>
  )
}