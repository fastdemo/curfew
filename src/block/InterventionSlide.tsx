import { useState, useRef, useCallback } from 'react'

interface InterventionSlideProps {
  onComplete: () => void
}

const SLIDE_DURATION = 8000

export default function InterventionSlide({ onComplete }: InterventionSlideProps) {
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const startRef = useRef(0)
  const rafRef = useRef(0)

  const getPosition = useCallback((clientX: number) => {
    if (!trackRef.current) return 0
    const rect = trackRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    return Math.max(0, Math.min(x / rect.width, 1))
  }, [])

  const startDrag = (clientX: number) => {
    const initialPos = getPosition(clientX)
    setDragging(true)
    startRef.current = Date.now()
    setProgress(initialPos)

    const animate = () => {
      const elapsed = Date.now() - startRef.current
      const targetPct = Math.min(elapsed / SLIDE_DURATION, 1)

      if (targetPct >= 1) {
        setProgress(1)
        setDragging(false)
        onComplete()
        return
      }

      setProgress(targetPct)
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    startDrag(e.clientX)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    startDrag(e.touches[0].clientX)
  }

  const handleEnd = () => {
    if (dragging) {
      setDragging(false)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (progress < 1) setProgress(0)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '320px' }}>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>slide to complete (8s)</p>
      <div
        ref={trackRef}
        style={{ position: 'relative', width: '100%', height: '48px', background: 'var(--color-surface-tertiary)', borderRadius: '24px', cursor: 'pointer', overflow: 'hidden', userSelect: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleEnd}
      >
        <div
          style={{ position: 'absolute', inset: '4px 0', left: 0, background: 'var(--color-accent)', borderRadius: '24px', transition: 'none', width: `${progress * 100}%` }}
        />
        <div
          style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            width: '40px', height: '40px', background: 'white', borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            left: `calc(${progress * 100}% - ${progress * 40}px)`,
            transition: 'none',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  )
}
