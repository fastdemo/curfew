import { useState, useRef, useCallback, useEffect } from 'react'
import { WARM_SURFACE, WARM_TEXT_SECONDARY, WARM_ACCENT, WARM_CARD, WARM_BORDER } from './palette'

interface InterventionSlideProps {
  onComplete: () => void
}

export default function InterventionSlide({ onComplete }: InterventionSlideProps) {
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [completed, setCompleted] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const completedRef = useRef(false)

  const getProgressFromClientX = useCallback((clientX: number) => {
    if (!trackRef.current) return 0
    const rect = trackRef.current.getBoundingClientRect()
    const thumbWidth = 40
    const usableWidth = rect.width - thumbWidth
    const x = clientX - rect.left - thumbWidth / 2
    return Math.max(0, Math.min(x / usableWidth, 1))
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (completedRef.current) return
    const target = e.currentTarget as HTMLDivElement
    target.setPointerCapture(e.pointerId)
    setDragging(true)
    setProgress(getProgressFromClientX(e.clientX))
  }, [getProgressFromClientX])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || completedRef.current) return
    const p = getProgressFromClientX(e.clientX)
    setProgress(p)
    if (p >= 0.98) {
      completedRef.current = true
      setCompleted(true)
      setDragging(false)
      setProgress(1)
      onComplete()
    }
  }, [dragging, getProgressFromClientX, onComplete])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const target = e.currentTarget as HTMLDivElement
    try { target.releasePointerCapture(e.pointerId) } catch { /* ignore */ }
    if (completedRef.current) return
    if (dragging) {
      setDragging(false)
      if (progress < 0.98) {
        setProgress(0)
      }
    }
  }, [dragging, progress])

  // also handle pointer cancel/leave
  const handlePointerCancel = useCallback(() => {
    if (completedRef.current) return
    setDragging(false)
    setProgress(0)
  }, [])

  useEffect(() => {
    return () => { completedRef.current = false }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '320px' }}>
      <p style={{ fontSize: '14px', color: WARM_TEXT_SECONDARY }}>
        {completed ? 'completed' : 'slide to the end to continue'}
      </p>
      <div
        ref={trackRef}
        style={{ position: 'relative', width: '100%', height: '48px', background: WARM_SURFACE, borderRadius: '24px', cursor: dragging ? 'grabbing' : 'grab', overflow: 'hidden', userSelect: 'none', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div
          style={{
            position: 'absolute',
            top: 4,
            bottom: 4,
            left: 4,
            background: WARM_ACCENT,
            borderRadius: '24px',
            transition: dragging ? 'none' : 'width 0.25s ease',
            width: `calc(${progress * 100}% - ${progress * 4}px)`,
            maxWidth: 'calc(100% - 8px)',
          }}
        />
        <div
          style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            width: '40px', height: '40px', background: WARM_CARD, borderRadius: '50%',
            border: `1px solid ${WARM_BORDER}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            left: `calc(${progress * 100}% - ${progress * 40}px)`,
            transition: dragging ? 'none' : 'left 0.25s ease',
            boxShadow: dragging ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={WARM_ACCENT} strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  )
}
