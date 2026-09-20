import type { Theme } from '../ui/theme'

export type ThemeId =
  | 'curfew'
  | 'catppuccin-mocha'
  | 'dracula'
  | 'nord'
  | 'gruvbox-dark'
  | 'tokyo-night'
  | 'rose-pine'
  | 'solarized-light'
  | 'monokai'
  | 'everforest'

export interface Palette {
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
}

export interface ThemeDef {
  id: ThemeId
  label: string
  /** 'both' | 'dark' — dark-only palettes pin the mode switch to dark. */
  modes: 'both' | 'dark'
  light: Palette
  dark: Palette
}

const CURFEW_LIGHT: Palette = {
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
}

const CURFEW_DARK: Palette = {
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
}

export const THEMES: ThemeDef[] = [
  { id: 'curfew', label: 'curfew', modes: 'both', light: CURFEW_LIGHT, dark: CURFEW_DARK },
  {
    id: 'catppuccin-mocha', label: 'catppuccin mocha', modes: 'dark',
    light: {
      bgApp: '#11111b', bgSurface: '#1e1e2e', textPrimary: '#cdd6f4',
      textSecondary: '#a6adc8', textTertiary: '#6c7086', accent: '#cba6f7',
      onAccent: '#11111b', success: '#a6e3a1', successSoft: '#313244',
      border: '#313244', highlight: '#313244', toggleOff: '#45475a',
    },
    dark: {
      bgApp: '#11111b', bgSurface: '#1e1e2e', textPrimary: '#cdd6f4',
      textSecondary: '#a6adc8', textTertiary: '#6c7086', accent: '#cba6f7',
      onAccent: '#11111b', success: '#a6e3a1', successSoft: '#313244',
      border: '#313244', highlight: '#313244', toggleOff: '#45475a',
    },
  },
  {
    id: 'dracula', label: 'dracula', modes: 'dark',
    light: {
      bgApp: '#282a36', bgSurface: '#353746', textPrimary: '#f8f8f2',
      textSecondary: '#bfbfbf', textTertiary: '#6272a4', accent: '#bd93f9',
      onAccent: '#282a36', success: '#50fa7b', successSoft: '#44475a',
      border: '#44475a', highlight: '#44475a', toggleOff: '#6272a4',
    },
    dark: {
      bgApp: '#282a36', bgSurface: '#353746', textPrimary: '#f8f8f2',
      textSecondary: '#bfbfbf', textTertiary: '#6272a4', accent: '#bd93f9',
      onAccent: '#282a36', success: '#50fa7b', successSoft: '#44475a',
      border: '#44475a', highlight: '#44475a', toggleOff: '#6272a4',
    },
  },
  {
    id: 'nord', label: 'nord', modes: 'both',
    light: {
      bgApp: '#eceff4', bgSurface: '#ffffff', textPrimary: '#2e3440',
      textSecondary: '#4c566a', textTertiary: '#8b95a9', accent: '#5e81ac',
      onAccent: '#eceff4', success: '#5a7d5a', successSoft: '#e0e6ee',
      border: '#d8dee9', highlight: '#e5e9f0', toggleOff: '#c4cddc',
    },
    dark: {
      bgApp: '#2e3440', bgSurface: '#3b4252', textPrimary: '#eceff4',
      textSecondary: '#b8c0d1', textTertiary: '#7b8698', accent: '#88c0d0',
      onAccent: '#2e3440', success: '#a3be8c', successSoft: '#434c5e',
      border: '#434c5e', highlight: '#434c5e', toggleOff: '#4c566a',
    },
  },
  {
    id: 'gruvbox-dark', label: 'gruvbox', modes: 'dark',
    light: {
      bgApp: '#282828', bgSurface: '#3c3836', textPrimary: '#ebdbb2',
      textSecondary: '#bdae93', textTertiary: '#7c6f64', accent: '#fabd2f',
      onAccent: '#282828', success: '#b8bb26', successSoft: '#504945',
      border: '#504945', highlight: '#504945', toggleOff: '#665c54',
    },
    dark: {
      bgApp: '#282828', bgSurface: '#3c3836', textPrimary: '#ebdbb2',
      textSecondary: '#bdae93', textTertiary: '#7c6f64', accent: '#fabd2f',
      onAccent: '#282828', success: '#b8bb26', successSoft: '#504945',
      border: '#504945', highlight: '#504945', toggleOff: '#665c54',
    },
  },
  {
    id: 'tokyo-night', label: 'tokyo night', modes: 'dark',
    light: {
      bgApp: '#1a1b26', bgSurface: '#24283b', textPrimary: '#c0caf5',
      textSecondary: '#9aa0b8', textTertiary: '#565f89', accent: '#7aa2f7',
      onAccent: '#1a1b26', success: '#9ece6a', successSoft: '#2f3549',
      border: '#2f3549', highlight: '#2f3549', toggleOff: '#3b4261',
    },
    dark: {
      bgApp: '#1a1b26', bgSurface: '#24283b', textPrimary: '#c0caf5',
      textSecondary: '#9aa0b8', textTertiary: '#565f89', accent: '#7aa2f7',
      onAccent: '#1a1b26', success: '#9ece6a', successSoft: '#2f3549',
      border: '#2f3549', highlight: '#2f3549', toggleOff: '#3b4261',
    },
  },
  {
    id: 'rose-pine', label: 'rosé pine', modes: 'both',
    light: {
      bgApp: '#faf4ed', bgSurface: '#fffaf3', textPrimary: '#575279',
      textSecondary: '#6e6a86', textTertiary: '#9893a5', accent: '#907aa9',
      onAccent: '#faf4ed', success: '#3e8d5a', successSoft: '#f2e9e1',
      border: '#e4dfde', highlight: '#eaddd7', toggleOff: '#d3c9c2',
    },
    dark: {
      bgApp: '#191724', bgSurface: '#1f1d2e', textPrimary: '#e0def4',
      textSecondary: '#908caa', textTertiary: '#6e6a86', accent: '#c4a7e7',
      onAccent: '#191724', success: '#9ccfd8', successSoft: '#26233a',
      border: '#26233a', highlight: '#26233a', toggleOff: '#403d52',
    },
  },
  {
    id: 'solarized-light', label: 'solarized', modes: 'both',
    light: {
      bgApp: '#fdf6e3', bgSurface: '#eee8d5', textPrimary: '#586e75',
      textSecondary: '#657b83', textTertiary: '#93a1a1', accent: '#268bd2',
      onAccent: '#fdf6e3', success: '#4a7c43', successSoft: '#e6dfc8',
      border: '#ddd6c0', highlight: '#e6dfc8', toggleOff: '#ccc4a8',
    },
    dark: {
      bgApp: '#002b36', bgSurface: '#073642', textPrimary: '#eee8d5',
      textSecondary: '#b3c3c4', textTertiary: '#71909a', accent: '#2aa198',
      onAccent: '#002b36', success: '#859900', successSoft: '#0b3a43',
      border: '#0b4b56', highlight: '#0b3a43', toggleOff: '#17525d',
    },
  },
  {
    id: 'monokai', label: 'monokai', modes: 'dark',
    light: {
      bgApp: '#272822', bgSurface: '#3e3d32', textPrimary: '#f8f8f2',
      textSecondary: '#cfcfc2', textTertiary: '#75715e', accent: '#fd971f',
      onAccent: '#272822', success: '#a6e22e', successSoft: '#49483e',
      border: '#49483e', highlight: '#49483e', toggleOff: '#5e5c50',
    },
    dark: {
      bgApp: '#272822', bgSurface: '#3e3d32', textPrimary: '#f8f8f2',
      textSecondary: '#cfcfc2', textTertiary: '#75715e', accent: '#fd971f',
      onAccent: '#272822', success: '#a6e22e', successSoft: '#49483e',
      border: '#49483e', highlight: '#49483e', toggleOff: '#5e5c50',
    },
  },
  {
    id: 'everforest', label: 'everforest', modes: 'both',
    light: {
      bgApp: '#fffbef', bgSurface: '#f8f0dc', textPrimary: '#5c6a72',
      textSecondary: '#6d7b83', textTertiary: '#939f91', accent: '#7f8971',
      onAccent: '#fffbef', success: '#4c7a5b', successSoft: '#ede8d2',
      border: '#e0d8bd', highlight: '#ede8d2', toggleOff: '#d3c6aa',
    },
    dark: {
      bgApp: '#2d353b', bgSurface: '#343f44', textPrimary: '#d3c6aa',
      textSecondary: '#b8b095', textTertiary: '#7a8478', accent: '#a7c080',
      onAccent: '#2d353b', success: '#a7c080', successSoft: '#3d484d',
      border: '#3d484d', highlight: '#3d484d', toggleOff: '#4d5a5f',
    },
  },
]

