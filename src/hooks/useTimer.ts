import { useState, useEffect, useCallback } from 'react'

export function useTimer() {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const getRemaining = useCallback((endTime: number): number => {
    return Math.max(0, endTime - now)
  }, [now])

  // Compact countdown shared by the strict ring + header pill. Same value in
  // both places by construction: callers render formatCountdown(ms) directly.
  // "19m" / "45s" / "1h 5m" — minute resolution, zero-unit dropped.
  const formatCountdown = useCallback((ms: number): string => {
    const totalSec = Math.ceil(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`
    if (m > 0) return `${m}m`
    const s = totalSec % 60
    return `${s}s`
  }, [])

  const formatTime = useCallback((ms: number): string => {
    const totalSec = Math.ceil(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    if (h > 0) return `${h}h ${m}m ${s}s`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }, [])

  return { now, getRemaining, formatTime, formatCountdown }
}
