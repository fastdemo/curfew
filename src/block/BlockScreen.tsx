import { useState, useMemo, useCallback } from 'react'
import InterventionHold from './InterventionHold'
import InterventionSlide from './InterventionSlide'
import InterventionBreathing from './InterventionBreathing'
import AnalyticsPie from '../analytics/AnalyticsSidebar'
import { WARM_BG, WARM_CARD, WARM_BORDER, WARM_TEXT_PRIMARY, WARM_TEXT_SECONDARY, WARM_TEXT_TERTIARY, WARM_ACCENT, WARM_ON_ACCENT, WARM_SURFACE } from './palette'

interface BlockScreenProps {
  domain: string
  interventionId: string
  timeSpent: number
  usageStats: Record<string, { date: string; timeSpent: number }[]>
  onCloseTab: () => void
  onProceed: (domain: string) => void
  canProceed?: boolean
}

export default function BlockScreen({ domain, interventionId, timeSpent, onCloseTab, onProceed, canProceed = true }: BlockScreenProps) {
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

  const btnPrimary: React.CSSProperties = {
    width: '100%',
    padding: '12px 20px',
    borderRadius: '14px',
    fontWeight: 600,
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WARM_ACCENT,
    color: WARM_ON_ACCENT,
    transition: 'opacity 0.15s ease',
    fontFamily: 'inherit',
  }

  const btnSecondary: React.CSSProperties = {
    width: '100%',
    padding: '12px 20px',
    borderRadius: '14px',
    fontWeight: 500,
    fontSize: '14px',
    border: `1px solid ${WARM_BORDER}`,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WARM_CARD,
    color: WARM_TEXT_SECONDARY,
    transition: 'opacity 0.15s ease, color 0.15s ease',
    fontFamily: 'inherit',
  }

  const btnWrap = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    width: '100%',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: WARM_BG,
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        fontFamily: "'DM Sans', sans-serif",
        WebkitFontSmoothing: 'antialiased',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          padding: '32px',
          borderRadius: '24px',
          backgroundColor: WARM_CARD,
          border: `1px solid rgba(255, 255, 255, 0.06)`,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: WARM_SURFACE,
                border: `1px solid ${WARM_BORDER}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={WARM_ACCENT} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: WARM_ACCENT,
                color: WARM_ON_ACCENT,
              }}
            >
              {domain}
            </span>
          </div>

          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: '24px', fontWeight: 800, color: WARM_TEXT_PRIMARY, textAlign: 'center', margin: 0 }}>
            get back to work!
          </h1>

          <p style={{ fontSize: '13px', fontWeight: 400, color: WARM_TEXT_TERTIARY, textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
            you have spent <strong style={{ color: WARM_TEXT_PRIMARY, fontWeight: 700 }}>{timeDisplay}</strong> on{' '}
            <strong style={{ color: WARM_TEXT_PRIMARY, fontWeight: 700 }}>{domain}</strong> today.
          </p>
        </div>

        {!canProceed ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
            <AnalyticsPie highlightDomain={domain} />
            <button
              onClick={onCloseTab}
              style={btnPrimary}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              close tab
            </button>
          </div>
        ) : !showIntervention ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
            <AnalyticsPie highlightDomain={domain} />
            <div style={btnWrap}>
              <button
                onClick={handleContinue}
                style={btnSecondary}
                onMouseEnter={(e) => { e.currentTarget.style.color = WARM_TEXT_PRIMARY; e.currentTarget.style.opacity = '0.85' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = WARM_TEXT_SECONDARY; e.currentTarget.style.opacity = '1' }}
              >
                let me continue
              </button>
              <button
                onClick={onCloseTab}
                style={btnPrimary}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                close tab
              </button>
            </div>
          </div>
        ) : isInstant ? (
          <div style={btnWrap}>
            <button
              onClick={() => onProceed(domain)}
              style={btnPrimary}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              proceed to {domain}
            </button>
            <button
              onClick={onCloseTab}
              style={btnSecondary}
              onMouseEnter={(e) => { e.currentTarget.style.color = WARM_TEXT_PRIMARY; e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = WARM_TEXT_SECONDARY; e.currentTarget.style.opacity = '1' }}
            >
              close tab
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
            {interventionId === 'hold' && <InterventionHold onComplete={handleCompleted} />}
            {interventionId === 'slide' && <InterventionSlide onComplete={handleCompleted} />}
            {interventionId === 'breathing' && <InterventionBreathing onComplete={handleCompleted} />}

            <div style={btnWrap}>
              {completed && (
                <button
                  onClick={() => onProceed(domain)}
                  style={btnPrimary}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  proceed to {domain}
                </button>
              )}
              <button
                onClick={onCloseTab}
                style={btnSecondary}
                onMouseEnter={(e) => { e.currentTarget.style.color = WARM_TEXT_PRIMARY; e.currentTarget.style.opacity = '0.85' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = WARM_TEXT_SECONDARY; e.currentTarget.style.opacity = '1' }}
              >
                close tab
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
