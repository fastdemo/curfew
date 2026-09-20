export type UsageRange = 'today' | 'week' | 'month'

export const RANGE_LABEL: Record<UsageRange, string> = {
  today: 'today',
  week: 'this week',
  month: 'this month',
}

export function fmtDuration(ms: number): string {
  const m = Math.floor(ms / 60000)
  if (m < 60) return `${m}m`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}
