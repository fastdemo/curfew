import { useState, useMemo, useCallback } from 'react'
import { useBlockTheme } from './theme'
import { HoldToComplete } from './HoldToComplete'
import { SlideToContinue } from './SlideToContinue'
import { BreathingDot } from './BreathingDot'
import { RangeTabs } from './RangeTabs'
import { UsageDonut } from './UsageDonut'
import { UsageList } from './UsageList'
import { useUsageRows, type UsageRange } from './useUsage'

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
// "time to focus", one summary line for the blocked domain, an expandable
// usage breakdown, then the friction flow — "let me continue" reveals the
// picked intervention (instant/hold/slide/breathing); completing it unlocks
// "proceed". canProceed=false (no interventions selected) skips friction.
// Per-screen rules: the domain's time is said once (in the summary line, in
// context next to the list) — never repeated in a header stat block. The
// easy path is "close tab" (accent fill); the gated path is "let me continue"
// (neutral outline) until friction completes.
export function BlockView({ domain, interventionId, timeSpent, usageStats, onCloseTab, onProceed, canProceed = true }: BlockViewProps) {
  const c = useBlockTheme()
  const [stage, setStage] = useState<'stats' | 'friction'>('stats')
  const [completed, setCompleted] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  // Range lives at the BlockView level so the always-visible tabs and the
  // expandable breakdown share one window — chart and list update together.
  const [range, setRange] = useState<UsageRange>('today')
  const usageRows = useUsageRows(range)

  const done = useCallback(() => setCompleted(true), [])

  const today = new Date().toISOString().slice(0, 10)
  const sitesToday = useMemo(() => {
    let n = 0
    for (const dates of Object.values(usageStats)) {
      if (dates.some((e) => e.date === today && e.timeSpent > 0)) n += 1
    }
    return n
  }, [usageStats, today])

  const fmtClock = (ms: number) => {
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    return m > 0 ? `${m}m ${s % 60}s` : `${s % 60}s`
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
        backgroundImage: c.dotPattern,
        backgroundSize: '22px 22px',
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 11px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              color: c.secondary,
              border: `1px solid ${c.border}`,
            }}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={c.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
            {domain}
          </span>
          <h1 className="font-display" style={{ margin: 0, fontSize: 20, fontWeight: 800, lineHeight: 1.2, color: c.primary }}>
            time to focus
          </h1>
          {/* Summary line intentionally sits outside the header stack's
              centered rhythm: left gap (tabs) = right gap (donut), and the
              tabs→donut gap is doubled so it matches donut→chevron. */}
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: c.secondary, textAlign: 'center' }}>
            {fmtClock(timeSpent)} on this site today · {sitesToday} {sitesToday === 1 ? 'site' : 'sites'} visited
          </p>
          <div style={{ marginTop: 10 }}>
            <RangeTabs range={range} onChange={setRange} />
          </div>
          {/* 2× the stack rhythm: tabs→donut breathes twice the donut→chev gap. */}
          <div style={{ marginTop: 10 }}>
            <UsageDonut rows={usageRows} highlightDomain={domain} />
          </div>
          <DetailsToggle open={detailsOpen} onToggle={() => setDetailsOpen((v) => !v)} />
        </div>

        {!canProceed ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateRows: detailsOpen ? '1fr' : '0fr',
                opacity: detailsOpen ? 1 : 0,
                transition: 'grid-template-rows 180ms ease-out, opacity 180ms ease-out',
              }}
            >
              <div style={{ overflow: 'hidden', minHeight: 0 }}>
                <UsageList rows={usageRows} highlightDomain={domain} />
              </div>
            </div>
            <button type="button" onClick={onCloseTab} style={primary}>
              close tab
            </button>
          </div>
        ) : stage === 'stats' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateRows: detailsOpen ? '1fr' : '0fr',
                opacity: detailsOpen ? 1 : 0,
                transition: 'grid-template-rows 180ms ease-out, opacity 180ms ease-out',
              }}
            >
              <div style={{ overflow: 'hidden', minHeight: 0 }}>
                <UsageList rows={usageRows} highlightDomain={domain} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <button type="button" onClick={onCloseTab} style={primary}>
                close tab
              </button>
              <button type="button" onClick={() => setStage('friction')} style={secondary}>
                let me continue
              </button>
            </div>
          </div>
        ) : isInstant ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button type="button" onClick={onCloseTab} style={primary}>
              close tab
            </button>
            <button type="button" onClick={() => onProceed(domain)} style={secondary}>
              proceed to {domain}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {interventionId === 'hold' && <HoldToComplete onComplete={done} />}
            {interventionId === 'slide' && <SlideToContinue onComplete={done} />}
            {interventionId === 'breathing' && <BreathingDot onComplete={done} />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <button type="button" onClick={onCloseTab} style={primary}>
                close tab
              </button>
              {completed ? (
                <button type="button" onClick={() => onProceed(domain)} style={secondary}>
                  proceed to {domain}
                </button>
              ) : (
                <p style={{ margin: 0, fontSize: 11, lineHeight: 1.4, color: c.tertiary, textAlign: 'center' }}>
                  finish the pause above to continue
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailsToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const c = useBlockTheme()
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={open ? 'hide usage breakdown' : 'show usage breakdown'}
      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 6, color: c.tertiary }}
    >
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 180ms ease-out' }}>
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  )
}
