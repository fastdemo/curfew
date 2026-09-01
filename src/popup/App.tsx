import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useStorage } from '../hooks/useStorage'
import { useTimer } from '../hooks/useTimer'
import { getDomainFromUrl, isScheduleActive } from '../lib/interventions'
import { getSettings } from '../lib/storage'
import { hashPin } from '../lib/pin'
import Header from './components/Header'
import FooterNav from './components/FooterNav'
import HomeTab from './HomeTab'
import BlockedListTab from './BlockedListTab'
import StrictSessionTab from './StrictSessionTab'
import ScheduleTab from './ScheduleTab'
import SettingsTab from './SettingsTab'
import PinOverlay from './PinOverlay'

export type TabId = 'home' | 'blocked' | 'strict' | 'schedule' | 'settings'

type PinOverlayKind =
  | { type: 'setup' }
  | { type: 'verify-end-session' }
  | { type: 'verify-disable-pin' }
  | { type: 'verify-disable-master' }

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const storage = useStorage()
  const { now, getRemaining, formatTime } = useTimer()
  const [activeDomain, setActiveDomain] = useState('')
  const [pinOverlay, setPinOverlay] = useState<PinOverlayKind | null>(null)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
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

    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      if (mq.matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      const handler = (e: MediaQueryListEvent) => {
        if (e.matches) root.classList.add('dark')
        else root.classList.remove('dark')
      }
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [storage.settings.theme])

  /* ── PIN overlay callbacks ── */

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

  /* ── PinOverlay renderer ── */

  const renderPinOverlay = () => {
    if (!pinOverlay) return null

    if (pinOverlay.type === 'setup') {
      return (
        <PinOverlay
          mode="setup"
          onSetupComplete={handleSetupComplete}
          onCancel={hidePinOverlay}
        />
      )
    }

    if (pinOverlay.type === 'verify-end-session') {
      return (
        <PinOverlay
          mode="verify"
          pinHash={storage.settings.pinHash}
          prompt="enter pin to disable focus session"
          onVerified={handleVerifyEndSession}
          onCancel={hidePinOverlay}
        />
      )
    }

    if (pinOverlay.type === 'verify-disable-pin') {
      return (
        <PinOverlay
          mode="verify"
          pinHash={storage.settings.pinHash}
          prompt="enter pin to disable protection"
          onVerified={handleVerifyDisablePin}
          onCancel={hidePinOverlay}
        />
      )
    }

    if (pinOverlay.type === 'verify-disable-master') {
      return (
        <PinOverlay
          mode="verify"
          pinHash={storage.settings.pinHash}
          prompt="enter pin to turn off focus mode"
          onVerified={disableMaster}
          onCancel={hidePinOverlay}
        />
      )
    }

    return null
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab storage={storage} onToggleMaster={handleToggleMaster} />
      case 'blocked':
        return <BlockedListTab storage={storage} />
      case 'strict':
        return <StrictSessionTab storage={storage} onEndSession={handleEndSessionRequest} />
      case 'schedule':
        return <ScheduleTab storage={storage} />
      case 'settings':
        return <SettingsTab storage={storage} onRequirePinToggle={handleRequirePinToggle} />
    }
  }

  return (
    <div
      style={{
        width: 'var(--popup-width)',
        minWidth: 'var(--popup-width)',
        maxWidth: 'var(--popup-width)',
        minHeight: 'var(--popup-min-height)',
        height: 'var(--popup-min-height)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <Header
        blocking={blocking}
        showTimer={showTimer}
        timerMode={timerMode}
        timerLabel={timerLabel}
      />
      <main
        ref={mainRef}
        style={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
          padding: 'var(--popup-pad-y)',
        }}
      >
        <div className="w-full mx-auto max-w-full flex flex-col" style={{ padding: '0 var(--popup-pad-x)', gap: '8px' }}>
          {renderTab()}
        </div>
      </main>
      <FooterNav activeTab={activeTab} onTabChange={setActiveTab} />
      {renderPinOverlay()}
    </div>
  )
}