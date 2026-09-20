import { createContext, useContext } from 'react'
import { themeDef, resolvePalette, type ThemeId } from './themes'

export type ModeSetting = 'light' | 'dark' | 'system'

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
  /** Selected color palette (default 'curfew'). */
  paletteId: ThemeId
  /** Mode switch pinned — the palette is single-sided (dark-only or light-only). */
  forcedDark: boolean
}

function systemDark(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

function snapshotTheme(): Theme {
  const dark = document.documentElement.classList.contains('dark')
  const curfew = themeDef('curfew')
  const p = dark ? curfew.dark : curfew.light
  return { ...p, mode: dark ? 'dark' : 'light', paletteId: 'curfew', forcedDark: false }
}

/** Read palette + mode from storage-backed DOM state. App sets
 *  `documentElement.dataset.curfewPalette`; .dark class carries the mode. */
export function readTheme(): Theme {
  try {
    const paletteId = (document.documentElement.dataset.curfewPalette || 'curfew') as ThemeId
    const { palette, dark, forcedDark } = resolvePalette(
      paletteId,
      document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      document.documentElement.classList.contains('dark'),
    )
    return { ...palette, mode: dark ? 'dark' : 'light', paletteId: themeDef(paletteId).id, forcedDark }
  } catch {
    return snapshotTheme()
  }
}

export function applyTheme(paletteId: string, modeSetting: ModeSetting): { dark: boolean; forcedDark: boolean } {
  const { palette, dark, forcedDark } = resolvePalette(paletteId, modeSetting, systemDark())
  const root = document.documentElement
  root.dataset.curfewPalette = themeDef(paletteId).id
  root.classList.toggle('dark', dark)
  const css = [
    ['bg-app', palette.bgApp],
    ['bg-surface', palette.bgSurface],
    ['text-primary', palette.textPrimary],
    ['text-secondary', palette.textSecondary],
    ['text-tertiary', palette.textTertiary],
    ['accent', palette.accent],
    ['on-accent', palette.onAccent],
    ['success', palette.success],
    ['success-soft', palette.successSoft],
    ['border', palette.border],
    ['highlight', palette.highlight],
    ['toggle-off', palette.toggleOff],
  ]
    .map(([k, v]) => `--color-${k}: ${v};`)
    .join(' ')
  root.setAttribute('style', css)
  return { dark, forcedDark }
}

export const ThemeContext = createContext<Theme>(snapshotTheme())

export function useTheme(): Theme {
  return useContext(ThemeContext)
}
