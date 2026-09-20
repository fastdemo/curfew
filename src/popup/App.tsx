import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useStorage } from '../hooks/useStorage'
import { useTimer } from '../hooks/useTimer'
import { getDomainFromUrl, isScheduleActive } from '../lib/interventions'
import { getSettings } from '../lib/storage'
import { hashPin } from '../lib/pin'
import { ThemeProvider } from '../ui/ThemeProvider'
import { Shell } from '../ui/Shell'
import { HomeScreen } from '../screens/HomeScreen'
import { BlockedScreen } from '../screens/BlockedScreen'
import { StrictScreen } from '../screens/StrictScreen'

export type TabId = 'home' | 'blocked' | 'strict' | 'schedule' | 'settings'

type PinOverlayKind =
  | { type: 'setup' }
  | { type: 'verify-end-session' }
  | { type: 'verify-disable-pin' }
  | { type: 'verify-disable-master' }

function NavIcon({ tab }: { tab: TabId }) {
  const props = {
    width: 17,
    height: 17,
    fill: 'none' as const,
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    strokeWidth: 1.8,
  }
  switch (tab) {
    case 'home':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    case 'blocked':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75a8.25 8.25 0 018.25 8.25c0 4.97-4.03 9-9 9s-9-4.03-9-9a8.25 8.25 0 018.25-8.25M12 7.5v3m0 3h.01" />
        </svg>
      )
    case 'strict':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m9 0a3 3 0 013 3v3a3 3 0 01-3 3h-9a3 3 0 01-3-3v-3a3 3 0 013-3m9 0H7.5" />
        </svg>
      )
    case 'schedule':
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75M3 12h18" />
        </svg>
      )
    case 'settings':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
  }
}

