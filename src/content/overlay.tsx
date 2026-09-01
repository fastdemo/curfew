import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useState, useEffect } from 'react'
import { getStorage } from '../lib/storage'
import { getRandomIntervention, getDomainFromUrl, isScheduleActive, shouldBlockUrl } from '../lib/interventions'
import { cssVarsFor } from '../lib/theme'
import BlockScreen from '../block/BlockScreen'

let shadowHost: HTMLDivElement | null = null
let reactRoot: Root | null = null
let themeStyle: HTMLStyleElement | null = null
let currentOverlayUrl: string | null = null

const HIDE_STYLE_ID = 'curfew-hide-style'
function injectHide() {
  if (window.top !== window) return
  if (document.getElementById(HIDE_STYLE_ID)) return
  const s = document.createElement('style')
  s.id = HIDE_STYLE_ID
  s.textContent = 'body{display:none !important}'
  const parent = document.head || document.documentElement
  if (parent) parent.appendChild(s)
  if (document.body) document.body.style.display = 'none'
}
function removeHide() {
  document.getElementById(HIDE_STYLE_ID)?.remove()
  if (document.body) document.body.style.display = ''; document.body.style.visibility = ''
  document.documentElement.style.visibility = ''
}

// Initial check: if this page is blocked, show overlay immediately
if (window.top === window && window.location.href.startsWith('http')) {
  getStorage().then(storage => {
    const url = window.location.href
    const strictActive = storage.strictSession.isActive && Date.now() < storage.strictSession.endTime
    const matches = shouldBlockUrl(url, storage.blockedItems, strictActive ? undefined : storage.bypasses)
    if (!matches) return
    const scheduleActive = isScheduleActive(storage.schedules)
    const shouldBlock = strictActive || scheduleActive || storage.masterToggle
    if (shouldBlock && !shadowHost) {
      try { window.stop() } catch { void 0 }
      showOverlay(url)
    }
  }).catch(() => {})
}

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
    if (shadowHost) {
      if (message.url && message.url !== currentOverlayUrl) {
        cleanupOverlay()
        showOverlay(message.url)
      }
      return
    }
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
    getStorage().then(storage => {
      if (!shadowHost) return
      const isStrictActive = storage.strictSession.isActive && Date.now() < storage.strictSession.endTime
      if (!isStrictActive && !isScheduleActive(storage.schedules)) {
        cleanupOverlay()
      }
    })
    return
  }

  if (changes.strictSession) {
    const s = changes.strictSession.newValue as { isActive: boolean; startTime: number; endTime: number } | undefined
    if (!s?.isActive || Date.now() >= s.endTime) {
      getStorage().then(storage => {
        if (!shadowHost) return
        if (!storage.masterToggle && !isScheduleActive(storage.schedules)) {
          cleanupOverlay()
        }
      })
      return
    }
  }

  if (changes.schedules) {
    const p = getStorage().then(storage => {
      if (!shadowHost) return
      if (storage.masterToggle || (storage.strictSession.isActive && Date.now() < storage.strictSession.endTime)) return
      if (!isScheduleActive(storage.schedules)) {
        cleanupOverlay()
      }
    })
    p.catch(() => {})
  }
  if (changes.bypasses) {
    const bypasses = (changes.bypasses.newValue as Record<string, number> | undefined) || {}
    if (currentOverlayUrl) {
      const domain = getDomainFromUrl(currentOverlayUrl)
      if (bypasses[domain] && bypasses[domain] > Date.now()) {
        cleanupOverlay()
      }
    }
  }
})

function cleanupOverlay() {
  const prevUrl = currentOverlayUrl
  const prevDomain = prevUrl ? getDomainFromUrl(prevUrl) : null
  if (reactRoot) {
    reactRoot.unmount()
    reactRoot = null
  }
  if (shadowHost) {
    const prevOverflow = (shadowHost as unknown as { __prevOverflow?: string }).__prevOverflow
    const prevBodyOverflow = (shadowHost as unknown as { __prevBodyOverflow?: string }).__prevBodyOverflow
    const prevTitle = (shadowHost as unknown as { __prevTitle?: string }).__prevTitle
    const prevFavicons = (shadowHost as unknown as { __prevFavicons?: { el: HTMLLinkElement; href: string | null }[] }).__prevFavicons
    const curfewIcon = (shadowHost as unknown as { __curfewIcon?: HTMLLinkElement }).__curfewIcon
    const titleGuard = (shadowHost as unknown as { __titleGuard?: ReturnType<typeof setInterval> }).__titleGuard
    if (titleGuard) clearInterval(titleGuard)
    if (prevOverflow !== undefined) document.documentElement.style.overflow = prevOverflow
    if (prevBodyOverflow !== undefined && document.body) document.body.style.overflow = prevBodyOverflow
    if (prevTitle !== undefined) document.title = prevTitle
    if (curfewIcon) curfewIcon.remove()
    if (prevFavicons) {
      const head = document.head || document.documentElement
      prevFavicons.forEach(({ el }) => {
        try { head.appendChild(el) } catch { void 0 }
      })
    }
  }
  shadowHost?.remove()
  shadowHost = null
  themeStyle = null
  currentOverlayUrl = null
  removeHide()
  if (prevDomain) {
    try {
      chrome.runtime.sendMessage({ type: 'CURFEW_OVERLAY_HIDDEN', domain: prevDomain })
    } catch { void 0 }
  }
}

