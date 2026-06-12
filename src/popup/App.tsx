import { useState, useEffect, useMemo, useCallback } from 'react'
import { useStorage } from '../hooks/useStorage'
import { useTimer } from '../hooks/useTimer'
import { getDomainFromUrl } from '../lib/interventions'
import { getSettings } from '../lib/storage'
import BottomNav from './BottomNav'
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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const storage = useStorage()
  const { now, getRemaining, formatTime } = useTimer()
  const [isHovered, setIsHovered] = useState(false)
  const [activeDomain, setActiveDomain] = useState('')
  const [pinOverlay, setPinOverlay] = useState<PinOverlayKind | null>(null)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]?.url) {
        setActiveDomain(getDomainFromUrl(tabs[0].url))
      }
    })
  }, [])

  const isStrictActive = useMemo(
    () => storage.strictSession.isActive && now < storage.strictSession.endTime,
    [storage.strictSession.isActive, storage.strictSession.endTime, now]
  )
  const strictRemaining = getRemaining(storage.strictSession.endTime)
  const isStrictLive = isStrictActive && strictRemaining > 0

  const graceEndTime = activeDomain ? storage.bypasses?.[activeDomain] : 0
  const hasGracePeriod = !!graceEndTime && graceEndTime > now
  const graceRemaining = hasGracePeriod ? graceEndTime - now : 0

  const showTimer = isStrictLive || (hasGracePeriod && graceRemaining > 0)
  const timerMode = isStrictLive ? 'strict' : 'bypass'
  const timerLabel = isStrictLive ? formatTime(strictRemaining) : formatTime(graceRemaining)
  const timerHoverLabel = isStrictLive ? `locked for ${timerLabel}` : `unlocked for ${timerLabel}`

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

  const handleEndSessionRequest = useCallback(() => {
    getSettings().then(settings => {
      if (settings.requirePin && settings.pinHash) {
        setPinOverlay({ type: 'verify-end-session' })
      } else {
        storage.update({ strictSession: { isActive: false, startTime: 0, endTime: 0 } })
        chrome.runtime.sendMessage({ type: 'CURFEW_RELOAD_BLOCKED_TABS' })
      }
    })
  }, [storage])

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
      settings: { ...storage.settings, pinHash: pin, requirePin: true },
    })
    setPinOverlay(null)
  }, [storage])

  const handleVerifyEndSession = useCallback(async () => {
    setPinOverlay(null)
    await storage.update({
      strictSession: { isActive: false, startTime: 0, endTime: 0 },
    })
    chrome.runtime.sendMessage({ type: 'CURFEW_RELOAD_BLOCKED_TABS' })
  }, [storage])

  const handleVerifyDisablePin = useCallback(async () => {
    setPinOverlay(null)
    await storage.update({
      settings: { ...storage.settings, requirePin: false },
    })
  }, [storage])

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

    return null
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab storage={storage} />
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
    <div className="flex flex-col h-[600px]" style={{ position: 'relative' }}>
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingLeft: '4px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <img
              src={chrome.runtime.getURL('icons/anko128.png')}
              alt="Logo"
              style={{ width: '48px', height: '48px', objectFit: 'contain' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'anko128.png'
              }}
            />
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: '24px', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>
              curfew
            </h1>
          </div>
          {showTimer && (
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                padding: '4px 12px',
                borderRadius: '9999px',
                whiteSpace: 'nowrap',
                background: timerMode === 'strict' ? 'var(--color-surface-secondary)' : 'var(--color-accent)',
                color: timerMode === 'strict' ? 'var(--color-accent)' : '#1A1715',
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {isHovered ? timerHoverLabel : timerLabel}
            </div>
          )}
        </div>
        {renderTab()}
      </div>
      <div className="shrink-0">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      {renderPinOverlay()}
    </div>
  )
}
