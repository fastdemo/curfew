import { useState, useEffect, useMemo } from 'react'
import { ChromeStorage } from '../types'

type TimeRange = 'today' | 'week' | 'month'

interface AnalyticsPieProps {
  highlightDomain?: string
}

export default function AnalyticsPie({ highlightDomain }: AnalyticsPieProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('today')
  const [stats, setStats] = useState<ChromeStorage['usageStats']>({})

  useEffect(() => {
    chrome.storage.local.get('usageStats', (result) => {
      setStats((result.usageStats as ChromeStorage['usageStats']) || {})
    })

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.usageStats) {
        setStats(changes.usageStats.newValue as ChromeStorage['usageStats'])
      }
    }
    chrome.storage.onChanged.addListener(listener)

    const pollInterval = setInterval(() => {
      chrome.storage.local.get('usageStats', (result) => {
        setStats((result.usageStats as ChromeStorage['usageStats']) || {})
      })
    }, 1000)

    return () => {
      chrome.storage.onChanged.removeListener(listener)
      clearInterval(pollInterval)
    }
  }, [])

  const data = useMemo(() => {
    const now = new Date()
    const getStart = () => {
      const s = new Date(now)
      switch (timeRange) {
        case 'today': break
        case 'week': { s.setDate(s.getDate() - s.getDay()); break }
        case 'month': s.setDate(1); break
      }
      return s.toISOString().slice(0, 10)
    }
    const start = getStart()
    const entries: { domain: string; time: number }[] = []
    for (const [domain, dates] of Object.entries(stats)) {
      let total = 0
      for (const e of dates) if (e.date >= start) total += e.timeSpent
      if (total > 0) entries.push({ domain, time: total })
    }
    entries.sort((a, b) => b.time - a.time)
    return entries.slice(0, 8)
  }, [stats, timeRange])

  const totalTrackedTime = useMemo(() => data.reduce((s, e) => s + e.time, 0), [data])
  const currentDomainTime = useMemo(() => {
    if (!highlightDomain) return 0
    const entry = data.find(d => d.domain === highlightDomain)
    return entry?.time || 0
  }, [data, highlightDomain])

  const percentage = totalTrackedTime > 0 ? (currentDomainTime / totalTrackedTime) * 100 : 0

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000)
    if (mins < 60) return `${mins}m`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h ${m}m`
  }

  const getCircleColor = (siteTime: number, totalTime: number) => {
    if (totalTime === 0 || siteTime === 0) return 'var(--color-circle-low)'
    const ratio = siteTime / totalTime
    if (ratio > 0.5) return 'var(--color-circle-high)'
    if (ratio > 0.1) return 'var(--color-circle-med)'
    return 'var(--color-circle-low)'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '300px' }}>
      <div style={{ display: 'flex', gap: '8px', padding: '4px', backgroundColor: 'var(--color-surface-secondary)', borderRadius: '12px', width: 'fit-content', margin: '0 auto', alignItems: 'center' }}>
        {(['today', 'week', 'month'] as TimeRange[]).map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            style={{
              padding: '6px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: timeRange === range ? 600 : 500,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: timeRange === range ? 'var(--color-accent)' : 'transparent',
              color: timeRange === range ? '#F3EEEA' : 'var(--color-text-muted)',
              transition: 'all 0.2s',
            }}
          >
            {range === 'today' ? 'today' : range === 'week' ? 'this week' : 'this month'}
          </button>
        ))}
      </div>

      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: `conic-gradient(var(--color-accent) 0% ${percentage}%, var(--color-surface-secondary) ${percentage}% 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 0 0 16px var(--color-surface)',
      }}>
        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '16px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
          {Math.round(percentage)}%
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%', maxWidth: '240px' }}>
        {data.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center' }}>no usage data yet</p>
        ) : (
          data.map((entry) => (
            <div key={entry.domain} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '2px 0' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, background: getCircleColor(entry.time, totalTrackedTime) }} />
              <span style={{ color: 'var(--color-text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.domain}</span>
              <span style={{ color: 'var(--color-text-muted)' }}>{formatTime(entry.time)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