export function OverlayApp({ url }: { url: string }) {
  const domain = getDomainFromUrl(url)
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

function showOverlay(url: string) {
  currentOverlayUrl = url
  try { window.stop() } catch { void 0 }
  injectHide()
  const host = document.createElement('div')
  host.style.cssText = 'position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 2147483647; visibility: visible !important; background: #FBF9F5;'
  shadowHost = host

  const shadow = host.attachShadow({ mode: 'closed' })

  const fallback = document.createElement('div')
  fallback.textContent = 'Curfew — time to focus'
  fallback.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;font-family:sans-serif;font-size:22px;font-weight:800;color:#2D2824;background:#FBF9F5;z-index:1;padding:20px;text-align:center;'
  const fallbackSub = document.createElement('div')
  fallbackSub.textContent = 'If you see this, overlay shadow is working'
  fallbackSub.style.cssText = 'font-size:14px;font-weight:400;color:#7D7570;'
  fallback.appendChild(fallbackSub)
  shadow.appendChild(fallback)

  const fontFaceStyle = document.createElement('style')
  try {
    const base = chrome.runtime.getURL('fonts/')
    fontFaceStyle.textContent = `
      @font-face { font-family: 'Sora'; font-style: normal; font-weight: 400; font-display: swap; src: url('${base}Sora-400.ttf') format('truetype'); }
      @font-face { font-family: 'Sora'; font-style: normal; font-weight: 600; font-display: swap; src: url('${base}Sora-600.ttf') format('truetype'); }
      @font-face { font-family: 'Sora'; font-style: normal; font-weight: 700; font-display: swap; src: url('${base}Sora-700.ttf') format('truetype'); }
      @font-face { font-family: 'Sora'; font-style: normal; font-weight: 800; font-display: swap; src: url('${base}Sora-800.ttf') format('truetype'); }
      @font-face { font-family: 'DM Sans'; font-style: normal; font-weight: 400; font-display: swap; src: url('${base}DMSans-400.ttf') format('truetype'); }
      @font-face { font-family: 'DM Sans'; font-style: normal; font-weight: 500; font-display: swap; src: url('${base}DMSans-500.ttf') format('truetype'); }
      @font-face { font-family: 'DM Sans'; font-style: normal; font-weight: 600; font-display: swap; src: url('${base}DMSans-600.ttf') format('truetype'); }
      @font-face { font-family: 'DM Sans'; font-style: italic; font-weight: 400; font-display: swap; src: url('${base}DMSans-400Italic.ttf') format('truetype'); }
    `
  } catch {
    fontFaceStyle.textContent = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');`
  }
  shadow.appendChild(fontFaceStyle)

  const fontLink = document.createElement('link')
  fontLink.rel = 'stylesheet'
  try {
    fontLink.href = chrome.runtime.getURL('fonts/fonts.css')
  } catch {
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap'
  }
  shadow.appendChild(fontLink)

  const resetStyle = document.createElement('style')
  resetStyle.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :host { all: initial; display: block; font-family: 'DM Sans', sans-serif; }
    :host * { font-family: 'DM Sans', sans-serif; }
  `
  shadow.appendChild(resetStyle)

  themeStyle = document.createElement('style')
  themeStyle.textContent = overlayThemeCss('system')
  shadow.appendChild(themeStyle)

  try {
    const base = chrome.runtime.getURL('fonts/')
    const fontsToLoad: { family: string; weight: string; style: string; file: string }[] = [
      { family: 'Sora', weight: '400', style: 'normal', file: 'Sora-400.ttf' },
      { family: 'Sora', weight: '600', style: 'normal', file: 'Sora-600.ttf' },
      { family: 'Sora', weight: '700', style: 'normal', file: 'Sora-700.ttf' },
      { family: 'Sora', weight: '800', style: 'normal', file: 'Sora-800.ttf' },
      { family: 'DM Sans', weight: '400', style: 'normal', file: 'DMSans-400.ttf' },
      { family: 'DM Sans', weight: '500', style: 'normal', file: 'DMSans-500.ttf' },
      { family: 'DM Sans', weight: '600', style: 'normal', file: 'DMSans-600.ttf' },
      { family: 'DM Sans', weight: '400', style: 'italic', file: 'DMSans-400Italic.ttf' },
    ]
    for (const f of fontsToLoad) {
      fetch(base + f.file).then(r => r.arrayBuffer()).then(buf => {
        try {
          const ff = new FontFace(f.family, buf, { weight: f.weight, style: f.style as FontFaceDescriptors['style'] })
          ff.load().then(loaded => {
            try { (document as unknown as { fonts: FontFaceSet }).fonts.add(loaded) } catch { void 0 }
          }).catch(() => {})
        } catch { void 0 }
      }).catch(() => {})
    }
  } catch { void 0 }

  getStorage().then(storage => {
    if (!themeStyle) return
    themeStyle.textContent = overlayThemeCss(storage.settings.theme)
  })

  const mountPoint = document.createElement('div')
  mountPoint.style.cssText = 'width: 100%; height: 100%; position: relative; z-index: 2;'
  shadow.appendChild(mountPoint)

  const prevTitle = document.title
  const faviconLinks = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel*="icon"]'))
  const prevFavicons: { el: HTMLLinkElement; href: string | null }[] = faviconLinks.map(el => ({ el, href: el.href }))
  faviconLinks.forEach(el => el.remove())
  const curfewIcon = document.createElement('link')
  curfewIcon.rel = 'icon'
  curfewIcon.type = 'image/png'
  let curfewIconHref = ''
  try {
    curfewIconHref = chrome.runtime.getURL('icons/anko128.png')
    curfewIcon.href = curfewIconHref
  } catch {
    curfewIcon.href = ''
  }
  const head = document.head || document.documentElement
  if (curfewIcon.href && head) head.appendChild(curfewIcon)
  const displayDomain = getDomainFromUrl(url)
  const curfewTitle = `${displayDomain} / curfew-ed!`
  document.title = curfewTitle
  const titleGuard = setInterval(() => {
    if (!shadowHost) { clearInterval(titleGuard); return }
    if (document.title !== curfewTitle) {
      document.title = curfewTitle
    }
    const currentIcons = document.querySelectorAll<HTMLLinkElement>('link[rel*="icon"]')
    let hasCurfew = false
    currentIcons.forEach(el => { if (el.href === curfewIconHref) hasCurfew = true })
    if (!hasCurfew && curfewIconHref && head) {
      currentIcons.forEach(el => el.remove())
      try { head.appendChild(curfewIcon) } catch { void 0 }
    }
  }, 300)
  ;(host as unknown as { __titleGuard?: ReturnType<typeof setInterval> }).__titleGuard = titleGuard

  document.documentElement.appendChild(host)
  const prevOverflow = document.documentElement.style.overflow
  const prevBodyOverflow = document.body ? document.body.style.overflow : ''
  document.documentElement.style.overflow = 'hidden'
  if (document.body) document.body.style.overflow = 'hidden'
  ;(host as unknown as { __prevOverflow: string }).__prevOverflow = prevOverflow
  ;(host as unknown as { __prevBodyOverflow: string }).__prevBodyOverflow = prevBodyOverflow
  ;(host as unknown as { __prevTitle: string }).__prevTitle = prevTitle
  ;(host as unknown as { __prevFavicons: typeof prevFavicons }).__prevFavicons = prevFavicons
  ;(host as unknown as { __curfewIcon: HTMLLinkElement }).__curfewIcon = curfewIcon

  reactRoot = createRoot(mountPoint)
  try {
    reactRoot.render(<OverlayApp url={url} />)
  } catch (e) {
    console.error('[Curfew] overlay render failed', e)
  }
  setTimeout(() => { try { fallback.remove() } catch { void 0 } }, 900)

  try {
    chrome.runtime.sendMessage({ type: 'CURFEW_OVERLAY_SHOWN', domain: getDomainFromUrl(url) })
  } catch { void 0 }
}
