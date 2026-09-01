import { useMemo, useState } from 'react'
import { ChromeStorage } from '../types'
import { useTimer } from '../hooks/useTimer'
import { useTheme } from '../lib/theme-context'
import SectionHeader from './components/SectionHeader'
import StatusPill from './components/StatusPill'

interface StrictSessionTabProps {
  storage: ChromeStorage & { loading: boolean; update: (p: Partial<ChromeStorage>) => Promise<void> }
  onEndSession?: () => void
}

interface DurationOption {
  min: number
  label: string
  sub: string
}

const DURATIONS: DurationOption[] = [
  { min: 1, label: '1 min', sub: 'quick reset' },
  { min: 10, label: '10 min', sub: 'coffee break' },
  { min: 20, label: '20 min', sub: 'deep focus' },
  { min: 30, label: '30 min', sub: 'full session' },
]

export default function StrictSessionTab({ storage, onEndSession }: StrictSessionTabProps) {
  const theme = useTheme()
  const { now, getRemaining, formatTime } = useTimer()
  const [selectedMin, setSelectedMin] = useState<number>(20)

  const isActive = storage.strictSession.isActive && now < storage.strictSession.endTime
  const remaining = getRemaining(storage.strictSession.endTime)

  const totalDuration = useMemo(() => {
    if (!isActive) return 0
    return storage.strictSession.endTime - storage.strictSession.startTime
  }, [isActive, storage.strictSession.startTime, storage.strictSession.endTime])

  const elapsed = useMemo(() => {
    if (!isActive || totalDuration === 0) return 0
    return Math.max(0, Math.min(1, (now - storage.strictSession.startTime) / totalDuration))
  }, [isActive, totalDuration, storage.strictSession.startTime, now])

  const progress = Math.round(elapsed * 100)

  const websiteCount = storage.blockedItems.filter(i => i.type === 'website').length
  const keywordCount = storage.blockedItems.filter(i => i.type === 'keyword').length
  const hasItems = websiteCount + keywordCount > 0

  const startSession = async (minutes: number) => {
    if (!hasItems) return
    const start = Date.now()
    const endTime = start + minutes * 60 * 1000
    await storage.update({
      strictSession: { isActive: true, startTime: start, endTime },
    })
    chrome.runtime.sendMessage({ type: 'CURFEW_RELOAD_BLOCKED_TABS' })
  }

  return (
    <div className="flex flex-col" style={{ gap: '6px' }}>
      <section>
        <SectionHeader title="strict session" subtitle="nothing gets through until the timer ends" />
        <div
          className="flex items-center justify-between"
          style={{ padding: '8px 10px', backgroundColor: theme.surface, border: `1px solid ${theme.borderSoft}`, borderRadius: '8px' }}
        >
          <div className="flex items-center" style={{ gap: '8px' }}>
            <span
              className="flex items-center justify-center"
              style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: theme.highlight, color: theme.textPrimary }}
            >
              <LockIcon size={13} color={theme.textPrimary} />
            </span>
            <div className="flex flex-col text-left">
              <span style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.3, color: theme.textPrimary }}>blocked list</span>
              <span style={{ fontSize: '11px', lineHeight: 1.3, color: theme.textSecondary }}>
                {websiteCount} site{websiteCount !== 1 ? 's' : ''} · {keywordCount} keyword{keywordCount !== 1 ? 's' : ''} locked
              </span>
            </div>
          </div>
          <StatusPill label={hasItems ? 'ready' : 'empty'} tone={hasItems ? 'success' : 'muted'} />
        </div>
      </section>

      {isActive ? (
        <div
          className="flex flex-col items-center"
          style={{ gap: '12px', padding: '16px', backgroundColor: theme.surface, border: `1px solid ${theme.borderSoft}`, borderRadius: '8px' }}
        >
          <div
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              background: `conic-gradient(${theme.accent} 0% ${progress}%, ${theme.borderSoft} ${progress}% 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `inset 0 0 0 8px ${theme.background}`,
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <span
                className="display block leading-none"
                style={{ fontSize: '20px', fontWeight: 800, color: theme.textPrimary }}
              >
                {formatTime(remaining).split(' ')[0]}
              </span>
              {remaining >= 60000 && (
                <div style={{ marginTop: '2px', fontSize: '10.5px', color: theme.textSecondary }}>remaining</div>
              )}
            </div>
          </div>

          <div className="flex items-center" style={{ gap: '6px' }}>
            <span
              className="inline-block rounded-full"
              style={{ width: 6, height: 6, backgroundColor: theme.success }}
            />
            <span style={{ fontSize: '11px', fontWeight: 600, color: theme.textPrimary }}>
              strict session is active
            </span>
          </div>

          <button
            type="button"
            onClick={() => onEndSession?.()}
            style={{
              width: '100%',
              height: '42px',
              borderRadius: '8px',
              padding: '0 12px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: theme.accent,
              color: theme.onAccent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            end session
          </button>
        </div>
      ) : (
        <section className="flex flex-col" style={{ gap: '6px' }}>
          <SectionHeader title="pick a duration" subtitle="how long should the strict session last?" />
          <div className="grid grid-cols-2" style={{ gap: '6px' }}>
            {DURATIONS.map(option => {
              const selected = selectedMin === option.min
              return (
                <button
                  key={option.min}
                  type="button"
                  onClick={() => setSelectedMin(option.min)}
                  className="flex flex-col items-start text-left transition-colors duration-150"
                  style={{
                    gap: '6px',
                    padding: '10px',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    backgroundColor: selected ? theme.highlight : theme.surface,
                    border: `1.5px solid ${selected ? theme.accent : theme.borderSoft}`,
                  }}
                >
                  <span
                    className="flex items-center justify-center"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: theme.background,
                      color: selected ? theme.accent : theme.textSecondary,
                    }}
                  >
                    <ClockIcon size={14} color={selected ? theme.accent : theme.textSecondary} />
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.3, color: theme.textPrimary }}>
                    {option.label}
                  </span>
                  <span style={{ fontSize: '11px', lineHeight: 1.3, color: theme.textSecondary }}>{option.sub}</span>
                </button>
              )
            })}
          </div>

          {!hasItems && (
            <p style={{ fontSize: '11px', color: theme.textSecondary, lineHeight: 1.3 }}>
              add items to your blocked list to start a strict session.
            </p>
          )}

          <button
            type="button"
            onClick={() => startSession(selectedMin)}
            disabled={!hasItems}
            style={{
              width: '100%',
              height: '42px',
              borderRadius: '8px',
              padding: '0 12px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: theme.accent,
              color: theme.onAccent,
              opacity: hasItems ? 1 : 0.4,
              cursor: hasItems ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            start strict session
          </button>
        </section>
      )}
    </div>
  )
}

function LockIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  )
}

function ClockIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
}
