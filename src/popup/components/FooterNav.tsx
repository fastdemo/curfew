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
      className="flex shrink-0 items-center justify-around px-4"
      style={{
        height: '56px',
        backgroundColor: theme.background,
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
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-150"
            style={{
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
    width: 20,
    height: 20,
    fill: 'none' as const,
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    strokeWidth: active ? 2.4 : 2,
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
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'strict':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 5.343m0 13.314A8 8 0 0017.657 5.343M12 8v4l3 3" />
        </svg>
      )
    case 'schedule':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    case 'settings':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
  }
}