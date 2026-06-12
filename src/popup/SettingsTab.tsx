import { ChromeStorage } from '../types'

interface SettingsTabProps {
  storage: ChromeStorage & { loading: boolean; update: (p: Partial<ChromeStorage>) => Promise<void> }
  onRequirePinToggle?: () => void
}

export default function SettingsTab({ storage, onRequirePinToggle }: SettingsTabProps) {
  const toggleSetting = async (key: 'overlayMode' | 'requirePin' | 'confirmTurnOff') => {
    if (key === 'requirePin') {
      onRequirePinToggle?.()
      return
    }
    await storage.update({
      settings: { ...storage.settings, [key]: !storage.settings[key] },
    })
  }

  const setTheme = async (theme: 'light' | 'dark' | 'system') => {
    await storage.update({
      settings: { ...storage.settings, theme },
    })
  }

  const settings = [
    {
      key: 'overlayMode' as const,
      title: 'overlay mode',
      desc: 'show an overlay on blocked sites instead of redirecting to a new page.',
    },
    {
      key: 'requirePin' as const,
      title: 'pin protection',
      desc: 'require a pin before turning off quick focus and schedule.',
    },
    {
      key: 'confirmTurnOff' as const,
      title: 'confirmation prompt',
      desc: 'show a confirmation prompt before turning off focus mode.',
    },
  ]

  return (
    <div className="flex flex-col pb-2">
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>settings</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }} className="text-[var(--color-text-primary)]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
        <span style={{ fontSize: '15px', fontWeight: 600 }}>general</span>
      </div>

      <div className="flex flex-col gap-3">
        {settings.map(s => (
          <div
            key={s.key}
            className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[var(--color-surface-secondary)]"
          >
            <div className="flex-1 pr-4">
              <p style={{ fontSize: '15px', fontWeight: 600 }}>{s.title}</p>
              <p style={{ fontSize: '13px', fontWeight: 400, color: '#B0A695' }} className="mt-0.5">{s.desc}</p>
            </div>
            <button
              onClick={() => toggleSetting(s.key)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                storage.settings[s.key] ? 'bg-[#8A7B6B]' : 'bg-[var(--color-surface-tertiary)]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                  storage.settings[s.key] ? 'translate-x-[22px]' : 'translate-x-[2px]'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }} className="text-[var(--color-text-primary)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <span style={{ fontSize: '15px', fontWeight: 600 }}>theme</span>
        </div>
        <div className="flex gap-2">
          <ThemeButton
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            label="system"
            active={storage.settings.theme === 'system'}
            onClick={() => setTheme('system')}
          />
          <ThemeButton
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            label="light"
            active={storage.settings.theme === 'light'}
            onClick={() => setTheme('light')}
          />
          <ThemeButton
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            }
            label="dark"
            active={storage.settings.theme === 'dark'}
            onClick={() => setTheme('dark')}
          />
        </div>
      </div>
    </div>
  )
}

function ThemeButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 flex-1 py-3 rounded-2xl transition-all ${
        active
          ? 'bg-[#8A7B6B] text-[#F3EEEA]'
          : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]'
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}
