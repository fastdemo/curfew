import { getStorage, trackDomainUsage } from '../lib/storage'
import { shouldBlockUrl, isScheduleActive, getDomainFromUrl } from '../lib/interventions'

let activeTabId: number | null = null
let activeDomain: string | null = null
let activeUrl: string | null = null
let lastTickTime = Date.now()
const pausedDomains = new Set<string>()

async function tickTracking() {
  const now = Date.now()
  const elapsed = now - lastTickTime
  lastTickTime = now

  if (!activeDomain || elapsed <= 0 || elapsed >= 60000) return

  // pause tracking while overlay is active (site is blocked)
  if (pausedDomains.has(activeDomain)) return

  // also pause if the active url would be blocked right now (covers race where overlay not yet shown)
  try {
    if (activeUrl) {
      const storage = await getStorage()
      const strictActive = storage.strictSession.isActive && Date.now() < storage.strictSession.endTime
      const matchesBlocked = shouldBlockUrl(activeUrl, storage.blockedItems, strictActive ? undefined : storage.bypasses)
      if (matchesBlocked) {
        const scheduleActive = isScheduleActive(storage.schedules)
        const shouldBlock = strictActive || scheduleActive || storage.masterToggle
        if (shouldBlock) return
      }
    }
  } catch {
    // if storage check fails, fall through to track
  }

  await trackDomainUsage(activeDomain, elapsed)
}

async function updateActiveTab(tabId: number) {
  await tickTracking()
  activeTabId = tabId
  try {
    const tab = await chrome.tabs.get(tabId)
    if (tab.url && tab.url.startsWith('http')) {
      activeDomain = getDomainFromUrl(tab.url)
      activeUrl = tab.url
    } else {
      activeDomain = null
      activeUrl = null
    }
  } catch {
    activeDomain = null
    activeUrl = null
  }
}

setInterval(tickTracking, 1000)

async function reblockExpiredBypasses() {
  const result = await chrome.storage.local.get('bypasses')
  const bypasses = (result.bypasses as Record<string, number>) || {}
  const now = Date.now()
  const expiredDomains = Object.keys(bypasses).filter(d => bypasses[d] <= now)
  if (expiredDomains.length === 0) return

  const cleaned = { ...bypasses }
  for (const d of expiredDomains) delete cleaned[d]
  await chrome.storage.local.set({ bypasses: cleaned })

  try {
    const tabs = await chrome.tabs.query({})
    for (const tab of tabs) {
      if (tab.id && tab.url) {
        const domain = getDomainFromUrl(tab.url)
        if (expiredDomains.includes(domain)) {
          await handleNavigation(tab.id, tab.url)
        }
      }
    }
  } catch {
    // tabs query failed
  }
}

setInterval(reblockExpiredBypasses, 5000)

chrome.tabs.onActivated.addListener((activeInfo) => {
  updateActiveTab(activeInfo.tabId)
})

chrome.tabs.onRemoved.addListener(() => {
  // clean pausedDomains if no remaining tabs have that domain
  chrome.tabs.query({}, tabs => {
    const remaining = new Set<string>()
    for (const tab of tabs) {
      if (tab.url && tab.url.startsWith('http')) {
        try { remaining.add(getDomainFromUrl(tab.url)) } catch { /* ignore */ }
      }
    }
    for (const d of [...pausedDomains]) {
      if (!remaining.has(d)) pausedDomains.delete(d)
    }
  })
})

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    await tickTracking()
    const newUrl = changeInfo.url || tab.url
    if (newUrl && newUrl.startsWith('http')) {
      activeDomain = getDomainFromUrl(newUrl)
      activeUrl = newUrl
    } else {
      activeDomain = null
      activeUrl = null
    }
  } else if (tabId === activeTabId && tab.url) {
    // url may change without changeInfo.url (e.g. SPA)
    if (tab.url.startsWith('http')) {
      activeDomain = getDomainFromUrl(tab.url)
      activeUrl = tab.url
    }
  }
})

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await tickTracking()
    activeDomain = null
    activeUrl = null
    activeTabId = null
  } else {
    try {
      const tabs = await chrome.tabs.query({ active: true, windowId })
      if (tabs[0]?.id) await updateActiveTab(tabs[0].id)
    } catch {
      // query failed
    }
  }
})

