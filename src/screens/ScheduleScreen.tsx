import { useState } from 'react'
import type { ChromeStorage } from '../types'
import { useTheme } from '../ui/theme'
import { Switch } from '../ui/Switch'

interface Props {
  storage: ChromeStorage & { update: (p: Partial<ChromeStorage>) => Promise<void> }
}

// Monday-first week: columns run Mon..Sun, stored as JS day numbers.
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const
const DAY_IDS = [1, 2, 3, 4, 5, 6, 0] as const
// JS day number (0=Sun..6=Sat) -> Monday-first display name.
const DAY_NAME_BY_ID = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

function short(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const ap = h >= 12 ? 'pm' : 'am'
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')}${ap}`
}

function windowLabel(s: { startTime: string; endTime: string; daysOfWeek: number[] }): string {
  const days =
    s.daysOfWeek.length === 7
      ? 'daily'
      : s.daysOfWeek.length >= 5 && [1, 2, 3, 4, 5].every((d) => s.daysOfWeek.includes(d)) && s.daysOfWeek.length === 5
        ? 'weekdays'
        : [...s.daysOfWeek].sort((a, b) => a - b).map((d) => DAY_NAME_BY_ID[d]).join(' ')
  return `${short(s.startTime)}–${short(s.endTime)} · ${days}`
}

// Schedule: automation rules. List-first: each rule is one row (name + window
// + days, switch + delete). Add-form opens below, same card language. Accent
// only on save + selected days + enabled rows' state.
export function ScheduleScreen({ storage }: Props) {
  const t = useTheme()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('17:00')
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5])

  const items = storage.schedules
  const canSave = name.trim().length > 0 && days.length > 0

  const save = async () => {
    if (!canSave) return
    if (editingId) {
      await storage.update({
        schedules: items.map((s) =>
          s.id === editingId
            ? { ...s, name: name.trim(), startTime: start, endTime: end, daysOfWeek: days }
            : s,
        ),
      })
    } else {
      await storage.update({
        schedules: [
          ...items,
          { id: crypto.randomUUID(), name: name.trim(), startTime: start, endTime: end, daysOfWeek: days, isActive: true },
        ],
      })
    }
    closeEditor()
  }

  const flipDay = (d: number) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))

  const flipActive = async (id: string, isActive: boolean) => {
    await storage.update({
      schedules: items.map((s) => (s.id === id ? { ...s, isActive } : s)),
    })
  }

  // Edit flow: tapping a row loads it into the form; saving writes back to
  // the same id (accent save), cancel/discard resets to add-mode.
  const [editingId, setEditingId] = useState<string | null>(null)

  const openEditor = (id: string | null) => {
    if (id === null) {
      setEditingId(null)
      setName('')
      setStart('09:00')
      setEnd('17:00')
      setDays([1, 2, 3, 4, 5])
      setOpen(true)
      return
    }
    const s = items.find((x) => x.id === id)
    if (!s) return
    setEditingId(s.id)
    setName(s.name)
    setStart(s.startTime)
    setEnd(s.endTime)
    setDays([...s.daysOfWeek])
    setOpen(true)
  }

  const closeEditor = () => {
    setOpen(false)
    setEditingId(null)
    setName('')
    setStart('09:00')
    setEnd('17:00')
    setDays([1, 2, 3, 4, 5])
  }

  const remove = async (id: string) => {
    await storage.update({ schedules: items.filter((s) => s.id !== id) })
  }

  const label = {
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1.3,
    color: t.textSecondary,
    margin: '0 0 6px',
  } as const

  const field = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '8px 10px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    color: t.textPrimary,
    backgroundColor: t.bgApp,
    border: `1px solid ${t.border}`,
    outline: 'none',
  } as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <p style={label}>{items.length === 0 ? 'schedules' : `schedules · ${items.length}`}</p>
        {items.length === 0 && !open ? (
          <div
            style={{
              padding: '18px 14px',
              borderRadius: 12,
              textAlign: 'center',
              backgroundColor: t.bgSurface,
              border: `1px solid ${t.border}`,
            }}
          >
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
              no schedules yet
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 11, lineHeight: 1.4, color: t.textSecondary }}>
              blocking turns on automatically in each window.
            </p>
          </div>
        ) : (
          items.length > 0 && (
            <div
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: t.bgSurface,
                border: `1px solid ${t.border}`,
              }}
            >
              {items.map((s, i) => (
                <div
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`edit ${s.name}`}
                  onClick={() => openEditor(s.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openEditor(s.id) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 8px 9px 12px',
                    borderTop: i > 0 ? `1px solid ${t.border}` : 'none',
                    opacity: s.isActive ? 1 : 0.55,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 600,
                        lineHeight: 1.3,
                        color: t.textPrimary,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {s.name}
                    </p>
                    <p style={{ margin: '1px 0 0', fontSize: 11, color: t.textSecondary }}>
                      {windowLabel(s)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); void remove(s.id) }}
                    aria-label={`delete ${s.name}`}
                    style={{
                      width: 26,
                      height: 26,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      borderRadius: 6,
                      background: 'transparent',
                      cursor: 'pointer',
                      color: t.textTertiary,
                    }}
                  >
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <span onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexShrink: 0 }}>
                    <Switch
                      checked={s.isActive}
                      onChange={() => void flipActive(s.id, !s.isActive)}
                      label={`${s.name} enabled`}
                    />
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {!open ? (
        <button
          type="button"
          onClick={() => openEditor(null)}
          style={{
            width: '100%',
            height: 38,
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: items.length === 0 ? 600 : 500,
            backgroundColor: items.length === 0 ? t.accent : t.bgSurface,
            color: items.length === 0 ? t.onAccent : t.textSecondary,
            border: items.length === 0 ? 'none' : `1px solid ${t.border}`,
          }}
        >
          + new schedule
        </button>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: 12,
            borderRadius: 12,
            backgroundColor: t.bgSurface,
            border: `1px solid ${t.border}`,
          }}
        >
          <div>
            <p style={label}>name</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="work hours"
              aria-label="schedule name"
              style={field}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <p style={label}>from</p>
              <input type="time" value={start} onChange={(e) => setStart(e.target.value)} aria-label="start time" style={field} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={label}>until</p>
              <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} aria-label="end time" style={field} />
            </div>
          </div>
          <div>
            <p style={label}>days</p>
            <div style={{ display: 'flex', gap: 5 }}>
              {DAYS.map((d, ci) => {
                const i = DAY_IDS[ci]
                const on = days.includes(i)
                return (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={on}
                    aria-label={DAY_NAME_BY_ID[i]}
                    onClick={() => flipDay(i)}
                    style={{
                      flex: 1,
                      height: 30,
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor: on ? t.accent : t.bgApp,
                      color: on ? t.onAccent : t.textSecondary,
                      border: `1px solid ${on ? t.accent : t.border}`,
                    }}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={closeEditor}
              style={{
                flex: 1,
                height: 38,
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                backgroundColor: 'transparent',
                color: t.textSecondary,
                border: `1px solid ${t.border}`,
              }}
            >
              cancel
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={!canSave}
              style={{
                flex: 1,
                height: 38,
                border: 'none',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                backgroundColor: t.accent,
                color: t.onAccent,
                opacity: canSave ? 1 : 0.45,
                cursor: canSave ? 'pointer' : 'not-allowed',
              }}
            >
              save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
