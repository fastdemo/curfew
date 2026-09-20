import type { Theme } from '../ui/theme'

export type ThemeId =
  | 'curfew'
  | 'catppuccin-latte'
  | 'catppuccin-frappe'
  | 'catppuccin-macchiato'
  | 'catppuccin-mocha'
  | 'dracula'
  | 'everforest'
  | 'everforest-dark'
  | 'gruvbox-dark'
  | 'gruvbox-light'
  | 'kanagawa'
  | 'monokai'
  | 'nord'
  | 'one-dark'
  | 'rose-pine'
  | 'solarized-dark'
  | 'solarized-light'
  | 'tokyo-night'
  | 'tokyo-night-light'

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
  /**
   * Which appearances the palette supports:
   * - 'both': real light + dark variants, follows the auto/light/dark switch
   * - 'dark': dark-only by nature (mocha, dracula, …) — mode pins to dark
   * - 'light': light-only by nature (latte, gruvbox light, …) — pins to light
   */
  modes: 'both' | 'dark' | 'light'
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
  // — Catppuccin: all four flavors. Latte is the real light variant;
  // frappé / macchiato / mocha are dark-only and pin the mode switch.
  {
    id: 'catppuccin-latte', label: 'catppuccin latte', modes: 'light',
    // dark rosy text / vivid mauve accent on milky latte #eff1f5
    light: {
      bgApp: '#eff1f5', bgSurface: '#e6e9ef', textPrimary: '#4c4f69',
      textSecondary: '#5c5f77', textTertiary: '#8c8fa1', accent: '#8839ef',
      onAccent: '#eff1f5', success: '#40a02b', successSoft: '#ccd0da',
      border: '#ccd0da', highlight: '#ccd0da', toggleOff: '#bcc0cc',
    },
    dark: {
      bgApp: '#eff1f5', bgSurface: '#e6e9ef', textPrimary: '#4c4f69',
      textSecondary: '#5c5f77', textTertiary: '#8c8fa1', accent: '#8839ef',
      onAccent: '#eff1f5', success: '#40a02b', successSoft: '#ccd0da',
      border: '#ccd0da', highlight: '#ccd0da', toggleOff: '#bcc0cc',
    },
  },
  {
    id: 'catppuccin-frappe', label: 'catppuccin frappé', modes: 'dark',
    // cool lavender text / soft mauve accent on mid-dark frappé #303446
    light: {
      bgApp: '#303446', bgSurface: '#414559', textPrimary: '#c6d0f5',
      textSecondary: '#a5adce', textTertiary: '#737994', accent: '#ca9ee6',
      onAccent: '#303446', success: '#a6d189', successSoft: '#51576d',
      border: '#51576d', highlight: '#51576d', toggleOff: '#626880',
    },
    dark: {
      bgApp: '#303446', bgSurface: '#414559', textPrimary: '#c6d0f5',
      textSecondary: '#a5adce', textTertiary: '#737994', accent: '#ca9ee6',
      onAccent: '#303446', success: '#a6d189', successSoft: '#51576d',
      border: '#51576d', highlight: '#51576d', toggleOff: '#626880',
    },
  },
  {
    id: 'catppuccin-macchiato', label: 'catppuccin macchiato', modes: 'dark',
    // pale periwinkle text / bright mauve accent on #24273a
    light: {
      bgApp: '#24273a', bgSurface: '#363a4f', textPrimary: '#cad3f5',
      textSecondary: '#a5adcb', textTertiary: '#6e738d', accent: '#c6a0f6',
      onAccent: '#24273a', success: '#a6da95', successSoft: '#494d64',
      border: '#494d64', highlight: '#494d64', toggleOff: '#5b6078',
    },
    dark: {
      bgApp: '#24273a', bgSurface: '#363a4f', textPrimary: '#cad3f5',
      textSecondary: '#a5adcb', textTertiary: '#6e738d', accent: '#c6a0f6',
      onAccent: '#24273a', success: '#a6da95', successSoft: '#494d64',
      border: '#494d64', highlight: '#494d64', toggleOff: '#5b6078',
    },
  },
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
    id: 'gruvbox-dark', label: 'gruvbox dark', modes: 'dark',
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
    id: 'gruvbox-light', label: 'gruvbox light', modes: 'light',
    // dark-brown text / burnt-orange accent on warm paper #fbf1c7
    light: {
      bgApp: '#fbf1c7', bgSurface: '#f2e5bc', textPrimary: '#3c3836',
      textSecondary: '#5a524c', textTertiary: '#928374', accent: '#af3a03',
      onAccent: '#fbf1c7', success: '#4c7a3f', successSoft: '#ebdbb2',
      border: '#d5c4a1', highlight: '#ebdbb2', toggleOff: '#c9b896',
    },
    dark: {
      bgApp: '#fbf1c7', bgSurface: '#f2e5bc', textPrimary: '#3c3836',
      textSecondary: '#5a524c', textTertiary: '#928374', accent: '#af3a03',
      onAccent: '#fbf1c7', success: '#4c7a3f', successSoft: '#ebdbb2',
      border: '#d5c4a1', highlight: '#ebdbb2', toggleOff: '#c9b896',
    },
  },
  {
    id: 'tokyo-night', label: 'tokyo night storm', modes: 'dark',
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
    id: 'tokyo-night-light', label: 'tokyo night day', modes: 'light',
    // deep ink text / blue accent on warm paper #e1e2e7
    light: {
      bgApp: '#e1e2e7', bgSurface: '#d0d3dd', textPrimary: '#3760bf',
      textSecondary: '#6172b0', textTertiary: '#8b93b8', accent: '#2e7de9',
      onAccent: '#e1e2e7', success: '#587539', successSoft: '#c4c8da',
      border: '#c4c8da', highlight: '#c4c8da', toggleOff: '#a8aecb',
    },
    dark: {
      bgApp: '#e1e2e7', bgSurface: '#d0d3dd', textPrimary: '#3760bf',
      textSecondary: '#6172b0', textTertiary: '#8b93b8', accent: '#2e7de9',
      onAccent: '#e1e2e7', success: '#587539', successSoft: '#c4c8da',
      border: '#c4c8da', highlight: '#c4c8da', toggleOff: '#a8aecb',
    },
  },
  {
    id: 'rose-pine', label: 'rosé pine moon', modes: 'both',
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
    id: 'solarized-light', label: 'solarized light', modes: 'light',
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
    id: 'solarized-dark', label: 'solarized dark', modes: 'dark',
    // warm off-white text / cyan accent on deep teal #002b36
    light: {
      bgApp: '#002b36', bgSurface: '#073642', textPrimary: '#eee8d5',
      textSecondary: '#b3c3c4', textTertiary: '#71909a', accent: '#2aa198',
      onAccent: '#002b36', success: '#859900', successSoft: '#0b3a43',
      border: '#0b4b56', highlight: '#0b3a43', toggleOff: '#17525d',
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
    id: 'everforest', label: 'everforest light', modes: 'light',
    // green-grey text / moss accent on warm paper #fffbef
    light: {
      bgApp: '#fffbef', bgSurface: '#f8f0dc', textPrimary: '#5c6a72',
      textSecondary: '#6d7b83', textTertiary: '#939f91', accent: '#7f8971',
      onAccent: '#fffbef', success: '#4c7a5b', successSoft: '#ede8d2',
      border: '#e0d8bd', highlight: '#ede8d2', toggleOff: '#d3c6aa',
    },
    dark: {
      bgApp: '#fffbef', bgSurface: '#f8f0dc', textPrimary: '#5c6a72',
      textSecondary: '#6d7b83', textTertiary: '#939f91', accent: '#7f8971',
      onAccent: '#fffbef', success: '#4c7a5b', successSoft: '#ede8d2',
      border: '#e0d8bd', highlight: '#ede8d2', toggleOff: '#d3c6aa',
    },
  },
  {
    id: 'everforest-dark', label: 'everforest dark', modes: 'dark',
    // straw text / soft-green accent on deep forest #2d353b
    light: {
      bgApp: '#2d353b', bgSurface: '#343f44', textPrimary: '#d3c6aa',
      textSecondary: '#b8b095', textTertiary: '#7a8478', accent: '#a7c080',
      onAccent: '#2d353b', success: '#a7c080', successSoft: '#3d484d',
      border: '#3d484d', highlight: '#3d484d', toggleOff: '#4d5a5f',
    },
    dark: {
      bgApp: '#2d353b', bgSurface: '#343f44', textPrimary: '#d3c6aa',
      textSecondary: '#b8b095', textTertiary: '#7a8478', accent: '#a7c080',
      onAccent: '#2d353b', success: '#a7c080', successSoft: '#3d484d',
      border: '#3d484d', highlight: '#3d484d', toggleOff: '#4d5a5f',
    },
  },
  {
    id: 'kanagawa', label: 'kanagawa', modes: 'dark',
    // warm wave-white text / sakura-pink accent on sumi ink #1f1f28
    light: {
      bgApp: '#1f1f28', bgSurface: '#2a2a37', textPrimary: '#dcd7ba',
      textSecondary: '#b8b09a', textTertiary: '#727169', accent: '#d27e99',
      onAccent: '#1f1f28', success: '#98bb6c', successSoft: '#363646',
      border: '#363646', highlight: '#363646', toggleOff: '#54546d',
    },
    dark: {
      bgApp: '#1f1f28', bgSurface: '#2a2a37', textPrimary: '#dcd7ba',
      textSecondary: '#b8b09a', textTertiary: '#727169', accent: '#d27e99',
      onAccent: '#1f1f28', success: '#98bb6c', successSoft: '#363646',
      border: '#363646', highlight: '#363646', toggleOff: '#54546d',
    },
  },
  {
    id: 'one-dark', label: 'one dark', modes: 'dark',
    // atom grey-blue text / signature blue accent on #282c34
    light: {
      bgApp: '#282c34', bgSurface: '#353b45', textPrimary: '#abb2bf',
      textSecondary: '#979eab', textTertiary: '#5c6370', accent: '#61afef',
      onAccent: '#282c34', success: '#98c379', successSoft: '#3e4451',
      border: '#3e4451', highlight: '#3e4451', toggleOff: '#545862',
    },
    dark: {
      bgApp: '#282c34', bgSurface: '#353b45', textPrimary: '#abb2bf',
      textSecondary: '#979eab', textTertiary: '#5c6370', accent: '#61afef',
      onAccent: '#282c34', success: '#98c379', successSoft: '#3e4451',
      border: '#3e4451', highlight: '#3e4451', toggleOff: '#545862',
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
  if (def.modes === 'light') {
    return { palette: def.light, dark: false, forcedDark: true }
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
