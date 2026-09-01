import { useState, useMemo, useCallback } from 'react'
import InterventionHold from './InterventionHold'
import InterventionSlide from './InterventionSlide'
import InterventionBreathing from './InterventionBreathing'
import AnalyticsPie from '../analytics/AnalyticsSidebar'
import GrowingTree from './GrowingTree'
import { WARM_BG, WARM_CARD, WARM_BORDER, WARM_TEXT_PRIMARY, WARM_TEXT_TERTIARY, WARM_PRIMARY_BTN, WARM_PRIMARY_BTN_TEXT, WARM_OUTLINE_BORDER, WARM_OUTLINE_TEXT } from './palette'

interface BlockScreenProps {
  domain: string
  interventionId: string
  timeSpent: number
  usageStats: Record<string, { date: string; timeSpent: number }[]>
  onCloseTab: () => void
  onProceed: (domain: string) => void
  canProceed?: boolean
}

const LeafIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
)

const ChevronToggle = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    aria-label={isOpen ? 'Hide activity breakdown' : 'Show activity breakdown'}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '10px',
      margin: '0 auto',
      color: WARM_TEXT_TERTIARY,
      transition: 'color 0.15s ease',
      fontFamily: 'inherit',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.color = WARM_OUTLINE_TEXT)}
    onMouseLeave={(e) => (e.currentTarget.style.color = WARM_TEXT_TERTIARY)}
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease-in-out' }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  </button>
)

const ProgressRing = ({ size = 72, stroke = 6, pct }: { size?: number; stroke?: number; pct: number }) => {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={WARM_BORDER} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={WARM_PRIMARY_BTN}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  )
}

export default function BlockScreen({ domain, interventionId, timeSpent, usageStats, onCloseTab, onProceed, canProceed = true }: BlockScreenProps) {
  const [showIntervention, setShowIntervention] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

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

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    let totalMs = 0
    let sitesToday = 0
    for (const [, dates] of Object.entries(usageStats)) {
      let dayMs = 0
      for (const e of dates) if (e.date === today) dayMs += e.timeSpent
      if (dayMs > 0) sitesToday += 1
      totalMs += dayMs
    }
    const domainMs = usageStats[domain]?.find((e) => e.date === today)?.timeSpent || 0
    const pct = totalMs > 0 ? (domainMs / totalMs) * 100 : 0
    return { totalMs, sitesToday, pct }
  }, [usageStats, domain])

  const totalDisplay = useMemo(() => {
    const mins = Math.floor(stats.totalMs / 60000)
    if (mins < 60) return `${mins}m`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h ${m}m`
  }, [stats.totalMs])

  const btnPrimary: React.CSSProperties = {
    width: '100%',
    padding: '12px 20px',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WARM_PRIMARY_BTN,
    color: WARM_PRIMARY_BTN_TEXT,
    transition: 'opacity 0.15s ease',
    fontFamily: 'inherit',
  }

  const btnSecondary: React.CSSProperties = {
    width: '100%',
    padding: '12px 20px',
    borderRadius: '12px',
    fontWeight: 500,
    fontSize: '14px',
    border: `1px solid ${WARM_OUTLINE_BORDER}`,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    color: WARM_OUTLINE_TEXT,
    transition: 'opacity 0.15s ease, color 0.15s ease',
    fontFamily: 'inherit',
  }

  const btnWrap = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    width: '100%',
  }

  const badgeRow = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          padding: '6px 14px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: 600,
          color: WARM_TEXT_PRIMARY,
          border: `1px solid ${WARM_OUTLINE_BORDER}`,
        }}
      >
        <LeafIcon size={13} />
        {domain}
      </span>
    </div>
  )

  const treeSlot = (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4px 0 0' }}>
      <GrowingTree />
    </div>
  )

  const statsRow = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', width: '100%' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <ProgressRing size={72} stroke={6} pct={stats.pct} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: WARM_TEXT_PRIMARY, fontFamily: 'inherit' }}>{Math.round(stats.pct)}%</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, color: WARM_TEXT_PRIMARY, fontFamily: 'inherit' }}>{timeDisplay}</span>
          <span style={{ fontSize: '11px', color: WARM_TEXT_TERTIARY }}>on {domain}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, color: WARM_TEXT_PRIMARY, fontFamily: 'inherit' }}>{totalDisplay}</span>
          <span style={{ fontSize: '11px', color: WARM_TEXT_TERTIARY }}>total today</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, color: WARM_TEXT_PRIMARY, fontFamily: 'inherit' }}>{stats.sitesToday}</span>
          <span style={{ fontSize: '11px', color: WARM_TEXT_TERTIARY }}>sites visited</span>
        </div>
      </div>
    </div>
  )

  const centerSlot = (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateRows: isDetailsOpen ? '0fr' : '1fr',
          opacity: isDetailsOpen ? 0 : 1,
          transition: 'grid-template-rows 0.3s ease-in-out, opacity 0.2s ease-in-out',
        }}
      >
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          {treeSlot}
        </div>
      </div>
      <div
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateRows: isDetailsOpen ? '1fr' : '0fr',
          opacity: isDetailsOpen ? 1 : 0,
          transition: 'grid-template-rows 0.3s ease-in-out, opacity 0.25s ease-in-out',
        }}
      >
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          <AnalyticsPie highlightDomain={domain} />
        </div>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes curfew-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          background: WARM_BG,
          backgroundImage: 'radial-gradient(color-mix(in srgb, var(--color-text-tertiary) 20%, transparent) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
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
            gap: '20px',
            padding: '32px',
            borderRadius: '10px',
            backgroundColor: WARM_CARD,
            border: `1px solid ${WARM_BORDER}`,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center', animation: 'curfew-fade-up 0.4s ease-out' }}>
            {badgeRow}

            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: '24px', fontWeight: 800, color: WARM_TEXT_PRIMARY, textAlign: 'center', margin: 0 }}>
              time to focus
            </h1>

            <p style={{ fontSize: '13px', fontWeight: 400, color: WARM_TEXT_TERTIARY, textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
              a moment of stillness can do wonders.
            </p>
          </div>

          {!canProceed ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
              {centerSlot}
              <ChevronToggle isOpen={isDetailsOpen} onClick={() => setIsDetailsOpen(v => !v)} />
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
              {statsRow}
              {centerSlot}
              <ChevronToggle isOpen={isDetailsOpen} onClick={() => setIsDetailsOpen(v => !v)} />
              <div style={btnWrap}>
                <button
                  onClick={handleContinue}
                  style={btnSecondary}
                  onMouseEnter={(e) => { e.currentTarget.style.color = WARM_TEXT_PRIMARY; e.currentTarget.style.opacity = '0.85' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = WARM_OUTLINE_TEXT; e.currentTarget.style.opacity = '1' }}
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
                onMouseLeave={(e) => { e.currentTarget.style.color = WARM_OUTLINE_TEXT; e.currentTarget.style.opacity = '1' }}
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
                  onMouseLeave={(e) => { e.currentTarget.style.color = WARM_OUTLINE_TEXT; e.currentTarget.style.opacity = '1' }}
                >
                  close tab
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
