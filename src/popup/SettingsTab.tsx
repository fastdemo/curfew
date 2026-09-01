import { ChromeStorage } from '../types'
import { useTheme } from '../lib/theme-context'
import SectionHeader from './components/SectionHeader'
import RowItem from './components/RowItem'
import Toggle from './components/Toggle'
import SegmentedControl from './components/SegmentedControl'

interface SettingsTabProps {
  storage: ChromeStorage & { loading: boolean; update: (p: Partial<ChromeStorage>) => Promise<void> }
  onRequirePinToggle?: () => void
}

export default function SettingsTab({ storage, onRequirePinToggle }: SettingsTabProps) {
  const theme = useTheme()

  const toggleSetting = async (key: 'requirePin' | 'confirmTurnOff') => {
    if (key === 'requirePin') {
      onRequirePinToggle?.()
      return
    }
    await storage.update({
      settings: { ...storage.settings, [key]: !storage.settings[key] },
    })
  }

  const setTheme = async (value: 'light' | 'dark' | 'system') => {
    await storage.update({
      settings: { ...storage.settings, theme: value },
    })
  }

  const settings = [
    {
      key: 'requirePin' as const,
      icon: <PinIcon size={18} color={theme.textPrimary} />,
      title: 'pin protection',
      subtitle: 'require a pin before turning off focus mode',
    },
    {
      key: 'confirmTurnOff' as const,
      icon: <CheckIcon size={18} color={theme.textPrimary} />,
      title: 'confirmation prompt',
      subtitle: 'confirm before turning off focus mode',
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <section className="flex flex-col gap-2.5">
        <SectionHeader title="general" />
        <div
          className="overflow-hidden rounded-xl"
          style={{ backgroundColor: theme.surface, border: `1px solid ${theme.borderSoft}` }}
        >
          {settings.map((s, i) => (
            <RowItem
              key={s.key}
              variant="flat"
              divider={i > 0}
              icon={
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: theme.highlight }}
                >
                  {s.icon}
                </span>
              }
              title={s.title}
              subtitle={s.subtitle}
              right={
                <Toggle
                  checked={storage.settings[s.key]}
                  onChange={() => toggleSetting(s.key)}
                />
              }
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <SectionHeader title="theme" subtitle="choose how curfew looks" />
        <SegmentedControl
          value={storage.settings.theme}
          onChange={setTheme}
          options={[
            { value: 'system', label: 'system', icon: <MonitorIcon size={16} color={theme.textTertiary} /> },
            { value: 'light', label: 'light', icon: <SunIcon size={16} color={theme.textTertiary} /> },
            { value: 'dark', label: 'dark', icon: <MoonIcon size={16} color={theme.textTertiary} /> },
          ]}
        />
      </section>
    </div>
  )
}

function PinIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2v-2l2.257-2.257A6 6 0 1121 9z" />
    </svg>
  )
}

function CheckIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function MonitorIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function SunIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function MoonIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )
}