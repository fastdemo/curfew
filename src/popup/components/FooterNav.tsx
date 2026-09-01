import { useTheme } from '../../lib/theme-context'
import { TabId } from '../App'

interface FooterNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs: TabId[] = ['home', 'blocked', 'strict', 'schedule', 'settings']

export default function FooterNav({ activeTab, onTabChange }: FooterNavProps) {
  const theme = useTheme()
  return (
    <nav
      className="flex shrink-0 items-center justify-between"
      style={{
        height: '44px',
        padding: '0 8px',
        backgroundColor: theme.surface,
        borderTop: `1px solid ${theme.borderSoft}`,
      }}
    >
      {tabs.map(tab => {
        const active = activeTab === tab
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className="flex items-center justify-center rounded-full transition-colors duration-150"
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: active ? theme.highlight : 'transparent',
              color: active ? theme.accent : theme.textTertiary,
            }}
            aria-label={tab}
          >
            <NavIcon tab={tab} active={active} />
          </button>
        )
      })}
    </nav>
  )
}

function NavIcon({ tab, active }: { tab: TabId; active: boolean }) {
  const props = {
    width: 18,
    height: 18,
    fill: 'none' as const,
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    strokeWidth: active ? 2.2 : 1.8,
  }
  switch (tab) {
    case 'home':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    case 'blocked':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75a8.25 8.25 0 018.25 8.25c0 4.97-4.03 9-9 9s-9-4.03-9-9a8.25 8.25 0 018.25-8.25M12 7.5v3m0 3h.01" />
        </svg>
      )
    case 'strict':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m9 0a3 3 0 013 3v3a3 3 0 01-3 3h-9a3 3 0 01-3-3v-3a3 3 0 013-3m9 0H7.5" />
        </svg>
      )
    case 'schedule':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75M3 12h18" />
        </svg>
      )
    case 'settings':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.592c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.33.184.72.184 1.05 0l1.15-.66c.48-.276 1.08-.11 1.39.37l1.29 2.02c.3.47.15 1.08-.32 1.39l-1.1.73c-.32.21-.52.56-.53.94s.18.74.49.97l1.09.81c.44.33.53.95.2 1.39l-1.29 1.7c-.33.44-.95.53-1.39.2l-1.09-.81a1.125 1.125 0 00-1.35 0l-1.1.73c-.47.31-.62.92-.32 1.39l1.29 2.02c.31.48.15 1.08-.32 1.39l-1.15.66c-.33.19-.72.19-1.05 0l-1.15-.66a1.125 1.125 0 00-1.35 0l-.21 1.28a1.125 1.125 0 01-1.11.94h-2.59c-.55 0-1.02-.398-1.11-.94l-.21-1.28a1.125 1.125 0 00-1.35 0l-1.15.66c-.48.28-1.08.11-1.39-.37l-1.29-2.02c-.3-.47-.15-1.08.32-1.39l1.1-.73c.32-.21.52-.56.53-.94s-.18-.74-.49-.97l-1.09-.81c-.44-.33-.53-.95-.2-1.39l1.29-1.7c.33-.44.95-.53 1.39-.2l1.09.81c.32.24.74.3 1.12.17.38-.13.68-.43.81-.81l.21-1.28z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
  }
}
