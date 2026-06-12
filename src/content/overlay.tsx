import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useState, useEffect } from 'react'
import { getStorage } from '../lib/storage'
import { getRandomIntervention, getDomainFromUrl } from '../lib/interventions'
import BlockScreen from '../block/BlockScreen'

let shadowHost: HTMLDivElement | null = null
let timeInterval: ReturnType<typeof setInterval> | null = null
let reactRoot: Root | null = null

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'CURFEW_SHOW_OVERLAY') {
    if (shadowHost) return
    showOverlay(message.url)
  }
  if (message.type === 'CURFEW_HIDE_OVERLAY') {
    cleanupOverlay()
  }
})

chrome.storage.onChanged.addListener((changes) => {
  if (!shadowHost) return

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
}

function OverlayApp({ url }: { url: string }) {
  const domain = getDomainFromUrl(url)
  const [domain_, setDomain_] = useState(domain)
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
      const todayEntry = domainStats?.find((e: any) => e.date === today)
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
      const todayEntry = domainStats?.find((e: any) => e.date === today)
      setTimeSpent(todayEntry?.timeSpent || 0)
    }, 1000)
    return () => clearInterval(interval)
  }, [domain])

  const handleCloseTab = () => {
    chrome.runtime.sendMessage({ type: 'CURFEW_CLOSE_CURRENT_TAB' })
  }

  const handleProceed = async (dom: string) => {
    const result = await chrome.storage.local.get('bypasses')
    const bypasses = (result.bypasses as { [domain: string]: number }) || {}
    bypasses[dom] = Date.now() + 60 * 1000
    await chrome.storage.local.set({ bypasses })
    cleanupOverlay()
    window.location.href = `https://${dom}`
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

  const isDark = document.documentElement.classList.contains('dark')

  const resetStyle = document.createElement('style')
  resetStyle.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :host { all: initial; display: block; font-family: 'DM Sans', sans-serif; }
  `
  shadow.appendChild(resetStyle)

  const themeStyle = document.createElement('style')
  themeStyle.textContent = `
    :host {
      --color-surface: ${isDark ? '#1A1715' : '#FDFBF7'};
      --color-surface-secondary: ${isDark ? '#2D2824' : '#EFEAE2'};
      --color-surface-tertiary: ${isDark ? '#3D352E' : '#E5DDD3'};
      --color-border: ${isDark ? '#4D4339' : '#DDD5CB'};
      --color-text-primary: ${isDark ? '#F3EEEA' : '#4A3E3D'};
      --color-text-secondary: ${isDark ? '#D5CEC6' : '#6B5E58'};
      --color-text-muted: ${isDark ? '#A89C8E' : '#7A6E67'};
      --color-accent: #8B7E74;
      --color-menu-item-bg: ${isDark ? '#2D2824' : '#EFEAE2'};
      --color-menu-item-text: ${isDark ? '#F3EEEA' : '#4A3E3D'};
      --color-circle-low: ${isDark ? '#2D2824' : '#EFEAE2'};
      --color-circle-med: ${isDark ? '#8B7E74' : '#B0A695'};
      --color-circle-high: ${isDark ? '#F3EEEA' : '#4A3E3D'};
    }
  `
  shadow.appendChild(themeStyle)

  const mountPoint = document.createElement('div')
  mountPoint.style.cssText = 'width: 100%; height: 100%;'
  shadow.appendChild(mountPoint)

  document.documentElement.appendChild(shadowHost)

  reactRoot = createRoot(mountPoint)
  reactRoot.render(<OverlayApp url={url} />)
}
