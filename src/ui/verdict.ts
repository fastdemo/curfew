import type { ChromeStorage } from '../types'
import { isScheduleActive } from '../lib/interventions'

export type VerdictKind = 'strict' | 'schedule' | 'manual' | 'idle'

export interface Verdict {
  kind: VerdictKind
  /** One line, never wraps. Shortened rather than wrapped. */
  line: string
}

function endLabel(endTime: number): string {
  const d = new Date(endTime)
  let h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'pm' : 'am'
  h = h % 12 || 12
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`
}

function plural(n: number, one: string, many: string): string {
  return n === 1 ? `1 ${one}` : `${n} ${many}`
}

/**
 * The single status sentence for home (direction A). Priority matches the
 * blocking engine exactly: strict session > running schedule > masterToggle.
 * Every branch is one short line; long names/times are truncated by the
 * caller via CSS ellipsis, never wrapped.
 */
export function verdictFor(
  storage: Pick<ChromeStorage, 'masterToggle' | 'blockedItems' | 'schedules' | 'strictSession'>,
  now: number,
): Verdict {
  const strictLive =
    storage.strictSession.isActive && now < storage.strictSession.endTime

  if (strictLive) {
    return { kind: 'strict', line: `locked until ${endLabel(storage.strictSession.endTime)}` }
  }

  const running = storage.schedules.find(
    (s) => s.isActive && isScheduleActive([s]),
  )
  if (running) {
    const name =
      running.name.length > 18 ? `${running.name.slice(0, 17)}…` : running.name
    return { kind: 'schedule', line: `on schedule · ${name}` }
  }

  if (storage.masterToggle) {
    const sites = storage.blockedItems.filter((i) => i.type === 'website').length
    const keywords = storage.blockedItems.length - sites
    if (sites > 0 && keywords > 0) {
      return {
        kind: 'manual',
        line: `blocking ${sites + keywords} items`,
      }
    }
    if (sites > 0) {
      return { kind: 'manual', line: `blocking ${plural(sites, 'site', 'sites')}` }
    }
    if (keywords > 0) {
      return { kind: 'manual', line: `blocking ${plural(keywords, 'keyword', 'keywords')}` }
    }
    return { kind: 'manual', line: 'blocking · list is empty' }
  }

  return { kind: 'idle', line: 'everything is open' }
}
