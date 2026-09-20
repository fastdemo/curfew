import { useState, useRef, useEffect, useCallback } from 'react'
import { useBlockTheme } from './theme'

// Hold-to-complete friction (8s press-and-hold). Logic mirrors the old
// intervention: rAF progress, release resets to 0, complete fires once.
export function HoldToComplete({ onComplete }: { onComplete: () => void }) {
  const c = useBlockTheme()
  const [progress, setProgress] = useState(0)
  const [holding, setHolding] = useState(false)
  const startRef = useRef(0)
  const rafRef = useRef(0)
  const holdingRef = useRef(false)
  const doneRef = useRef(false)

  const DURATION = 8000

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const down = useCallback(() => {
    if (doneRef.current) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    holdingRef.current = true
    setHolding(true)
    startRef.current = Date.now() - progress * DURATION
    const tick = () => {
      const pct = Math.min((Date.now() - startRef.current) / DURATION, 1)
      setProgress(pct)
      if (pct >= 1) {
        doneRef.current = true
        holdingRef.current = false
        setHolding(false)
        onComplete()
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [progress, onComplete])

  const up = useCallback(() => {
    if (!holdingRef.current || doneRef.current) return
    holdingRef.current = false
    setHolding(false)
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
    setProgress(0)
  }, [])

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
