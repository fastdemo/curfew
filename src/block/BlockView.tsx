import { useState, useMemo, useCallback } from 'react'
import { useBlockTheme } from './theme'
import { HoldToComplete } from './HoldToComplete'
import { SlideToContinue } from './SlideToContinue'
import { BreathingDot } from './BreathingDot'
import { GrowingTree } from './GrowingTree'
import { UsageBreakdown } from './UsageBreakdown'

export interface BlockViewProps {
  domain: string
  interventionId: string
  timeSpent: number
  usageStats: Record<string, { date: string; timeSpent: number }[]>
  onCloseTab: () => void
  onProceed: (domain: string) => void
  canProceed?: boolean
}

// Block page (also rendered inside the content-script overlay): domain badge,
// "time to focus", today's stats for this domain, the growing tree with an
// expandable usage breakdown, then the friction flow — "let me continue"
// reveals the picked intervention; completing it unlocks "proceed".
// canProceed=false (no interventions selected) skips friction entirely.
export function BlockView({ domain, interventionId, timeSpent, usageStats, onCloseTab, onProceed, canProceed = true }: BlockViewProps) {
  const c = useBlockTheme()
  const [stage, setStage] = useState<'stats' | 'friction'>('stats')
  const [completed, setCompleted] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const done = useCallback(() => setCompleted(true), [])

  const today = new Date().toISOString().slice(0, 10)
  const stats = useMemo(() => {
    let totalMs = 0
    let sitesToday = 0
    for (const dates of Object.values(usageStats)) {
      let dayMs = 0
      for (const e of dates) if (e.date === today) dayMs += e.timeSpent
      if (dayMs > 0) sitesToday += 1
      totalMs += dayMs
    }
    const domainMs = usageStats[domain]?.find((e) => e.date === today)?.timeSpent ?? 0
    return { totalMs, sitesToday, pct: totalMs > 0 ? (domainMs / totalMs) * 100 : 0 }
  }, [usageStats, domain, today])

  const fmtClock = (ms: number) => {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    return m > 0 ? `${m}m ${s % 60}s` : `${s % 60}s`
  }
  const fmtTotal = (ms: number) => {
    const m = Math.floor(ms / 60000)
    if (m < 60) return `${m}m`
    return `${Math.floor(m / 60)}h ${m % 60}m`
  }

  const primary: React.CSSProperties = {
    width: '100%',
    height: 42,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    backgroundColor: c.accent,
    color: c.onAccent,
  }
  const secondary: React.CSSProperties = {
    width: '100%',
    height: 42,
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    backgroundColor: 'transparent',
    color: c.secondary,
    border: `1px solid ${c.border}`,
  }

  const isInstant = interventionId === 'instant'

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: c.bg,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: 20,
          borderRadius: 14,
          backgroundColor: c.card,
          border: `1px solid ${c.border}`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 11px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              color: c.primary,
              border: `1px solid ${c.border}`,
            }}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
            {domain}
          </span>
          <h1 className="font-display" style={{ margin: 0, fontSize: 20, fontWeight: 800, lineHeight: 1.2, color: c.primary }}>
            time to focus
          </h1>
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.4, color: c.tertiary }}>
            a moment of stillness can do wonders.
          </p>
        </div>

        {!canProceed ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <GrowingTree />
            <button
              type="button"
              onClick={() => setDetailsOpen((v) => !v)}
              aria-expanded={detailsOpen}
              aria-label={detailsOpen ? 'hide usage breakdown' : 'show usage breakdown'}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 6, color: c.tertiary }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ transform: detailsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {detailsOpen && <UsageBreakdown highlightDomain={domain} />}
            <button type="button" onClick={onCloseTab} style={primary}>
              close tab
            </button>
          </div>
        ) : stage === 'stats' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, width: '100%' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <svg width={64} height={64} viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx={32} cy={32} r={27} fill="none" stroke={c.border} strokeWidth={5} />
                  <circle
                    cx={32} cy={32} r={27} fill="none"
                    stroke={c.accent} strokeWidth={5} strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 27}
                    strokeDashoffset={2 * Math.PI * 27 * (1 - stats.pct / 100)}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: c.primary }}>{Math.round(stats.pct)}%</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: c.primary }}>
                  {fmtClock(timeSpent)} <span style={{ fontSize: 11, fontWeight: 400, color: c.tertiary }}>on {domain}</span>
                </p>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: c.primary }}>
                  {fmtTotal(stats.totalMs)} <span style={{ fontSize: 11, fontWeight: 400, color: c.tertiary }}>total today</span>
                </p>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: c.primary }}>
                  {stats.sitesToday} <span style={{ fontSize: 11, fontWeight: 400, color: c.tertiary }}>sites visited</span>
                </p>
              </div>
            </div>
            <GrowingTree />
            <button
              type="button"
              onClick={() => setDetailsOpen((v) => !v)}
              aria-expanded={detailsOpen}
              aria-label={detailsOpen ? 'hide usage breakdown' : 'show usage breakdown'}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 6, color: c.tertiary }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ transform: detailsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {detailsOpen && <UsageBreakdown highlightDomain={domain} />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <button type="button" onClick={() => setStage('friction')} style={secondary}>
                let me continue
              </button>
              <button type="button" onClick={onCloseTab} style={primary}>
                close tab
              </button>
            </div>
          </div>
        ) : isInstant ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" onClick={() => onProceed(domain)} style={primary}>
              proceed to {domain}
            </button>
            <button type="button" onClick={onCloseTab} style={secondary}>
              close tab
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {interventionId === 'hold' && <HoldToComplete onComplete={done} />}
            {interventionId === 'slide' && <SlideToContinue onComplete={done} />}
            {interventionId === 'breathing' && <BreathingDot onComplete={done} />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              {completed && (
                <button type="button" onClick={() => onProceed(domain)} style={primary}>
                  proceed to {domain}
                </button>
              )}
              <button type="button" onClick={onCloseTab} style={secondary}>
                close tab
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
