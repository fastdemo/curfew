import { useState, useRef, useCallback, useEffect } from 'react'
import { useBlockTheme } from './theme'

// Slide-to-continue friction. Logic mirrors the old intervention: pointer
// drag along the track, release before ~98% snaps back, reaching the end
// completes exactly once.
export function SlideToContinue({ onComplete }: { onComplete: () => void }) {
  const c = useBlockTheme()
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [finished, setFinished] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef(false)

  const fromX = useCallback((clientX: number) => {
    if (!trackRef.current) return 0
    const rect = trackRef.current.getBoundingClientRect()
    const thumb = 40
    const x = clientX - rect.left - thumb / 2
    return Math.max(0, Math.min(x / (rect.width - thumb), 1))
  }, [])

  const down = useCallback((e: React.PointerEvent) => {
    if (doneRef.current) return
    ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
    setDragging(true)
    setProgress(fromX(e.clientX))
  }, [fromX])

  const move = useCallback((e: React.PointerEvent) => {
    if (!dragging || doneRef.current) return
    const p = fromX(e.clientX)
    setProgress(p)
    if (p >= 0.98) {
      doneRef.current = true
      setFinished(true)
      setDragging(false)
      setProgress(1)
      onComplete()
    }
  }, [dragging, fromX, onComplete])

  const up = useCallback((e: React.PointerEvent) => {
    try { (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId) } catch { /* ignore */ }
    if (doneRef.current) return
    if (dragging) {
      setDragging(false)
      if (progress < 0.98) setProgress(0)
    }
  }, [dragging, progress])

  const cancel = useCallback(() => {
    if (doneRef.current) return
    setDragging(false)
    setProgress(0)
  }, [])

  useEffect(() => () => { doneRef.current = false }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 320 }}>
      <p style={{ margin: 0, fontSize: 14, color: c.secondary }}>
        {finished ? 'completed' : 'slide to the end to continue'}
      </p>
      <div
        ref={trackRef}
        style={{ position: 'relative', width: '100%', height: 48, background: c.inset, borderRadius: 24, cursor: dragging ? 'grabbing' : 'grab', overflow: 'hidden', userSelect: 'none', touchAction: 'none' }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={cancel}
      >
        <div
          style={{
            position: 'absolute', top: 4, bottom: 4, left: 4,
            background: c.accent, borderRadius: 24,
            transition: dragging ? 'none' : 'width 250ms ease',
            width: `calc(${progress * 100}% - ${progress * 4}px)`,
            maxWidth: 'calc(100% - 8px)',
          }}
        />
        <div
          style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            width: 40, height: 40, background: c.card, borderRadius: '50%',
            border: `1px solid ${c.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            left: `calc(${progress * 100}% - ${progress * 40}px)`,
            transition: dragging ? 'none' : 'left 250ms ease',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.accent} strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  )
}
