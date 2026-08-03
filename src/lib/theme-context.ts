import { createContext, useContext } from 'react'
import { onAccent, themes, type ThemeMode, type ThemePalette } from './theme'

export interface ResolvedTheme extends ThemePalette {
  onAccent: string
  mode: 'light' | 'dark'
  themeName: ThemeMode
}

export const DEFAULT_THEME: ResolvedTheme = {
  ...themes.light,
  onAccent,
  mode: 'light',
  themeName: 'system',
}

export const ThemeContext = createContext<ResolvedTheme>(DEFAULT_THEME)

export function useTheme(): ResolvedTheme {
  return useContext(ThemeContext)
}