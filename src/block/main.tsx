import React from 'react'
import ReactDOM from 'react-dom/client'
import { getStorage } from '../lib/storage'
import { getRandomIntervention, getDomainFromUrl, isScheduleActive } from '../lib/interventions'
import { useState, useEffect } from 'react'

function applyTheme(theme: string) {
  // UI STRIPPED (full rebuild, step 1). Theme system deleted — keep the
  // resolved mode on <html> only so a future theme can hook in.
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches)
  }
}

// UI STRIPPED (full rebuild, step 1). No markup below — logic preserved intact.
// UI contract for the rebuild (block page):
// - reads ?url= (encoded or raw), derives `domain`.
// - loads usageStats, picks a random intervention from selectedInterventions,
//   sets `canProceed = selectedInterventions.length > 0`.
// - polls today's timeSpent for `domain` every 1s; sets tab title
//   "<domain> / curfew-ed!" + curfew favicon.
// - auto-returns to originalUrl when blocking ends (master off / strict
//   expired / schedule inactive / bypass granted).
// - actions: `handleCloseTab` (remove tab + close), `handleProceed`
//   (60s bypass for domain, then navigate to originalUrl).
export function BlockPage() {
  const [domain, setDomain] = useState('')
  const [interventionId, setInterventionId] = useState('')
  const [timeSpent, setTimeSpent] = useState(0)
  const [usageStats, setUsageStats] = useState<Record<string, { date: string; timeSpent: number }[]>>({})
  const [openTabId, setOpenTabId] = useState<number | null>(null)
  const [originalUrl] = useState(() => {
    const href = window.location.href
    const idx = href.indexOf('?url=')
    if (idx !== -1) {
      const raw = href.substring(idx + 5)
      // raw may be encoded (tabs.update) or raw (DNR); handle both
      try {
        return raw.includes('%') ? decodeURIComponent(raw) : raw
      } catch {
        return raw
      }
    }
    return new URLSearchParams(window.location.search).get('url') || ''
  })
  const [theme, setTheme] = useState('light')
  const [canProceed, setCanProceed] = useState(true)

  useEffect(() => {
    getStorage().then(storage => {
      const domainName = getDomainFromUrl(originalUrl)
      setDomain(domainName)
      setUsageStats(storage.usageStats)
      setCanProceed(storage.selectedInterventions.length > 0)

      const today = new Date().toISOString().slice(0, 10)
      const domainStats = storage.usageStats[domainName]
      const todayEntry = domainStats?.find((e: { date: string; timeSpent: number }) => e.date === today)
      setTimeSpent(todayEntry?.timeSpent || 0)

      const picked = getRandomIntervention(storage.selectedInterventions)
      setInterventionId(picked.id)

      setTheme(storage.settings.theme)
      applyTheme(storage.settings.theme)
    })

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.id) setOpenTabId(tabs[0].id)
    })
  }, [originalUrl])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  useEffect(() => {
    if (!domain) return
    // Apply favicon and tab title as requested: "YouTube / curfew-ed!"
    const title = `${domain} / curfew-ed!`
    document.title = title
    // favicon
    const existing = document.querySelector<HTMLLinkElement>('link[rel*="icon"]')
    if (existing) existing.remove()
    const link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/png'
    link.href = chrome.runtime.getURL('icons/anko128.png')
    document.head.appendChild(link)

    const interval = setInterval(async () => {
      const storage = await getStorage()
      const today = new Date().toISOString().slice(0, 10)
      const domainStats = storage.usageStats[domain]
      const todayEntry = domainStats?.find((e: { date: string; timeSpent: number }) => e.date === today)
      setTimeSpent(todayEntry?.timeSpent || 0)
      // keep title/favicons enforced while on block page
      if (document.title !== title) document.title = title
      if (!document.querySelector(`link[href="${link.href}"]`)) {
        document.head.appendChild(link)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [domain])

  useEffect(() => {
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (!originalUrl) return

      if (changes.settings) {
        const t = (changes.settings.newValue as { theme: string } | undefined)?.theme
        if (t) {
          setTheme(t)
          applyTheme(t)
        }
      }

      if (changes.masterToggle && changes.masterToggle.newValue === false) {
        getStorage().then(storage => {
          const isStrictActive = storage.strictSession.isActive && Date.now() < storage.strictSession.endTime
          if (!isStrictActive && !isScheduleActive(storage.schedules)) {
            window.location.assign(originalUrl)
          }
        })
        return
      }

      if (changes.strictSession) {
        const newSession = changes.strictSession.newValue as { isActive: boolean; startTime: number; endTime: number } | undefined
        if (!newSession?.isActive || Date.now() >= newSession.endTime) {
          getStorage().then(storage => {
            if (!storage.masterToggle && !isScheduleActive(storage.schedules)) {
              window.location.assign(originalUrl)
            }
          })
          return
        }
      }

      if (changes.schedules) {
        getStorage().then(storage => {
          const isStrictActive = storage.strictSession.isActive && Date.now() < storage.strictSession.endTime
          if (!storage.masterToggle && !isStrictActive && !isScheduleActive(storage.schedules)) {
            window.location.assign(originalUrl)
          }
        })
      }

      if (changes.bypasses) {
        const bypasses = (changes.bypasses.newValue as Record<string, number> | undefined) || {}
        const dom = getDomainFromUrl(originalUrl)
        if (bypasses[dom] && bypasses[dom] > Date.now()) {
          window.location.assign(originalUrl)
        }
      }
    }

    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [originalUrl])

  const handleCloseTab = async () => {
    if (openTabId) {
      try {
        await chrome.tabs.remove(openTabId)
      } catch {
        // tab already closed
      }
    }
    window.close()
  }

  const handleProceed = async (dom: string) => {
    if (!dom || !originalUrl) return
    const result = await chrome.storage.local.get('bypasses')
    const bypasses = (result.bypasses as { [domain: string]: number }) || {}
    bypasses[dom] = Date.now() + 60 * 1000
    await chrome.storage.local.set({ bypasses })
    window.location.href = originalUrl
  }

  // Values below are consumed by UI that does not exist yet (see contract at
  // top). Reference them so the logic stays compiled and reviewable.
  void domain
  void interventionId
  void timeSpent
  void usageStats
  void canProceed
  void handleCloseTab
  void handleProceed

  return null
}

const rootEl = document.getElementById('root')
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <BlockPage />
    </React.StrictMode>
  )
}
