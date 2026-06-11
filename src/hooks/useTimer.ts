import { useState, useEffect, useCallback } from 'react'

export function useTimer() {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const getRemaining = useCallback((endTime: number): number => {
    return Math.max(0, endTime - now)
  }, [now])

  const formatTime = useCallback((ms: number): string => {
    const totalSec = Math.ceil(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    if (h > 0) return `${h}h ${m}m ${s}s`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }, [])

  return { now, getRemaining, formatTime }
}
