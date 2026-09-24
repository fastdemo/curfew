import { useState, useRef, useCallback, useEffect } from 'react'
import { useBlockTheme } from './theme'
import { useHoldTiming, SLIDE_DURATION } from './useHoldTiming'

// Slide-to-continue friction. Same elapsed-time gate as hold-to-complete:
// the thumb only travels as far as 8s of accumulated press time allows, so
// the slider physically cannot finish faster than the duration no matter how
// fast it's dragged. The thumb follows the drag but is clamped to the earned
// time budget; the track fill shows the time budget itself, so the pacing
// reads as intentional. Completion needs BOTH: full 8s budget AND the thumb
// dragged to the end — a pure press with no slide never completes.
// Release before finishing snaps the thumb back to 0 (budget kept).
export function SlideToContinue({ onComplete }: { onComplete: () => void }) {
  const c = useBlockTheme()
  const [dragX, setDragX] = useState(0)
  const [finished, setFinished] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef(false)

  // Time budget drives the gate; completion is decided below (budget full +
  // thumb at the end), so the hook's own callback is a no-op.
  const { progress: budget, holding, begin, release } = useHoldTiming(SLIDE_DURATION, () => {})
  const budgetFull = budget >= 1
  // Once the budget is full the timer is spent, but dragging must stay live
  // so the user can still slide to the end.
  const active = holding || budgetFull

  const fromX = useCallback((clientX: number) => {
    if (!trackRef.current) return 0
    const rect = trackRef.current.getBoundingClientRect()
    const thumb = 40
    const x = clientX - rect.left - thumb / 2
    return Math.max(0, Math.min(x / (rect.width - thumb), 1))
  }, [])

  // Thumb shows the drag, clamped to the earned time budget.
  const shown = Math.min(dragX, budget)

  useEffect(() => {
    if (doneRef.current || !budgetFull || dragX < 0.98) return
    doneRef.current = true
    setFinished(true)
    setDragX(1)
    onComplete()
  }, [budgetFull, dragX, onComplete])

  const handleDown = useCallback((e: React.PointerEvent) => {
    if (doneRef.current) return
    ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
    setDragX(fromX(e.clientX))
    begin()
  }, [fromX, begin])

  const handleMove = useCallback((e: React.PointerEvent) => {
    if (!active || doneRef.current) return
    setDragX(fromX(e.clientX))
  }, [active, fromX])

  const endDrag = useCallback((e: React.PointerEvent) => {
    try { (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId) } catch { /* ignore */ }
    if (doneRef.current) return
    release(false)
    // Snap back unless already completed.
    if (!doneRef.current) setDragX(0)
  }, [release])

  const handleCancel = useCallback(() => {
    if (doneRef.current) return
    release(false)
    setDragX(0)
  }, [release])

  const pct = Math.round(budget * 100)
  const remaining = Math.max(0, Math.ceil(SLIDE_DURATION / 1000 - (budget * SLIDE_DURATION) / 1000))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: '320px' }}>
      <p style={{ margin: 0, fontSize: 14, color: c.secondary }}>
        {finished
          ? 'completed'
          : budgetFull
            ? 'now slide to the end'
            : holding
              ? `keep holding · ${remaining}s left`
              : 'press and hold, then slide to the end'}
      </p>
      <div
        ref={trackRef}
        style={{ position: 'relative', width: '100%', height: '48px', background: c.inset, borderRadius: '24px', cursor: active ? 'grabbing' : 'grab', overflow: 'hidden', userSelect: 'none', touchAction: 'none' }}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={endDrag}
        onPointerCancel={handleCancel}
      >
        {/* Fill = earned time budget (the pacing signal). Starts at 0. */}
        <div
          style={{
            position: 'absolute',
            top: 4,
            bottom: 4,
            left: 4,
            background: c.accent,
            borderRadius: '24px',
            transition: active ? 'none' : 'width 250ms ease',
            width: budget <= 0 ? 0 : `calc(${budget * 100}% - ${budget * 4}px)`,
            maxWidth: 'calc(100% - 8px)',
          }}
        />
        {/* Thumb = drag position, clamped to the earned budget. */}
        <div
          style={{
            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
            width: '40px', height: '40px', background: c.card, borderRadius: '50%',
            border: `1px solid ${c.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            left: shown <= 0 ? 0 : `calc(${shown * 100}% - ${shown * 40}px)`,
            transition: active ? 'none' : 'left 250ms ease',
            boxShadow: active ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.accent} strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
      {/* Thin time-budget bar under the track: 8s pacing made explicit. */}
      <div style={{ width: '100%', height: 4, borderRadius: 2, background: c.inset, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 2, background: c.accent, transition: active ? 'none' : 'width 250ms ease' }} />
      </div>
    </div>
  )
}
