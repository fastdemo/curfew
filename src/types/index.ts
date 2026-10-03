export interface BlockedItem {
  id: string
  type: 'website' | 'keyword'
  value: string
  /** Always-on list: blocked regardless of focus/schedule/strict. Absent in old installs = focus-only. */
  scope?: 'focus' | 'always'
}

export interface StrictSession {
  isActive: boolean
  startTime: number
  endTime: number
}

export interface Schedule {
  id: string
  name: string
  startTime: string
  endTime: string
  daysOfWeek: number[]
  isActive: boolean
}

export interface Settings {
  requirePin: boolean
  pinHash: string
  confirmTurnOff: boolean
  theme: 'light' | 'dark' | 'system'
  /** Color palette id (default 'curfew'). Absent in old installs = curfew. */
  palette?: ThemeId
}

export interface UsageStats {
  [domain: string]: {
    date: string
    timeSpent: number
  }[]
}

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

export type InterventionId = 'instant' | 'hold' | 'slide' | 'breathing'

export interface ChromeStorage {
  masterToggle: boolean
  blockedItems: BlockedItem[]
  selectedInterventions: InterventionId[]
  strictSession: StrictSession
  schedules: Schedule[]
  settings: Settings
  usageStats: UsageStats
  bypasses: { [domain: string]: number }
}

export const DEFAULT_STORAGE: ChromeStorage = {
  masterToggle: false,
  blockedItems: [],
  selectedInterventions: ['instant'],
  strictSession: { isActive: false, startTime: 0, endTime: 0 },
  schedules: [],
  settings: {
    requirePin: false,
    pinHash: '',
    confirmTurnOff: true,
    theme: 'system',
  },
  usageStats: {},
  bypasses: {},
}

export interface Intervention {
  id: InterventionId
  title: string
  time: string
  duration: number
}
