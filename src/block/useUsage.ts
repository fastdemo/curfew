import { useState, useEffect, useMemo } from 'react'
import type { ChromeStorage } from '../types'
import { RANGE_LABEL, fmtDuration, type UsageRange } from './usage'

export function useUsageRows(range: UsageRange) {
  const [stats, setStats] = useState<ChromeStorage['usageStats']>({})

  useEffect(() => {
    chrome.storage.local.get('usageStats', (result) => {
      setStats((result.usageStats as ChromeStorage['usageStats']) || {})
    })
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.usageStats) setStats(changes.usageStats.newValue as ChromeStorage['usageStats'])
    }
    chrome.storage.onChanged.addListener(listener)
    const poll = setInterval(() => {
      chrome.storage.local.get('usageStats', (result) => {
        setStats((result.usageStats as ChromeStorage['usageStats']) || {})
      })
    }, 1000)
    return () => {
      chrome.storage.onChanged.removeListener(listener)
      clearInterval(poll)
    }
  }, [])

  const rows = useMemo(() => {
    const now = new Date()
    const start = new Date(now)
    if (range === 'week') start.setDate(start.getDate() - start.getDay())
    if (range === 'month') start.setDate(1)
    const from = start.toISOString().slice(0, 10)
    const entries: { domain: string; time: number }[] = []
    for (const [domain, dates] of Object.entries(stats)) {
      let total = 0
      for (const e of dates) if (e.date >= from) total += e.timeSpent
      if (total > 0) entries.push({ domain, time: total })
    }
    entries.sort((a, b) => b.time - a.time)
    return entries.slice(0, 6)
  }, [stats, range])

  return rows
}

// Back-compat wrapper for callers that want the whole breakdown in one
// component. BlockView composes the pieces directly instead.
export function useUsageShare(
  rows: { domain: string; time: number }[],
  highlightDomain?: string,
): number {
  return useMemo(() => {
    const total = rows.reduce((s, e) => s + e.time, 0)
    const mine = highlightDomain ? (rows.find((d) => d.domain === highlightDomain)?.time ?? 0) : 0
    return total > 0 ? Math.round((mine / total) * 100) : 0
  }, [rows, highlightDomain])
}

export { RANGE_LABEL, fmtDuration }
export type { UsageRange }
