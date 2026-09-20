import type { ChromeStorage, ThemeId } from '../types'
import { useTheme, type ModeSetting } from '../ui/theme'
import { THEMES, themeDef } from '../ui/themes'
import { Switch } from '../ui/Switch'

interface Props {
  storage: ChromeStorage & { update: (p: Partial<ChromeStorage>) => Promise<void> }
  onRequirePinToggle: () => void
}

// Settings: two safety switches + appearance. One grouped card with a
// divider; theme as a 3-way segmented control reusing the blocked-screen
// shape. Accent only on enabled switches, the active segment, CTA buttons.
export function SettingsScreen({ storage, onRequirePinToggle }: Props) {
  const t = useTheme()

  const flipConfirm = () =>
    storage.update({
      settings: { ...storage.settings, confirmTurnOff: !storage.settings.confirmTurnOff },
    })

  const setMode = (theme: ModeSetting) =>
    storage.update({ settings: { ...storage.settings, theme } })

  const setPalette = (palette: ThemeId) =>
    storage.update({ settings: { ...storage.settings, palette } })

  const rows = [
    {
      key: 'pin',
      icon: (
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2v-2l2.257-2.257A6 6 0 1121 9z" />
        </svg>
      ),
      title: 'pin protection',
      sub: 'ask for a pin before switching off',
      checked: storage.settings.requirePin,
      onChange: onRequirePinToggle,
    },
    {
      key: 'confirm',
      icon: (
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'confirm before stopping',
      sub: 'double-check before ending focus',
      checked: storage.settings.confirmTurnOff,
      onChange: () => void flipConfirm(),
    },
  ]

  const themes = [
    {
      value: 'system' as const,
      label: 'auto',
      icon: (
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      value: 'light' as const,
      label: 'light',
      icon: (
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      value: 'dark' as const,
      label: 'dark',
      icon: (
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
    },
  ]

  const current = storage.settings.theme
  const paletteId = storage.settings.palette ?? 'curfew'
  const paletteDef = themeDef(paletteId)
  const darkOnly = paletteDef.modes === 'dark'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.3, color: t.textSecondary, margin: '0 0 6px' }}>
          protection
        </p>
        <div
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: t.bgSurface,
            border: `1px solid ${t.border}`,
          }}
        >
          {rows.map((r, i) => (
            <div
              key={r.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 8px 10px 12px',
                borderTop: i > 0 ? `1px solid ${t.border}` : 'none',
              }}
            >
              <span style={{ display: 'flex', color: t.textSecondary, flexShrink: 0 }}>{r.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, lineHeight: 1.3, color: t.textPrimary }}>
                  {r.title}
                </p>
                <p style={{ margin: '1px 0 0', fontSize: 11, color: t.textSecondary }}>{r.sub}</p>
              </div>
              <Switch checked={r.checked} onChange={r.onChange} label={r.title} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.3, color: t.textSecondary, margin: '0 0 6px' }}>
          color theme
        </p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            padding: 4,
            borderRadius: 10,
            backgroundColor: t.bgSurface,
            border: `1px solid ${t.border}`,
            maxHeight: 148,
            overflowY: 'auto',
          }}
          role="radiogroup"
          aria-label="color theme"
        >
          {THEMES.map((th) => {
            const on = paletteId === th.id
            return (
              <button
                key={th.id}
                role="radio"
                aria-checked={on}
                type="button"
                onClick={() => void setPalette(th.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '7px 8px',
                  border: 'none',
                  borderRadius: 7,
                  cursor: 'pointer',
                  backgroundColor: on ? t.highlight : 'transparent',
                  transition: 'background-color 180ms ease-out',
                }}
              >
                <span style={{ display: 'flex', gap: 3, flexShrink: 0 }} aria-hidden>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: th.dark.accent, border: `1px solid ${t.border}` }} />
                  <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: th.dark.bgApp, border: `1px solid ${t.border}` }} />
                  <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: th.dark.success, border: `1px solid ${t.border}` }} />
                </span>
                <span style={{ flex: 1, textAlign: 'left', fontSize: 12.5, fontWeight: on ? 600 : 500, color: on ? t.textPrimary : t.textSecondary }}>
                  {th.label}
                </span>
                {th.modes === 'dark' && (
                  <span style={{ fontSize: 10, fontWeight: 600, color: t.textTertiary }}>dark</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.3, color: t.textSecondary, margin: '0 0 6px' }}>
          appearance{darkOnly ? ' · pinned to dark' : ''}
        </p>
        <div
          role="radiogroup"
          aria-label="theme"
          style={{
            display: 'flex',
            padding: 3,
            gap: 2,
            borderRadius: 10,
            backgroundColor: t.bgSurface,
            border: `1px solid ${t.border}`,
          }}
        >
          {themes.map((o) => {
            const on = current === o.value
            const disabled = darkOnly && o.value !== 'dark'
            return (
              <button
                key={o.value}
                role="radio"
                aria-checked={on}
                type="button"
                disabled={disabled}
                onClick={() => void setMode(o.value)}
                style={{
                  flex: 1,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  border: 'none',
                  borderRadius: 7,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  fontSize: 12.5,
                  fontWeight: on ? 600 : 500,
                  backgroundColor: on ? t.highlight : 'transparent',
                  color: on ? t.textPrimary : t.textTertiary,
                  opacity: disabled ? 0.4 : 1,
                }}
              >
                {o.icon}
                {o.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
