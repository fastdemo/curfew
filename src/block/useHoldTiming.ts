import { useState, useRef, useEffect, useCallback } from 'react'

// Elapsed-time-gated timing shared by the press-and-hold (HoldToComplete)
// and slide (SlideToContinue) frictions. Progress only advances while the
// pointer is held down; release either pauses (reset=false, keeps progress)
// or snaps back to 0 (reset=true). Completing the full duration fires once.
export const SLIDE_DURATION = 8000

interface HoldTiming {
  progress: number
  holding: boolean
  begin: () => void
  release: (reset: boolean) => void
}

export function useHoldTiming(duration: number, onComplete: () => void): HoldTiming {
  const [progress, setProgress] = useState(0)
  const [holding, setHolding] = useState(false)
  const startRef = useRef(0)
  const rafRef = useRef(0)
  const holdingRef = useRef(false)
  const doneRef = useRef(false)
  const progressRef = useRef(0)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const begin = useCallback(() => {
    if (doneRef.current) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    holdingRef.current = true
    setHolding(true)
    startRef.current = Date.now() - progressRef.current * duration
    const tick = () => {
      const pct = Math.min((Date.now() - startRef.current) / duration, 1)
      progressRef.current = pct
      setProgress(pct)
      if (pct >= 1) {
        doneRef.current = true
        holdingRef.current = false
        setHolding(false)
        onCompleteRef.current()
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [duration])

  const release = useCallback((reset: boolean) => {
    if (!holdingRef.current || doneRef.current) return
    holdingRef.current = false
    setHolding(false)
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
    if (reset) {
      progressRef.current = 0
      setProgress(0)
    }
  }, [])

  return { progress, holding, begin, release }
}
