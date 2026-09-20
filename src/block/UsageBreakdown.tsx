import { useState, useEffect, useMemo } from 'react'
import type { ChromeStorage } from '../types'
import { useBlockTheme } from './theme'

type Range = 'today' | 'week' | 'month'

// Usage breakdown on the block page: current-domain share of tracked time +
// top domains list. Logic mirrors the old analytics pie (today/week/month
// windows, top 6, 1s refresh) minus the animated ring.
export function UsageBreakdown({ highlightDomain }: { highlightDomain?: string }) {
  const c = useBlockTheme()
  const [range, setRange] = useState<Range>('today')
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

  const total = rows.reduce((s, e) => s + e.time, 0)
  const mine = highlightDomain ? (rows.find((d) => d.domain === highlightDomain)?.time ?? 0) : 0
  const pct = total > 0 ? Math.round((mine / total) * 100) : 0

  const fmt = (ms: number) => {
    const m = Math.floor(ms / 60000)
    if (m < 60) return `${m}m`
    return `${Math.floor(m / 60)}h ${m % 60}m`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%' }}>
      <div
        style={{
          display: 'flex', gap: 3, padding: 3,
          backgroundColor: c.inset, border: `1px solid ${c.border}`,
          borderRadius: 8, width: 'fit-content', margin: '0 auto', alignItems: 'center',
        }}
      >
        {(['today', 'week', 'month'] as Range[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            style={{
              padding: '5px 10px',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: range === r ? 600 : 500,
              backgroundColor: range === r ? c.accent : 'transparent',
              color: range === r ? c.onAccent : c.tertiary,
            }}
          >
            {r === 'today' ? 'today' : r === 'week' ? 'this week' : 'this month'}
          </button>
        ))}
      </div>
      <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: c.primary, lineHeight: 1 }}>
        {pct}% <span style={{ fontSize: 10.5, fontWeight: 400, color: c.tertiary }}>of screen time</span>
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {rows.length === 0 ? (
          <p style={{ margin: 0, fontSize: 11, color: c.tertiary, textAlign: 'center' }}>no usage data yet</p>
        ) : (
          rows.map((e) => {
            const hot = e.domain === highlightDomain
            return (
              <div key={e.domain} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: `1px solid ${c.border}` }}>
                <img
                  src={`https://www.google.com/s2/favicons?domain=${e.domain}&sz=32`}
                  alt=""
                  width={14}
                  height={14}
                  style={{ width: 14, height: 14, borderRadius: 3, flexShrink: 0 }}
                />
                <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, fontWeight: hot ? 600 : 400, color: hot ? c.primary : c.secondary }}>
                  {e.domain}
                </span>
                <span style={{
                  flexShrink: 0,
                  fontSize: 11,
                  fontWeight: hot ? 600 : 500,
                  padding: '2px 7px',
                  borderRadius: 999,
                  color: hot ? c.onAccent : c.secondary,
                  backgroundColor: hot ? c.accent : c.inset,
                  border: `1px solid ${hot ? c.accent : c.border}`,
                }}>
                  {fmt(e.time)}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
