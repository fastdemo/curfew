import { useMemo, useState } from 'react'
import { useTimer } from '../hooks/useTimer'
import type { ChromeStorage } from '../types'
import { useTheme } from '../ui/theme'

interface Props {
  storage: ChromeStorage & { update: (p: Partial<ChromeStorage>) => Promise<void> }
  onEndSession: () => void
}

const DURATIONS = [
  { min: 1, label: '1 min', sub: 'reset' },
  { min: 10, label: '10 min', sub: 'break' },
  { min: 20, label: '20 min', sub: 'focus' },
  { min: 30, label: '30 min', sub: 'deep' },
] as const

// Strict session: a time-boxed commitment. Two states, one focal point each:
// idle -> duration grid + single start CTA; live -> countdown ring + end.
// The blocked-scope count is said once (idle helper line), never repeated.
export function StrictScreen({ storage, onEndSession }: Props) {
  const t = useTheme()
  const { now, getRemaining, formatTime } = useTimer()
  const [selectedMin, setSelectedMin] = useState<number>(20)

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

  const items = storage.blockedItems.length
  const hasItems = items > 0

  const start = async (minutes: number) => {
    if (!hasItems) return
    const startTime = Date.now()
    await storage.update({
      strictSession: { isActive: true, startTime, endTime: startTime + minutes * 60 * 1000 },
    })
    chrome.runtime.sendMessage({ type: 'CURFEW_RELOAD_BLOCKED_TABS' })
  }

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                strokeDashoffset={C * (1 - elapsed)}
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
                {formatTime(remaining).split(' ')[0]}
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
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.3, color: t.textSecondary, margin: '0 0 6px' }}>
          lock everything for
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {DURATIONS.map((d) => {
            const on = selectedMin === d.min
            return (
              <button
                key={d.min}
                type="button"
                aria-pressed={on}
                onClick={() => setSelectedMin(d.min)}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 6,
                  padding: '10px 12px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  backgroundColor: on ? t.highlight : t.bgSurface,
                  border: `1px solid ${on ? t.accent : t.border}`,
                  transition: 'background-color 150ms ease-out, border-color 150ms ease-out',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: on ? t.accent : t.textPrimary, fontVariantNumeric: 'tabular-nums' }}>
                  {d.label}
                </span>
                <span style={{ fontSize: 11, color: t.textSecondary }}>{d.sub}</span>
              </button>
            )
          })}
        </div>
      </div>
      <button
        type="button"
        onClick={() => void start(selectedMin)}
        disabled={!hasItems}
        style={{
          ...cta,
          opacity: hasItems ? 1 : 0.45,
          cursor: hasItems ? 'pointer' : 'not-allowed',
        }}
      >
        start strict session
      </button>
      <p style={{ margin: 0, fontSize: 11, lineHeight: 1.4, color: t.textSecondary }}>
        {hasItems
          ? `locks ${items === 1 ? '1 item' : `${items} items`} · no bypass until the timer ends`
          : 'add something to your blocked list first.'}
      </p>
    </div>
  )
}
