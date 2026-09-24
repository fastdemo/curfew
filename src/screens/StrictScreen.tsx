import { useMemo, useState } from 'react'
import { useTimer } from '../hooks/useTimer'
import type { ChromeStorage } from '../types'
import { useTheme } from '../ui/theme'
import { Screen } from '../ui/Screen'
import { SquareTileGrid } from '../ui/SquareTileGrid'

interface Props {
  storage: ChromeStorage & { update: (p: Partial<ChromeStorage>) => Promise<void> }
  onEndSession: () => void
}

const DURATIONS = [
  {
    min: 1,
    label: '1 min',
    sub: 'reset',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />,
  },
  {
    min: 10,
    label: '10 min',
    sub: 'break',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
  {
    min: 20,
    label: '20 min',
    sub: 'focus',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  },
  {
    min: 30,
    label: '30 min',
    sub: 'deep',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
  },
] as const

// Strict session: a time-boxed commitment. Two states, one focal point each:
// idle -> duration grid + single start CTA; live -> countdown ring + end.
// The blocked-scope count is said once (idle helper line), never repeated.
export function StrictScreen({ storage, onEndSession }: Props) {
  const t = useTheme()
  const { now, getRemaining, formatCountdown } = useTimer()
  // No default selection: user must actively pick a duration before start
  // enables.
  const [selectedMin, setSelectedMin] = useState<number | null>(null)

  const isActive = storage.strictSession.isActive && now < storage.strictSession.endTime
  const remaining = getRemaining(storage.strictSession.endTime)

  const total = useMemo(() => {
    if (!isActive) return 0
    return storage.strictSession.endTime - storage.strictSession.startTime
  }, [isActive, storage.strictSession.startTime, storage.strictSession.endTime])

  const elapsed = useMemo(() => {
    if (!isActive || total === 0) return 0
    return Math.max(0, Math.min(1, (now - storage.strictSession.startTime) / total))
  }, [isActive, total, storage.strictSession.startTime, now])

  // Ring + header timer share one source: fraction of time REMAINING.
  // elapsed=0 (just started) -> full ring; elapsed=1 (done) -> empty ring.
  const remainingFrac = 1 - elapsed
  const ringLabel = formatCountdown(remaining)

  const hasItems = storage.blockedItems.length > 0

  const start = async (minutes: number | null) => {
    if (!hasItems || minutes === null) return
    const startTime = Date.now()
    await storage.update({
      strictSession: { isActive: true, startTime, endTime: startTime + minutes * 60 * 1000 },
    })
    chrome.runtime.sendMessage({ type: 'CURFEW_RELOAD_BLOCKED_TABS' })
  }

  const canStart = hasItems && selectedMin !== null

  const cta = {
    width: '100%',
    height: 40,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    backgroundColor: t.accent,
    color: t.onAccent,
  } as const

  if (isActive) {
    const R = 34
    const C = 2 * Math.PI * R
    return (
      <Screen>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            padding: '20px 14px 14px',
            borderRadius: 12,
            backgroundColor: t.bgSurface,
            border: `1px solid ${t.border}`,
          }}
        >
          <div style={{ position: 'relative', width: 96, height: 96 }}>
            <svg width={96} height={96} viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={48} cy={48} r={R} fill="none" stroke={t.border} strokeWidth={7} />
              <circle
                cx={48}
                cy={48}
                r={R}
                fill="none"
                stroke={t.accent}
                strokeWidth={7}
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - remainingFrac)}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                className="font-display"
                style={{ fontSize: 19, fontWeight: 800, lineHeight: 1, color: t.textPrimary, fontVariantNumeric: 'tabular-nums' }}
              >
                {ringLabel}
              </span>
              <span style={{ marginTop: 3, fontSize: 10.5, color: t.textSecondary }}>left</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: t.success }}>
            strict session is live
          </p>
          <button type="button" onClick={onEndSession} style={cta}>
            end session
          </button>
        </div>
      </Screen>
    )
  }

  return (
    <Screen gap={8}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.3, color: t.textSecondary, margin: '0 0 6px', flexShrink: 0 }}>
          strict session
        </p>
        {/* Single description line for the screen, directly under the
            header and above the grid. The bottom copy is gone entirely. */}
        <p style={{ fontSize: 11, lineHeight: 1.4, color: t.textSecondary, margin: '0 0 8px', flexShrink: 0 }}>
          you cannot bypass until the timer ends.
        </p>
        {/* Same shared square tiles as home: left-aligned, icon top,
            prominent label bottom with secondary meta. Fixed near-square
            rows, CTA pinned bottom. */}
        <SquareTileGrid
          items={DURATIONS.map((d) => ({
            id: String(d.min),
            icon: d.icon,
            label: d.label,
            meta: d.sub,
            selected: selectedMin === d.min,
            onSelect: () => setSelectedMin(d.min),
            pressedLabel: `${d.label}, ${d.sub}`,
          }))}
        />
      </div>
      <button
        type="button"
        onClick={() => void start(selectedMin)}
        disabled={!canStart}
        style={{
          ...cta,
          flexShrink: 0,
          marginTop: 'auto',
          opacity: canStart ? 1 : 0.45,
          cursor: canStart ? 'pointer' : 'not-allowed',
        }}
        title={!hasItems ? 'add something to your blocked list first' : selectedMin === null ? 'pick a duration first' : undefined}
      >
        start session
      </button>
    </Screen>
  )
}