async function reblockTabIfNeeded(storage: Awaited<ReturnType<typeof getStorage>>) {
  const strictActive = storage.strictSession.isActive && Date.now() < storage.strictSession.endTime
  const tabs = await chrome.tabs.query({})
  for (const tab of tabs) {
    if (tab.id && tab.url && shouldBlockUrl(tab.url, storage.blockedItems, strictActive ? undefined : storage.bypasses)) {
      await handleNavigation(tab.id, tab.url)
    }
  }
}

async function handleNavigation(tabId: number, url: string | undefined) {
  if (!url || !url.startsWith('http')) return

  const storage = await getStorage()
  const { blockedItems, strictSession, schedules, masterToggle } = storage

  const strictActive = strictSession.isActive && Date.now() < strictSession.endTime
  const matchesBlocked = shouldBlockUrl(url, blockedItems, strictActive ? undefined : storage.bypasses)
  if (!matchesBlocked) {
    const domain = getDomainFromUrl(url)
    pausedDomains.delete(domain)
    return
  }

  const scheduleActive = isScheduleActive(schedules)
  const shouldBlock = strictActive || scheduleActive || masterToggle

  if (!shouldBlock) {
    const domain = getDomainFromUrl(url)
    pausedDomains.delete(domain)
    return
  }

  // Redirect to our block page so the site's content never loads
  const domain = getDomainFromUrl(url)
  pausedDomains.add(domain)
  const blockUrl = chrome.runtime.getURL('block.html') + `?url=${encodeURIComponent(url)}`
  try {
    await chrome.tabs.update(tabId, { url: blockUrl })
    return
  } catch {
    // tabs.update failed (e.g. tab closed) — fall through to overlay fallback
  }

  // Fallback: try overlay if redirect failed
  const tryShowOverlay = async (attempt = 0): Promise<boolean> => {
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: 'CURFEW_SHOW_OVERLAY',
        url,
      })
      return true
    } catch {
      if (attempt === 0) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId },
            files: ['src/content/overlay.js'],
          })
        } catch {
          // ignore injection error (e.g. chrome:// URL)
        }
        await new Promise(res => setTimeout(res, 120))
        return tryShowOverlay(1)
      }
      return false
    }
  }

  try {
    const shown = await tryShowOverlay()
    if (!shown) {
      setTimeout(() => tryShowOverlay(1).catch(() => {}), 800)
    }
  } catch {
    // tab no longer exists or was closed
  }
}

function isHttpUrl(url: string | undefined): boolean {
  return !!url && url.startsWith('http')
}

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId === 0 && isHttpUrl(details.url)) {
    handleNavigation(details.tabId, details.url)
  }
})

chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId === 0 && isHttpUrl(details.url)) {
    handleNavigation(details.tabId, details.url)
  }
})

chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0 && isHttpUrl(details.url)) {
    handleNavigation(details.tabId, details.url)
  }
})

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.frameId === 0 && isHttpUrl(details.url)) {
    handleNavigation(details.tabId, details.url)
  }
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // catch SPA URL changes and reloads where webNavigation may not fire reliably
  const url = changeInfo.url || tab.url
  if (url && isHttpUrl(url)) {
    // only trigger if tab is active or URL changed
    if (changeInfo.url || changeInfo.status === 'complete') {
      handleNavigation(tabId, url)
    }
  }
})

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'CURFEW_RELOAD_BLOCKED_TABS') {
    getStorage().then(reblockTabIfNeeded).catch(() => {})
    return
  }
  if (message.type === 'CURFEW_CLOSE_CURRENT_TAB') {
    if (sender.tab?.id) {
      chrome.tabs.remove(sender.tab.id).catch(() => {})
    } else if (message.tabId) {
      chrome.tabs.remove(message.tabId).catch(() => {})
    }
    return
  }
  if (message.type === 'CURFEW_REQUEST_REBLOCK' && message.tabId && message.url) {
    handleNavigation(message.tabId, message.url).catch(() => {})
    return
  }
  if (message.type === 'CURFEW_OVERLAY_SHOWN' && message.domain) {
    pausedDomains.add(message.domain)
    return
  }
  if (message.type === 'CURFEW_OVERLAY_HIDDEN' && message.domain) {
    pausedDomains.delete(message.domain)
    // reset lastTickTime to avoid counting the overlay duration as elapsed
    lastTickTime = Date.now()
    return
  }
  if (message.type === 'CURFEW_OVERLAY_HIDDEN_ALL') {
    pausedDomains.clear()
    lastTickTime = Date.now()
    return
  }
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'curfew-tracking') {
    await tickTracking()
    reblockExpiredBypasses()
    return
  }

  if (alarm.name === 'curfew-strict-session') {
    const storage = await getStorage()
    if (storage.strictSession.isActive && Date.now() >= storage.strictSession.endTime) {
      await chrome.storage.local.set({
        strictSession: { isActive: false, startTime: 0, endTime: 0 },
      })
    }
  }

  if (alarm.name === 'curfew-schedule-check') {
    const storage = await getStorage()
    const active = isScheduleActive(storage.schedules)
    if (active) {
      await reblockTabIfNeeded(storage)
    }
  }
})

