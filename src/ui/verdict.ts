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

/**
 * The single status sentence for home (direction A). Priority matches the
 * blocking engine exactly: strict session > running schedule > masterToggle.
 * The card shows state, not stats: focus on / focus off / schedule name /
 * strict countdown. The full schedule name shows (caller ellipsizes).
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
    return { kind: 'schedule', line: running.name }
  }

  if (storage.masterToggle) {
    return { kind: 'manual', line: 'focus on' }
  }

  return { kind: 'idle', line: 'focus off' }
}