const TABS: TabId[] = ['home', 'blocked', 'strict', 'schedule', 'settings']

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const storage = useStorage()
  const { now, getRemaining, formatTime } = useTimer()
  const [activeDomain, setActiveDomain] = useState('')
  const [pinOverlay, setPinOverlay] = useState<PinOverlayKind | null>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = mainRef.current
    if (el) el.scrollTop = 0
  }, [activeTab])

  useEffect(() => {
    const refresh = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs[0]?.url) {
          setActiveDomain(getDomainFromUrl(tabs[0].url))
        } else {
          setActiveDomain('')
        }
      })
    }
    refresh()
    const interval = setInterval(refresh, 1000)
    const tabListener = () => refresh()
    try {
      chrome.tabs.onActivated.addListener(tabListener)
      chrome.tabs.onUpdated.addListener(tabListener as never)
    } catch { /* ignore */ }
    return () => {
      clearInterval(interval)
      try {
        chrome.tabs.onActivated.removeListener(tabListener)
        chrome.tabs.onUpdated.removeListener(tabListener as never)
      } catch { /* ignore */ }
    }
  }, [])

  const isStrictActive = useMemo(
    () => storage.strictSession.isActive && now < storage.strictSession.endTime,
    [storage.strictSession.isActive, storage.strictSession.endTime, now]
  )
  const strictRemaining = getRemaining(storage.strictSession.endTime)
  const isStrictLive = isStrictActive && strictRemaining > 0

  const blocking = useMemo(
    () => storage.masterToggle || isStrictLive || isScheduleActive(storage.schedules),
    [storage.masterToggle, isStrictLive, storage.schedules]
  )

  const graceEndTime = activeDomain ? storage.bypasses?.[activeDomain] : 0
  const hasGracePeriod = !!graceEndTime && graceEndTime > now
  const graceRemaining = hasGracePeriod ? graceEndTime - now : 0

  const showTimer = isStrictLive || (hasGracePeriod && graceRemaining > 0)
  const timerMode = isStrictLive ? 'strict' : 'bypass'
  const timerLabel = isStrictLive ? formatTime(strictRemaining) : formatTime(graceRemaining)

  useEffect(() => {
    const theme = storage.settings.theme
    const root = document.documentElement
    // System mode: match OS on load AND on change; explicit modes pin .dark.
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const applySystem = () => root.classList.toggle('dark', mq.matches)
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      applySystem()
    }
    const handler = () => {
      // Re-read the current setting so an explicit light/dark choice made
      // while this listener lives is never overridden by the OS.
      const current = storage.settings.theme
      if (current === 'system') applySystem()
      else root.classList.toggle('dark', current === 'dark')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [storage.settings.theme])

  /* ── PIN overlay callbacks (logic unchanged from pre-rebuild) ── */

  const hidePinOverlay = useCallback(() => setPinOverlay(null), [])

  const endStrictSession = useCallback(async () => {
    const settings = await getSettings()
    if (settings.confirmTurnOff && !window.confirm('End the strict focus session?')) return
    await storage.update({ strictSession: { isActive: false, startTime: 0, endTime: 0 } })
    chrome.runtime.sendMessage({ type: 'CURFEW_RELOAD_BLOCKED_TABS' })
  }, [storage])

  const handleEndSessionRequest = useCallback(() => {
    getSettings().then(settings => {
      if (settings.requirePin && settings.pinHash) {
        setPinOverlay({ type: 'verify-end-session' })
      } else {
        endStrictSession()
      }
    })
  }, [endStrictSession])

  const handleRequirePinToggle = useCallback(() => {
    if (storage.settings.requirePin) {
      setPinOverlay({ type: 'verify-disable-pin' })
    } else {
      if (storage.settings.pinHash) {
        storage.update({ settings: { ...storage.settings, requirePin: true } })
      } else {
        setPinOverlay({ type: 'setup' })
      }
    }
  }, [storage])

  const handleSetupComplete = useCallback(async (pin: string) => {
    await storage.update({
      settings: { ...storage.settings, pinHash: await hashPin(pin), requirePin: true },
    })
    setPinOverlay(null)
  }, [storage])

  const handleVerifyEndSession = useCallback(() => {
    setPinOverlay(null)
    endStrictSession()
  }, [endStrictSession])

  const handleVerifyDisablePin = useCallback(async () => {
    setPinOverlay(null)
    await storage.update({
      settings: { ...storage.settings, requirePin: false },
    })
  }, [storage])

  const disableMaster = useCallback(async () => {
    const settings = await getSettings()
    if (settings.confirmTurnOff && !window.confirm('Turn off focus mode?')) return
    await storage.update({ masterToggle: false })
  }, [storage])

  const handleToggleMaster = useCallback(async () => {
    if (storage.strictSession.isActive && now < storage.strictSession.endTime) return

    const enable = !storage.masterToggle
    if (enable) {
      await storage.update({ masterToggle: true })
      chrome.runtime.sendMessage({ type: 'CURFEW_RELOAD_BLOCKED_TABS' })
      return
    }

    const settings = await getSettings()
    if (settings.requirePin && settings.pinHash) {
      setPinOverlay({ type: 'verify-disable-master' })
      return
    }
    disableMaster()
  }, [storage, now, disableMaster])

  // Pin overlay + remaining screens land in the follow-up pass.
  // Reference pending logic so it stays compiled.
  void handleRequirePinToggle
  void handleSetupComplete
  void handleVerifyEndSession
  void handleVerifyDisablePin
  void disableMaster
  void hidePinOverlay

  const status = showTimer
    ? timerMode === 'strict'
      ? `locked · ${timerLabel}`
      : `bypass · ${timerLabel}`
    : blocking
      ? 'active'
      : null

  return (
    <ThemeProvider>
      <Shell
        mascotUrl={chrome.runtime.getURL('icons/anko128.png')}
        onMascot={() => chrome.tabs.create({ url: 'https://github.com/fastdemo/curfew' })}
        status={status}
        tabs={TABS.map((id) => ({ id, label: id, icon: <NavIcon tab={id} /> }))}
        activeTab={activeTab}
        onTab={(id) => setActiveTab(id as TabId)}
        mainRef={mainRef}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activeTab === 'home' && (
            <HomeScreen storage={storage} onToggleMaster={handleToggleMaster} />
          )}
          {activeTab === 'blocked' && <BlockedScreen storage={storage} />}
          {activeTab === 'strict' && (
            <StrictScreen storage={storage} onEndSession={handleEndSessionRequest} />
          )}
          {!['home', 'blocked', 'strict'].includes(activeTab) && pinOverlay === null && (
            <p style={{ fontSize: 12, opacity: 0.6, margin: 0 }}>
              {activeTab} screen lands in the next pass.
            </p>
          )}
          {pinOverlay !== null && (
            <p style={{ fontSize: 12, opacity: 0.6, margin: 0 }}>
              pin overlay lands in the next pass.
            </p>
          )}
        </div>
      </Shell>
    </ThemeProvider>
  )
}
