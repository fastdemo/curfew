import { useBlockTheme } from './theme'
import { useHoldTiming, SLIDE_DURATION } from './useHoldTiming'

// Hold-to-complete friction (8s press-and-hold). Timing comes from the
// shared elapsed-time hook (same as slide): progress advances only while
// held, release resets to 0, complete fires once.
export function HoldToComplete({ onComplete }: { onComplete: () => void }) {
  const c = useBlockTheme()
  const { progress, holding, begin: down, release } = useHoldTiming(SLIDE_DURATION, onComplete)
  const up = () => release(true)

  const C = 2 * Math.PI * 60
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <p style={{ margin: 0, fontSize: 14, color: c.secondary }}>hold the button for 8 seconds</p>
      <div
        style={{ position: 'relative', cursor: 'pointer', userSelect: 'none' }}
        onMouseDown={down}
        onMouseUp={up}
        onMouseLeave={up}
        onTouchStart={down}
        onTouchEnd={up}
      >
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="60" fill="none" stroke={c.inset} strokeWidth="6" />
          <circle
            cx="70" cy="70" r="60" fill="none" stroke={c.accent} strokeWidth="6"
            strokeDasharray={C}
            strokeDashoffset={C - progress * C}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={holding ? c.accent : c.tertiary} strokeWidth={2} style={{ transition: 'stroke 200ms' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
