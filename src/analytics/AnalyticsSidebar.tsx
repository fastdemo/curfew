import { useState, useEffect, useMemo, useRef } from 'react'
import { ChromeStorage } from '../types'
import { WARM_BORDER, WARM_SURFACE, WARM_TEXT_PRIMARY, WARM_TEXT_SECONDARY, WARM_TEXT_TERTIARY, WARM_ACCENT, WARM_ON_ACCENT } from '../block/palette'

type TimeRange = 'today' | 'week' | 'month'

interface AnalyticsPieProps {
  highlightDomain?: string
}

const SIZE = 148
const STROKE = 11
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function AnalyticsPie({ highlightDomain }: AnalyticsPieProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('today')
  const [stats, setStats] = useState<ChromeStorage['usageStats']>({})
  const [animatedPct, setAnimatedPct] = useState(0)
  const animRef = useRef<number | null>(null)
  const animatedPctRef = useRef(0)

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

  useEffect(() => {
    animatedPctRef.current = animatedPct
  }, [animatedPct])

  useEffect(() => {
    if (animRef.current !== null) cancelAnimationFrame(animRef.current)
    const from = animatedPctRef.current
    const to = percentage
    const start = performance.now()
    const duration = 450
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const val = from + (to - from) * easeOut(t)
      animatedPctRef.current = val
      setAnimatedPct(val)
      if (t < 1) animRef.current = requestAnimationFrame(tick)
      else animRef.current = null
    }
    animRef.current = requestAnimationFrame(tick)
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current)
      animRef.current = null
    }
  }, [percentage, timeRange])

  useEffect(() => () => {
    if (animRef.current !== null) cancelAnimationFrame(animRef.current)
  }, [])

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000)
    if (mins < 60) return `${mins}m`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h ${m}m`
  }

  const faviconFor = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=32`

  const dashOffset = CIRCUMFERENCE * (1 - animatedPct / 100)

  return (
    <>
      <style>{`
        @keyframes curfew-fade-slide {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>

        <div style={{ display: 'flex', gap: '4px', padding: '4px', backgroundColor: WARM_SURFACE, border: `1px solid ${WARM_BORDER}`, borderRadius: '12px', width: 'fit-content', margin: '0 auto', alignItems: 'center' }}>
          {(['today', 'week', 'month'] as TimeRange[]).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '6px 14px',
                borderRadius: '9px',
                fontSize: '12.5px',
                fontWeight: timeRange === range ? 600 : 500,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: timeRange === range ? WARM_ACCENT : 'transparent',
                color: timeRange === range ? WARM_ON_ACCENT : WARM_TEXT_TERTIARY,
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
            >
              {range === 'today' ? 'today' : range === 'week' ? 'this week' : 'this month'}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={WARM_BORDER}
              strokeWidth={STROKE}
            />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={WARM_ACCENT}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
            <span style={{ fontSize: '26px', fontWeight: 800, color: WARM_TEXT_PRIMARY, fontFamily: 'inherit', lineHeight: 1 }}>
              {Math.round(animatedPct)}%
            </span>
            <span style={{ fontSize: '11px', color: WARM_TEXT_TERTIARY }}>
              of screen time
            </span>
          </div>
        </div>

        <div key={timeRange} style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%', animation: 'curfew-fade-slide 0.3s ease-out' }}>
          {data.length === 0 ? (
            <p style={{ fontSize: '12px', color: WARM_TEXT_TERTIARY, textAlign: 'center', margin: 0 }}>no usage data yet</p>
          ) : (
            data.map((entry) => {
              const isHighlighted = entry.domain === highlightDomain
              return (
                <div key={entry.domain} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: `1px solid ${WARM_BORDER}` }}>
                  <img
                    src={faviconFor(entry.domain)}
                    alt=""
                    width={16}
                    height={16}
                    style={{ width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0 }}
                  />
                  <span style={{ color: isHighlighted ? WARM_TEXT_PRIMARY : WARM_TEXT_SECONDARY, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', fontWeight: isHighlighted ? 600 : 400 }}>
                    {entry.domain}
                  </span>
                  <span style={{
                    color: isHighlighted ? WARM_ON_ACCENT : WARM_TEXT_SECONDARY,
                    fontSize: '12px',
                    fontWeight: isHighlighted ? 600 : 500,
                    backgroundColor: isHighlighted ? WARM_ACCENT : WARM_SURFACE,
                    border: `1px solid ${isHighlighted ? WARM_ACCENT : WARM_BORDER}`,
                    padding: '2px 10px',
                    borderRadius: '999px',
                    flexShrink: 0,
                  }}>
                    {formatTime(entry.time)}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
