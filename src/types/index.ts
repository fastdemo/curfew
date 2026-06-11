export interface BlockedItem {
  id: string
  type: 'website' | 'keyword'
  value: string
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
  overlayMode: boolean
  requirePin: boolean
  pinHash: string
  confirmTurnOff: boolean
  theme: 'light' | 'dark' | 'system'
}

export interface UsageStats {
  [domain: string]: {
    date: string
    timeSpent: number
  }[]
}

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
    overlayMode: false,
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
