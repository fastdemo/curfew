import { useMemo } from 'react'
import { ChromeStorage } from '../types'
import { useTimer } from '../hooks/useTimer'

interface StrictSessionTabProps {
  storage: ChromeStorage & { loading: boolean; update: (p: Partial<ChromeStorage>) => Promise<void> }
  onEndSession?: () => void
}

const DURATIONS_MINUTES = [1, 10, 20, 30, 60, 120, 180, 240]

export default function StrictSessionTab({ storage, onEndSession }: StrictSessionTabProps) {
  const { now, getRemaining, formatTime } = useTimer()

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

  const startSession = async (minutes: number) => {
    const now = Date.now()
    const endTime = now + minutes * 60 * 1000
    await storage.update({
      strictSession: { isActive: true, startTime: now, endTime },
    })
    chrome.runtime.sendMessage({ type: 'CURFEW_RELOAD_BLOCKED_TABS' })
  }

  return (
    <div className="flex flex-col pb-2">
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: '18px', fontWeight: 700 }}>strict session</h1>
        <p style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-text-muted)' }} className="mt-1">
          deep focus session with no distractions. blocks access to specified websites until the timer ends.
        </p>
      </div>

      <div className="rounded-2xl bg-[var(--color-surface-secondary)] p-4 mb-3">
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '15px', fontWeight: 600 }}>blocked list summary</span>
          <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-text-muted)' }}>
            {websiteCount} websites, {keywordCount} keywords
          </span>
        </div>
      </div>

      {isActive ? (
        <div style={{
          background: 'var(--color-surface-secondary)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '4px',
            width: `${progress}%`,
            background: 'var(--color-accent)',
            borderRadius: '0 2px 2px 0',
            transition: 'width 1s linear',
          }} />

          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: `conic-gradient(var(--color-accent) 0% ${progress}%, var(--color-surface-tertiary) ${progress}% 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 0 8px var(--color-surface)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                {formatTime(remaining).split(' ')[0]}
              </span>
              {remaining >= 60000 && (
                <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  remaining
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              width: '16px',
              height: '16px',
              animationName: 'curfew-pulse',
              animationDuration: '2s',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '14px', fontWeight: 600, color: 'var(--color-accent)' }}>
              strict session is active
            </span>
          </div>

          <button
            onClick={() => onEndSession?.()}
            style={{
              marginTop: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--color-surface-tertiary)',
              color: 'var(--color-text-muted)',
              fontFamily: "'Sora', sans-serif",
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            end session
          </button>
        </div>
      ) : (
        <>
          <p style={{ fontFamily: "'Sora', sans-serif", fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>select duration</p>
          <div className="grid grid-cols-2 gap-3">
            {DURATIONS_MINUTES.map(min => (
              <button
                key={min}
                onClick={() => startSession(min)}
                className="py-3 px-4 rounded-xl bg-[var(--color-surface-secondary)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)] transition-all"
              >
                {min < 60 ? `${min} min` : `${min / 60} hour${min / 60 > 1 ? 's' : ''}`}
              </button>
            ))}
          </div>
        </>
      )}

      {storage.blockedItems.length === 0 && !isActive && (
        <p style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-text-muted)' }} className="text-center mt-3">
          add items to your blocked list in the globe tab to use strict session.
        </p>
      )}
    </div>
  )
}
