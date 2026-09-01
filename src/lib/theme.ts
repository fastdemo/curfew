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
    background: '#FDFCF9',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    textPrimary: '#2E2A26',
    textSecondary: '#7A736E',
    textTertiary: '#A8A09A',
    accent: '#8C7F75',
    borderMuted: '#E8E2D9',
    borderSoft: '#E8E2D9',
    overlay: 'rgba(46, 42, 38, 0.48)',
    highlight: '#F2EDE6',
    success: '#5C7D57',
    successSoft: '#E8EDE6',
  },
  dark: {
    background: '#0F0E0D',
    surface: '#1C1A19',
    card: '#1E1C1B',
    textPrimary: '#F2EDE8',
    textSecondary: '#A69E99',
    textTertiary: '#6E6763',
    accent: '#9C8F84',
    borderMuted: '#2A2725',
    borderSoft: '#252220',
    overlay: 'rgba(0, 0, 0, 0.68)',
    highlight: '#252220',
    success: '#8FA98B',
    successSoft: '#1E241C',
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