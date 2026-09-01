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
      className="flex shrink-0 items-center justify-between"
      style={{
        marginTop: '4px',
        padding: '0 16px 6px',
        backgroundColor: 'transparent',
        borderBottom: `1px solid ${theme.borderSoft}`,
        gap: '2px',
      }}
    >
      <button
        type="button"
        onClick={() => chrome.tabs.create({ url: 'https://github.com/fastdemo/curfew' })}
        className="flex items-center rounded-lg focus-visible:outline-none"
        style={{ gap: '8px' }}
        aria-label="open curfew on github"
        title="open curfew on github"
      >
        <img
          src={chrome.runtime.getURL('icons/anko128.png')}
          alt="Curfew"
          style={{ width: '32px', height: '32px', borderRadius: '999px', objectFit: 'cover' }}
          className="shrink-0 transition-transform duration-200 ease-in-out hover:scale-[1.04] hover:rotate-3"
        />
        <span className="flex flex-col items-start text-left" style={{ gap: '2px' }}>
          <span
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '16px',
              fontWeight: 700,
              lineHeight: 1.2,
              color: theme.textPrimary,
              letterSpacing: '-0.02em',
            }}
          >
            curfew
          </span>
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 400,
              lineHeight: 1.3,
              color: theme.textTertiary,
              letterSpacing: '0.01em',
            }}
          >
            stay locked in
          </span>
        </span>
      </button>
      <StatusPill label={statusLabel} tone={tone} dot />
    </header>
  )
}
