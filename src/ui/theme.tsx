import { createContext, useContext } from 'react'

export interface Theme {
  bgApp: string
  bgSurface: string
  textPrimary: string
  textSecondary: string
  textTertiary: string
  accent: string
  onAccent: string
  success: string
  successSoft: string
  border: string
  highlight: string
  toggleOff: string
  mode: 'light' | 'dark'
}

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function snapshotTheme(): Theme {
  const dark = document.documentElement.classList.contains('dark')
  if (!dark) {
    return {
      bgApp: '#fdfcf9',
      bgSurface: '#ffffff',
      textPrimary: '#2e2a26',
      textSecondary: '#7a736e',
      textTertiary: '#a8a09a',
      accent: '#8c7f75',
      onAccent: '#fdfcf9',
      success: '#5c7d57',
      successSoft: '#e8ede6',
      border: '#e8e2d9',
      highlight: '#f2ede6',
      toggleOff: '#d6cfbf',
      mode: 'light',
    }
  }
  return {
    bgApp: '#0f0e0d',
    bgSurface: '#1c1a19',
    textPrimary: '#f2ede8',
    textSecondary: '#a69e99',
    textTertiary: '#6e6763',
    accent: '#9c8f84',
    onAccent: '#fdfcf9',
    success: '#8fa98b',
    successSoft: '#1e241c',
    border: '#2a2725',
    highlight: '#252220',
    toggleOff: '#3e3b38',
    mode: 'dark',
  }
}

// Prefer live CSS values when available (keeps one source of truth in
// index.css); fall back to the compiled palette above.
export function readTheme(): Theme {
  try {
    const v = (n: string, fallback: string) => cssVar(n) || fallback
    const base = snapshotTheme()
    const dark = document.documentElement.classList.contains('dark')
    return {
      bgApp: v('--color-bg-app', base.bgApp),
      bgSurface: v('--color-bg-surface', base.bgSurface),
      textPrimary: v('--color-text-primary', base.textPrimary),
      textSecondary: v('--color-text-secondary', base.textSecondary),
      textTertiary: v('--color-text-tertiary', base.textTertiary),
      accent: v('--color-accent', base.accent),
      onAccent: v('--color-on-accent', base.onAccent),
      success: v('--color-success', base.success),
      successSoft: v('--color-success-soft', base.successSoft),
      border: v('--color-border', base.border),
      highlight: v('--color-highlight', base.highlight),
      toggleOff: v('--color-toggle-off', base.toggleOff),
      mode: dark ? 'dark' : 'light',
    }
  } catch {
    return snapshotTheme()
  }
}

export const ThemeContext = createContext<Theme>(snapshotTheme())

export function useTheme(): Theme {
  return useContext(ThemeContext)
}
