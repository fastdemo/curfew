import { getStorage, trackDomainUsage } from '../lib/storage'
import { shouldBlockUrl, isScheduleActive, getDomainFromUrl } from '../lib/interventions'

let activeTabId: number | null = null
let activeDomain: string | null = null
let lastTickTime = Date.now()

async function tickTracking() {
  const now = Date.now()
  const elapsed = now - lastTickTime
  lastTickTime = now

  if (activeDomain && elapsed > 0 && elapsed < 60000) {
    await trackDomainUsage(activeDomain, elapsed)
  }
}

async function updateActiveTab(tabId: number) {
  await tickTracking()
  activeTabId = tabId
  try {
    const tab = await chrome.tabs.get(tabId)
    if (tab.url && tab.url.startsWith('http')) {
      activeDomain = getDomainFromUrl(tab.url)
    } else {
      activeDomain = null
    }
  } catch {
    activeDomain = null
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

  const storage = await getStorage()
  const strictActive = storage.strictSession.isActive && now < storage.strictSession.endTime
  chrome.tabs.query({}, tabs => {
    tabs.forEach(tab => {
      if (tab.id && tab.url) {
        const domain = getDomainFromUrl(tab.url)
        if (expiredDomains.includes(domain)) {
          handleNavigation(tab.id, tab.url)
        }
      }
    })
  })
}

setInterval(reblockExpiredBypasses, 5000)

chrome.tabs.onActivated.addListener((activeInfo) => {
  updateActiveTab(activeInfo.tabId)
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    if (tab.url && tab.url.startsWith('http')) {
      activeDomain = getDomainFromUrl(tab.url)
    } else {
      activeDomain = null
    }
  }
})

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    tickTracking()
    activeDomain = null
    activeTabId = null
  } else {
    chrome.tabs.query({ active: true, windowId }, (tabs) => {
      if (tabs[0]?.id) updateActiveTab(tabs[0].id)
    })
  }
})

async function handleNavigation(tabId: number, url: string | undefined) {
  if (!url || !url.startsWith('http')) return

  const storage = await getStorage()
  const { blockedItems, strictSession, schedules, masterToggle } = storage

  const strictActive = strictSession.isActive && Date.now() < strictSession.endTime
  const matchesBlocked = shouldBlockUrl(url, blockedItems, strictActive ? undefined : storage.bypasses)
  if (!matchesBlocked) return

  const scheduleActive = isScheduleActive(schedules)
  const shouldBlock = strictActive || scheduleActive || masterToggle

  if (!shouldBlock) return

  try {
    if (storage.settings.overlayMode) {
      try {
        await chrome.tabs.sendMessage(tabId, {
          type: 'CURFEW_SHOW_OVERLAY',
          url,
        })
      } catch {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['src/content/overlay.js'],
        })
        try {
          await chrome.tabs.sendMessage(tabId, {
            type: 'CURFEW_SHOW_OVERLAY',
            url,
          })
        } catch {
          // content script still not reachable
        }
      }
    } else {
      const blockUrl = chrome.runtime.getURL('block.html') + `?url=${encodeURIComponent(url)}`
      await chrome.tabs.update(tabId, { url: blockUrl })
    }
  } catch {
    // tab no longer exists or was closed
  }
}

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId === 0) {
    handleNavigation(details.tabId, details.url)
  }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CURFEW_UNBLOCK') {
    chrome.tabs.update(message.tabId, { url: message.url })
    sendResponse({ success: true })
  }
  if (message.type === 'CURFEW_CHECK_BLOCKED') {
    getStorage().then(storage => {
      const blocked = shouldBlockUrl(message.url, storage.blockedItems, storage.bypasses)
      sendResponse({ blocked })
    })
    return true
  }
  if (message.type === 'CURFEW_TRACK_USAGE') {
    trackDomainUsage(message.domain, message.ms)
  }
  if (message.type === 'CURFEW_RELOAD_BLOCKED_TABS') {
    getStorage().then(storage => {
      const strictActive = storage.strictSession.isActive && Date.now() < storage.strictSession.endTime
      chrome.tabs.query({}, tabs => {
        tabs.forEach(tab => {
          if (tab.id && tab.url && shouldBlockUrl(tab.url, storage.blockedItems, strictActive ? undefined : storage.bypasses)) {
            handleNavigation(tab.id, tab.url)
          }
        })
      })
    })
  }
  if (message.type === 'CURFEW_CLOSE_CURRENT_TAB') {
    if (sender.tab?.id) {
      chrome.tabs.remove(sender.tab.id)
    }
  }
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
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
    if (!storage.masterToggle && !storage.strictSession.isActive) {
      const active = isScheduleActive(storage.schedules)
      if (!active && storage.masterToggle) {
        await chrome.storage.local.set({ masterToggle: false })
      }
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
    const session = changes.strictSession.newValue as { isActive: boolean; startTime: number; endTime: number }
    if (session?.isActive && session?.endTime > Date.now()) {
      const delayMs = session.endTime - Date.now()
      chrome.alarms.create('curfew-strict-session', {
        delayInMinutes: Math.ceil(delayMs / 60000),
      })
    }
  }

  if (changes.bypasses) {
    reblockExpiredBypasses()
  }

  if (changes.schedules) {
    const schedules = changes.schedules.newValue as { startTime: string; endTime: string; daysOfWeek: number[]; isActive: boolean }[]
    if (schedules?.length) {
      chrome.alarms.create('curfew-schedule-check', {
        delayInMinutes: 1,
        periodInMinutes: 1,
      })
    } else {
      chrome.alarms.clear('curfew-schedule-check')
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

async function initOnWake() {
  await checkStrictSessionOnStart()

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
