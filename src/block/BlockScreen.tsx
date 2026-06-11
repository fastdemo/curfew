import { useState, useMemo, useCallback } from 'react'
import InterventionHold from './InterventionHold'
import InterventionSlide from './InterventionSlide'
import InterventionBreathing from './InterventionBreathing'
import AnalyticsPie from '../analytics/AnalyticsSidebar'

interface BlockScreenProps {
  domain: string
  interventionId: string
  timeSpent: number
  usageStats: Record<string, { date: string; timeSpent: number }[]>
  onCloseTab: () => void
  onProceed: (domain: string) => void
}

export default function BlockScreen({ domain, interventionId, timeSpent, usageStats, onCloseTab, onProceed }: BlockScreenProps) {
  const [showIntervention, setShowIntervention] = useState(false)
  const [completed, setCompleted] = useState(false)

  const handleCompleted = useCallback(() => {
    setCompleted(true)
  }, [])

  const handleContinue = () => {
    setShowIntervention(true)
  }

  const isInstant = interventionId === 'instant'

  const timeDisplay = useMemo(() => {
    const totalSeconds = Math.floor(timeSpent / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}m ${seconds}s`
  }, [timeSpent])

  const btnBase = {
    padding: '12px 24px', minWidth: '160px', borderRadius: '16px', fontWeight: 600, fontSize: '15px',
    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Sora', sans-serif",
  } as const

  const btnWrap = {
    display: 'flex', gap: '12px', justifyContent: 'center', width: '100%', maxWidth: '400px',
  } as const

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif", WebkitFontSmoothing: 'antialiased' }}>
      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

        <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'var(--color-surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>

        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', textAlign: 'center', margin: 0 }}>get back to work!</h1>

        <p style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
          you have spent <strong style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>{timeDisplay}</strong> on <strong style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>{domain}</strong> today.
        </p>

        {!showIntervention ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <AnalyticsPie highlightDomain={domain} />
            <div style={{ ...btnWrap, marginTop: '24px' }}>
              <button onClick={handleContinue} style={{ ...btnBase, backgroundColor: 'var(--color-accent)', color: '#F3EEEA' }}>
                let me continue
              </button>
              <button onClick={onCloseTab} style={{ ...btnBase, backgroundColor: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)' }}>
                close tab
              </button>
            </div>
          </div>
        ) : isInstant ? (
          <div style={{ ...btnWrap, marginTop: '24px' }}>
            <button onClick={() => onProceed(domain)} style={{ ...btnBase, backgroundColor: 'var(--color-accent)', color: '#F3EEEA' }}>
              proceed to {domain}
            </button>
            <button onClick={onCloseTab} style={{ ...btnBase, backgroundColor: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)' }}>
              close tab
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
            {interventionId === 'hold' && <InterventionHold onComplete={handleCompleted} />}
            {interventionId === 'slide' && <InterventionSlide onComplete={handleCompleted} />}
            {interventionId === 'breathing' && <InterventionBreathing onComplete={handleCompleted} />}

            <div style={{ ...btnWrap, marginTop: '24px' }}>
              {completed && (
                <button onClick={() => onProceed(domain)} style={{ ...btnBase, backgroundColor: 'var(--color-accent)', color: '#F3EEEA' }}>
                  proceed to {domain}
                </button>
              )}
              <button onClick={onCloseTab} style={{ ...btnBase, backgroundColor: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)' }}>
                close tab
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
