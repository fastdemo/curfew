import { Intervention, InterventionId } from '../types'

export const INTERVENTIONS: Intervention[] = [
  { id: 'instant', title: 'instant block', time: '0s', duration: 0 },
  { id: 'hold', title: 'hold to complete', time: '8s', duration: 8000 },
  { id: 'slide', title: 'slide in out', time: '8s', duration: 8000 },
  { id: 'breathing', title: 'breathing', time: '19s', duration: 19000 },
]

export function getRandomIntervention(selectedIds: InterventionId[]): Intervention {
  if (selectedIds.length === 0) return INTERVENTIONS[0]
  const filtered = INTERVENTIONS.filter(i => selectedIds.includes(i.id))
  return filtered[Math.floor(Math.random() * filtered.length)]
}

export function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

const DOMAIN_ALIASES: Record<string, string[]> = {
  'x.com': ['twitter.com', 't.co'],
  'twitter.com': ['x.com', 't.co'],
  't.co': ['x.com', 'twitter.com'],
}

function isWebsiteBlocked(domain: string, blockedValue: string): boolean {
  const aliases = DOMAIN_ALIASES[blockedValue] || []
  const candidates = [blockedValue, ...aliases]
  return candidates.some(d => domain === d || domain.endsWith('.' + d))
}

function isBypassed(domain: string, bypasses?: { [domain: string]: number }): boolean {
  if (!bypasses) return false
  if (bypasses[domain] && bypasses[domain] > Date.now()) return true
  // check aliases for bypass as well
  const aliases = DOMAIN_ALIASES[domain] || []
  return aliases.some(a => bypasses[a] && bypasses[a] > Date.now())
}

export function shouldBlockUrl(
  url: string,
  blockedItems: { type: string; value: string }[],
  bypasses?: { [domain: string]: number }
): boolean {
  if (!blockedItems.length) return false

  const domain = getDomainFromUrl(url)

  if (isBypassed(domain, bypasses)) {
    return false
  }

  return blockedItems.some(item => {
    if (item.type === 'website') {
      return isWebsiteBlocked(domain, item.value)
    }
    if (item.type === 'keyword') {
      return url.toLowerCase().includes(item.value.toLowerCase())
    }
    return false
  })
}

export function isScheduleActive(schedules: { startTime: string; endTime: string; daysOfWeek: number[]; isActive: boolean }[]): boolean {
  const now = new Date()
  const day = now.getDay()
  const time = now.getHours() * 60 + now.getMinutes()

  return schedules.some(s => {
    if (!s.isActive) return false
    if (!s.daysOfWeek.includes(day)) return false

    const [startH, startM] = s.startTime.split(':').map(Number)
    const [endH, endM] = s.endTime.split(':').map(Number)
    const start = startH * 60 + startM
    const end = endH * 60 + endM

    if (end > start) return time >= start && time < end
    return time >= start || time < end
  })
}
