import { ChromeStorage, DEFAULT_STORAGE, BlockedItem, Schedule, InterventionId } from '../types'

export async function getStorage(): Promise<ChromeStorage> {
  const result = await chrome.storage.local.get(null)
  return { ...DEFAULT_STORAGE, ...result } as ChromeStorage
}

export async function setStorage(partial: Partial<ChromeStorage>): Promise<void> {
  await chrome.storage.local.set(partial)
}

export async function getMasterToggle(): Promise<boolean> {
  const { masterToggle } = await chrome.storage.local.get('masterToggle')
  return (masterToggle as boolean) ?? DEFAULT_STORAGE.masterToggle
}

export async function setMasterToggle(value: boolean): Promise<void> {
  await chrome.storage.local.set({ masterToggle: value })
}

export async function getBlockedItems(): Promise<BlockedItem[]> {
  const { blockedItems } = await chrome.storage.local.get('blockedItems')
  return (blockedItems as BlockedItem[]) ?? DEFAULT_STORAGE.blockedItems
}

export async function addBlockedItem(item: BlockedItem): Promise<void> {
  const items = await getBlockedItems()
  items.push(item)
  await chrome.storage.local.set({ blockedItems: items })
}

export async function removeBlockedItem(id: string): Promise<void> {
  const items = await getBlockedItems()
  await chrome.storage.local.set({ blockedItems: items.filter(i => i.id !== id) })
}

export async function getStrictSession(): Promise<{ isActive: boolean; startTime: number; endTime: number }> {
  const { strictSession } = await chrome.storage.local.get('strictSession')
  return (strictSession as { isActive: boolean; startTime: number; endTime: number }) ?? DEFAULT_STORAGE.strictSession
}

export async function setStrictSession(session: { isActive: boolean; startTime: number; endTime: number }): Promise<void> {
  await chrome.storage.local.set({ strictSession: session })
}

export async function getSchedules(): Promise<Schedule[]> {
  const { schedules } = await chrome.storage.local.get('schedules')
  return (schedules as Schedule[]) ?? DEFAULT_STORAGE.schedules
}

export async function addSchedule(schedule: Schedule): Promise<void> {
  const schedules = await getSchedules()
  schedules.push(schedule)
  await chrome.storage.local.set({ schedules })
}

export async function updateSchedule(id: string, updates: Partial<Schedule>): Promise<void> {
  const schedules = await getSchedules()
  const idx = schedules.findIndex(s => s.id === id)
  if (idx !== -1) {
    schedules[idx] = { ...schedules[idx], ...updates }
    await chrome.storage.local.set({ schedules })
  }
}

export async function removeSchedule(id: string): Promise<void> {
  const schedules = await getSchedules()
  await chrome.storage.local.set({ schedules: schedules.filter(s => s.id !== id) })
}

export async function getSettings(): Promise<ChromeStorage['settings']> {
  const { settings } = await chrome.storage.local.get('settings')
  return (settings as ChromeStorage['settings']) ?? DEFAULT_STORAGE.settings
}

export async function setSettings(settings: Partial<ChromeStorage['settings']>): Promise<void> {
  const current = await getSettings()
  await chrome.storage.local.set({ settings: { ...current, ...settings } })
}

export async function getSelectedInterventions(): Promise<InterventionId[]> {
  const { selectedInterventions } = await chrome.storage.local.get('selectedInterventions')
  return (selectedInterventions as InterventionId[]) ?? DEFAULT_STORAGE.selectedInterventions
}

export async function setSelectedInterventions(ids: InterventionId[]): Promise<void> {
  await chrome.storage.local.set({ selectedInterventions: ids })
}

export async function getUsageStats(): Promise<ChromeStorage['usageStats']> {
  const { usageStats } = await chrome.storage.local.get('usageStats')
  return (usageStats as ChromeStorage['usageStats']) ?? DEFAULT_STORAGE.usageStats
}

export async function trackDomainUsage(domain: string, ms: number): Promise<void> {
  const stats = await getUsageStats()
  const today = new Date().toISOString().slice(0, 10)
  if (!stats[domain]) stats[domain] = []
  const todayEntry = stats[domain].find(e => e.date === today)
  if (todayEntry) {
    todayEntry.timeSpent += ms
  } else {
    stats[domain].push({ date: today, timeSpent: ms })
  }
  await chrome.storage.local.set({ usageStats: stats })
}