chrome.runtime.onStartup.addListener(() => {
  initOnWake()
})

chrome.runtime.onInstalled.addListener(() => {
  initOnWake()
})

initOnWake()

chrome.storage.onChanged.addListener((changes) => {
  if (changes.strictSession) {
    const session = changes.strictSession.newValue as { isActive: boolean; startTime: number; endTime: number } | undefined
    if (session?.isActive && session.endTime > Date.now()) {
      const delayMs = session.endTime - Date.now()
      chrome.alarms.create('curfew-strict-session', {
        delayInMinutes: Math.ceil(delayMs / 60000),
      })
    } else {
      chrome.alarms.clear('curfew-strict-session').catch(() => {})
    }
  }

  if (changes.bypasses) {
    const bypasses = (changes.bypasses.newValue as Record<string, number> | undefined) || {}
    const oldBypasses = (changes.bypasses.oldValue as Record<string, number> | undefined) || {}
    for (const domain of Object.keys(bypasses)) {
      if (bypasses[domain] > Date.now()) {
        pausedDomains.delete(domain)
      }
    }
    for (const domain of Object.keys(oldBypasses)) {
      if (!bypasses[domain] || bypasses[domain] <= Date.now()) {
        pausedDomains.delete(domain)
      }
    }
    lastTickTime = Date.now()
    reblockExpiredBypasses().catch(() => {})
  }

  if (changes.masterToggle && changes.masterToggle.newValue === false) {
    pausedDomains.clear()
    lastTickTime = Date.now()
  }

  if (changes.blockedItems) {
    lastTickTime = Date.now()
  }

  if (changes.schedules) {
    const schedules = changes.schedules.newValue as { startTime: string; endTime: string; daysOfWeek: number[]; isActive: boolean }[] | undefined
    if (schedules?.length) {
      chrome.alarms.create('curfew-schedule-check', {
        delayInMinutes: 1,
        periodInMinutes: 1,
      })
    } else {
      chrome.alarms.clear('curfew-schedule-check').catch(() => {})
    }
  }
})

async function checkStrictSessionOnStart() {
  const storage = await getStorage()
  if (storage.strictSession.isActive) {
    if (Date.now() >= storage.strictSession.endTime) {
      await chrome.storage.local.set({
        strictSession: { isActive: false, startTime: 0, endTime: 0 },
      })
    } else {
      chrome.alarms.create('curfew-strict-session', {
        delayInMinutes: Math.ceil((storage.strictSession.endTime - Date.now()) / 60000),
      })
    }
  }
}

async function migrateLegacyStorage() {
  try {
    const raw = await chrome.storage.local.get(null) as Record<string, unknown>
    const settings = raw.settings as Record<string, unknown> | undefined
    if (settings && 'overlayMode' in settings) {
      const cleaned = { ...settings }
      delete cleaned.overlayMode
      await chrome.storage.local.set({ settings: cleaned })
    }
  } catch { /* ignore */ }
}

async function initOnWake() {
  await migrateLegacyStorage()
  await checkStrictSessionOnStart()

  const existing = await chrome.alarms.get('curfew-tracking')
  if (!existing) {
    chrome.alarms.create('curfew-tracking', {
      delayInMinutes: 1,
      periodInMinutes: 1,
    })
  }

  const storage = await getStorage()
  if (storage.schedules.length > 0) {
    chrome.alarms.create('curfew-schedule-check', {
      delayInMinutes: 1,
      periodInMinutes: 1,
    })
  }

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tabs[0]?.id) updateActiveTab(tabs[0].id)
  } catch {
    // no active tab
  }
}
