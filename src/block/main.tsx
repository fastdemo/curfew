import React from 'react'
import ReactDOM from 'react-dom/client'
import BlockScreen from './BlockScreen'
import '../index.css'
import { getStorage } from '../lib/storage'
import { getRandomIntervention, getDomainFromUrl } from '../lib/interventions'
import { useState, useEffect } from 'react'

function applyTheme(theme: string) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches)
  }
}

function BlockPage() {
  const [domain, setDomain] = useState('')
  const [interventionId, setInterventionId] = useState('')
  const [timeSpent, setTimeSpent] = useState(0)
  const [usageStats, setUsageStats] = useState<Record<string, { date: string; timeSpent: number }[]>>({})
  const [openTabId, setOpenTabId] = useState<number | null>(null)
  const [originalUrl, setOriginalUrl] = useState('')
  const [theme, setTheme] = useState('light')
  const [canProceed, setCanProceed] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const url = params.get('url') || ''
    setOriginalUrl(url)

    getStorage().then(storage => {
      const domainName = getDomainFromUrl(url)
      setDomain(domainName)
      setUsageStats(storage.usageStats)
      setCanProceed(storage.selectedInterventions.length > 0)

      const today = new Date().toISOString().slice(0, 10)
      const domainStats = storage.usageStats[domainName]
      const todayEntry = domainStats?.find((e: any) => e.date === today)
      setTimeSpent(todayEntry?.timeSpent || 0)

      const picked = getRandomIntervention(storage.selectedInterventions)
      setInterventionId(picked.id)

      setTheme(storage.settings.theme)
      applyTheme(storage.settings.theme)
    })

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.id) setOpenTabId(tabs[0].id)
    })
  }, [])

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
    const interval = setInterval(async () => {
      const storage = await getStorage()
      const today = new Date().toISOString().slice(0, 10)
      const domainStats = storage.usageStats[domain]
      const todayEntry = domainStats?.find((e: any) => e.date === today)
      setTimeSpent(todayEntry?.timeSpent || 0)
    }, 1000)
    return () => clearInterval(interval)
  }, [domain])

  useEffect(() => {
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (!originalUrl) return

      if (changes.settings) {
        const t = (changes.settings.newValue as { theme: string }).theme
        setTheme(t)
        applyTheme(t)
      }

      if (changes.masterToggle && changes.masterToggle.newValue === false) {
        window.location.assign(originalUrl)
        return
      }

      if (changes.strictSession) {
        const newSession = changes.strictSession.newValue as { isActive: boolean; startTime: number; endTime: number }
        if (!newSession.isActive || Date.now() >= newSession.endTime) {
          window.location.assign(originalUrl)
          return
        }
      }

      if (changes.schedules) {
        const newSchedules = changes.schedules.newValue as { startTime: string; endTime: string; daysOfWeek: number[]; isActive: boolean }[]
        if (!newSchedules || newSchedules.length === 0 || !newSchedules.some(s => s.isActive)) {
          getStorage().then(storage => {
            if (!storage.masterToggle && !storage.strictSession.isActive) {
              window.location.assign(originalUrl)
            }
          })
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

  return (
    <BlockScreen
      domain={domain}
      interventionId={interventionId}
      timeSpent={timeSpent}
      usageStats={usageStats}
      onCloseTab={handleCloseTab}
      onProceed={handleProceed}
      canProceed={canProceed}
    />
  )
}

const rootEl = document.getElementById('root')
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <BlockPage />
    </React.StrictMode>
  )
}
