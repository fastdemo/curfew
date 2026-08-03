export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemePalette {
  background: string
  surface: string
  card: string
  textPrimary: string
  textSecondary: string
  textTertiary: string
  accent: string
  borderMuted: string
  borderSoft: string
  overlay: string
  highlight: string
  success: string
  successSoft: string
}

export const themes: Record<'light' | 'dark', ThemePalette> = {
  light: {
    background: '#FBF9F5',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    textPrimary: '#2D2825',
    textSecondary: '#7D7570',
    textTertiary: '#A79E96',
    accent: '#8B7E74',
    borderMuted: '#E3DDD2',
    borderSoft: '#ECE7DD',
    overlay: 'rgba(45, 40, 37, 0.5)',
    highlight: '#EFE9DF',
    success: '#5A7A55',
    successSoft: '#E6ECE1',
  },
  dark: {
    background: '#161413',
    surface: '#211E1C',
    card: '#262120',
    textPrimary: '#F6F2EC',
    textSecondary: '#A89E96',
    textTertiary: '#6E6660',
    accent: '#9A8D80',
    borderMuted: '#322D29',
    borderSoft: '#2A2622',
    overlay: 'rgba(0, 0, 0, 0.7)',
    highlight: '#2E2926',
    success: '#96A889',
    successSoft: '#272F1F',
  },
}

export function resolveThemeMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

export function getTheme(mode: ThemeMode): ThemePalette {
  return themes[resolveThemeMode(mode)]
}

// Foreground used on accent-filled surfaces (selected cards, primary buttons,
// pills). The palette defines accent as #8B7E74 in both themes, and its label
// contrast floods to off-white in BOTH themes per the design matrix.
export const onAccent = '#FBF9F5'

// Fills every semantic color variable used across popup/block/overlay from the
// canonical palette above. The CSS in index.css mirrors these exact values for
// the static `.dark` toggle; the overlay injection path uses this directly.
export function cssVarsFor(theme: 'light' | 'dark'): string {
  const c = themes[theme]
  return [
    ['surface', c.background],
    ['surface-secondary', c.surface],
    ['surface-tertiary', `color-mix(in srgb, ${c.surface} 80%, ${c.borderMuted})`],
    ['card', c.card],
    ['text-primary', c.textPrimary],
    ['text-secondary', c.textSecondary],
    ['text-muted', c.textSecondary],
    ['text-tertiary', c.textTertiary],
    ['accent', c.accent],
    ['on-accent', onAccent],
    ['success', c.success],
    ['success-soft', c.successSoft],
    ['border', c.borderMuted],
    ['border-muted', c.borderMuted],
    ['menu-item-bg', c.surface],
    ['menu-item-text', c.textPrimary],
    ['circle-low', c.surface],
    ['circle-med', c.accent],
    ['circle-high', c.textPrimary],
    ['highlight', c.highlight],
    ['curfew-100', c.surface],
    ['curfew-400', c.textSecondary],
    ['curfew-500', c.accent],
    ['curfew-600', c.accent],
    ['curfew-700', c.accent],
    ['curfew-900', c.textPrimary],
    ['overlay', c.overlay],
  ]
    .map(([name, value]) => `      --color-${name}: ${value};`)
    .join('\n')
}