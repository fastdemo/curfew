import { useState, useRef, useEffect } from 'react'

interface InterventionHoldProps {
  onComplete: () => void
}

const HOLD_DURATION = 8000

export default function InterventionHold({ onComplete }: InterventionHoldProps) {
  const [progress, setProgress] = useState(0)
  const [holding, setHolding] = useState(false)
  const startRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const handleMouseDown = () => {
    setHolding(true)
    startRef.current = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startRef.current
      const pct = Math.min(elapsed / HOLD_DURATION, 1)
      setProgress(pct)

      if (pct >= 1) {
        setHolding(false)
        onComplete()
        return
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
  }

  const handleMouseUp = () => {
    if (holding) {
      setHolding(false)
      setProgress(0)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }

  const circumference = 2 * Math.PI * 60
  const offset = circumference - progress * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>hold the button for 8 seconds</p>
      <div
        style={{ position: 'relative', cursor: 'pointer', userSelect: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="60" fill="none" stroke="var(--color-surface-tertiary)" strokeWidth="6" />
          <circle
            cx="70" cy="70" r="60" fill="none" stroke="var(--color-accent)" strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'none' }}
            transform="rotate(-90 70 70)"
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg
            width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke={holding ? 'var(--color-accent)' : 'var(--color-text-muted)'} strokeWidth={2}
            style={{ transition: 'color 0.2s' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