export function themeDef(id: string): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}

/** Resolve a stored (palette, mode-setting) pair to a concrete Theme. */
export function resolvePalette(
  paletteId: string,
  modeSetting: 'light' | 'dark' | 'system',
  systemDark: boolean,
): { palette: Palette; dark: boolean; forcedDark: boolean } {
  const def = themeDef(paletteId)
  if (def.modes === 'dark') {
    return { palette: def.dark, dark: true, forcedDark: true }
  }
  const dark = modeSetting === 'dark' || (modeSetting === 'system' && systemDark)
  return { palette: dark ? def.dark : def.light, dark, forcedDark: false }
}

/** Emit the CSS-variable declarations for a palette (variable swap only). */
export function paletteCssVars(p: Palette): string {
  return [
    ['bg-app', p.bgApp],
    ['bg-surface', p.bgSurface],
    ['text-primary', p.textPrimary],
    ['text-secondary', p.textSecondary],
    ['text-tertiary', p.textTertiary],
    ['accent', p.accent],
    ['on-accent', p.onAccent],
    ['success', p.success],
    ['success-soft', p.successSoft],
    ['border', p.border],
    ['highlight', p.highlight],
    ['toggle-off', p.toggleOff],
  ]
    .map(([k, v]) => `  --color-${k}: ${v};`)
    .join('\n')
}

export function themeToTokens(
  p: Palette,
  mode: 'light' | 'dark',
  paletteId: Theme['paletteId'],
  forcedDark: boolean,
): Theme {
  return { ...p, mode, paletteId, forcedDark }
}
