import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useState, useEffect } from 'react'
import { getStorage } from '../lib/storage'
import { getRandomIntervention, getDomainFromUrl } from '../lib/interventions'
import { cssVarsFor } from '../lib/theme'
import BlockScreen from '../block/BlockScreen'

let shadowHost: HTMLDivElement | null = null
let timeInterval: ReturnType<typeof setInterval> | null = null
let reactRoot: Root | null = null
let themeStyle: HTMLStyleElement | null = null

function overlayThemeCss(theme: 'light' | 'dark' | 'system') {
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolved: 'light' | 'dark' = theme === 'dark' || (theme === 'system' && systemDark) ? 'dark' : 'light'
  return `
    :host {
      ${cssVarsFor(resolved)}
    }
  `
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'CURFEW_SHOW_OVERLAY') {
    if (shadowHost) return
    showOverlay(message.url)
  }
})

chrome.storage.onChanged.addListener((changes) => {
  if (!shadowHost) return

  if (changes.settings) {
    const theme = (changes.settings.newValue as { theme: 'light' | 'dark' | 'system' } | undefined)?.theme
    if (theme && themeStyle) {
      themeStyle.textContent = overlayThemeCss(theme)
    }
  }

  if (changes.masterToggle && changes.masterToggle.newValue === false) {
    cleanupOverlay()
    return
  }

  if (changes.strictSession) {
    const s = changes.strictSession.newValue as { isActive: boolean; startTime: number; endTime: number }
    if (!s.isActive || Date.now() >= s.endTime) {
      cleanupOverlay()
      return
    }
  }

  if (changes.schedules) {
    getStorage().then(storage => {
      if (!shadowHost) return
      if (!storage.masterToggle && !storage.strictSession.isActive) {
        cleanupOverlay()
      }
    })
  }
})

function cleanupOverlay() {
  if (timeInterval) {
    clearInterval(timeInterval)
    timeInterval = null
  }
  if (reactRoot) {
    reactRoot.unmount()
    reactRoot = null
  }
  shadowHost?.remove()
  shadowHost = null
  themeStyle = null
}

export function OverlayApp({ url }: { url: string }) {
  const domain = getDomainFromUrl(url)
  const domain_ = domain
  const [interventionId, setInterventionId] = useState('instant')
  const [timeSpent, setTimeSpent] = useState(0)
  const [usageStats, setUsageStats] = useState<Record<string, { date: string; timeSpent: number }[]>>({})
  const [canProceed, setCanProceed] = useState(true)

  useEffect(() => {
    getStorage().then(storage => {
      setUsageStats(storage.usageStats)
      setCanProceed(storage.selectedInterventions.length > 0)
      const today = new Date().toISOString().slice(0, 10)
      const domainStats = storage.usageStats[domain]
      const todayEntry = domainStats?.find((e: { date: string; timeSpent: number }) => e.date === today)
      setTimeSpent(todayEntry?.timeSpent || 0)
      const picked = getRandomIntervention(storage.selectedInterventions)
      setInterventionId(picked.id)
    })
  }, [domain])

  useEffect(() => {
    if (!domain) return
    const interval = setInterval(async () => {
      const storage = await getStorage()
      const today = new Date().toISOString().slice(0, 10)
      const domainStats = storage.usageStats[domain]
      const todayEntry = domainStats?.find((e: { date: string; timeSpent: number }) => e.date === today)
      setTimeSpent(todayEntry?.timeSpent || 0)
    }, 1000)
    return () => clearInterval(interval)
  }, [domain])

  const handleCloseTab = () => {
    chrome.runtime.sendMessage({ type: 'CURFEW_CLOSE_CURRENT_TAB' })
  }

  const handleProceed = async () => {
    const result = await chrome.storage.local.get('bypasses')
    const bypasses = (result.bypasses as { [domain: string]: number }) || {}
    bypasses[domain] = Date.now() + 60 * 1000
    await chrome.storage.local.set({ bypasses })
    cleanupOverlay()
    window.location.reload()
  }

  return (
    <BlockScreen
      domain={domain_}
      interventionId={interventionId}
      timeSpent={timeSpent}
      usageStats={usageStats}
      onCloseTab={handleCloseTab}
      onProceed={handleProceed}
      canProceed={canProceed}
    />
  )
}

function showOverlay(url: string) {
  shadowHost = document.createElement('div')
  shadowHost.style.cssText = 'position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 2147483647;'

  const shadow = shadowHost.attachShadow({ mode: 'closed' })

  getStorage().then(storage => {
    if (!shadowHost || !themeStyle) return
    themeStyle.textContent = overlayThemeCss(storage.settings.theme)
  })

  const resetStyle = document.createElement('style')
  resetStyle.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :host { all: initial; display: block; font-family: 'DM Sans', sans-serif; }
  `
  shadow.appendChild(resetStyle)

  themeStyle = document.createElement('style')
  themeStyle.textContent = overlayThemeCss('system')
  shadow.appendChild(themeStyle)

  const mountPoint = document.createElement('div')
  mountPoint.style.cssText = 'width: 100%; height: 100%;'
  shadow.appendChild(mountPoint)

  document.documentElement.appendChild(shadowHost)

  reactRoot = createRoot(mountPoint)
  reactRoot.render(<OverlayApp url={url} />)
}
