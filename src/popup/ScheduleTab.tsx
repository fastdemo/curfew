import { useState } from 'react'
import { ChromeStorage, Schedule } from '../types'
import { useTheme } from '../lib/theme-context'
import SectionHeader from './components/SectionHeader'
import RowItem from './components/RowItem'
import Toggle from './components/Toggle'

interface ScheduleTabProps {
  storage: ChromeStorage & { loading: boolean; update: (p: Partial<ChromeStorage>) => Promise<void> }
}

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function ScheduleTab({ storage }: ScheduleTabProps) {
  const theme = useTheme()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('13:00')
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5])

  const addSchedule = async () => {
    if (!name.trim() || days.length === 0) return

    const newSchedule: Schedule = {
      id: crypto.randomUUID(),
      name: name.trim(),
      startTime,
      endTime,
      daysOfWeek: days,
      isActive: true,
    }

    await storage.update({ schedules: [...storage.schedules, newSchedule] })
    setName('')
    setStartTime('09:00')
    setEndTime('13:00')
    setDays([1, 2, 3, 4, 5])
    setShowForm(false)
  }

  const toggleDay = (day: number) => {
    setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const toggleScheduleActive = async (id: string, isActive: boolean) => {
    const updated = storage.schedules.map(s =>
      s.id === id ? { ...s, isActive } : s
    )
    await storage.update({ schedules: updated })
  }

  const deleteSchedule = async (id: string) => {
    await storage.update({ schedules: storage.schedules.filter(s => s.id !== id) })
  }

  const formatTimeDisplay = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    const ampm = h >= 12 ? 'pm' : 'am'
    const h12 = h % 12 || 12
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  const daysLabel = (daysOfWeek: number[]) =>
    daysOfWeek.length === 7
      ? 'Every day'
      : daysOfWeek.map(d => DAYS_SHORT[d]).join(', ')

  const empty = storage.schedules.length === 0 && !showForm

  return (
    <div className="flex flex-col gap-3">
      <section className="flex flex-col gap-2.5">
        <SectionHeader title="schedule" subtitle="auto turn on focus mode at set times" />

        {empty && (
          <div className="flex flex-col items-center gap-3 rounded-xl px-6 py-10 text-center"
            style={{ backgroundColor: theme.surface, border: `1px solid ${theme.borderSoft}` }}>
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.highlight, color: theme.textSecondary }}
            >
              <CalendarIcon size={22} color={theme.textSecondary} />
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                no active schedules
              </span>
              <span className="text-xs leading-relaxed" style={{ color: theme.textSecondary }}>
                automation turns on focus mode at specified times.
              </span>
            </div>
          </div>
        )}

        {storage.schedules.length > 0 && (
          <div
            className="overflow-hidden rounded-xl"
            style={{ backgroundColor: theme.surface, border: `1px solid ${theme.borderSoft}` }}
          >
            {storage.schedules.map((schedule, i) => (
              <RowItem
                key={schedule.id}
                variant="flat"
                divider={i > 0}
                title={schedule.name}
                subtitle={`${formatTimeDisplay(schedule.startTime)} – ${formatTimeDisplay(schedule.endTime)} · ${daysLabel(schedule.daysOfWeek)}`}
                right={
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => deleteSchedule(schedule.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-150"
                      style={{ color: theme.textTertiary }}
                      aria-label="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <Toggle
                      checked={schedule.isActive}
                      onChange={() => toggleScheduleActive(schedule.id, !schedule.isActive)}
                    />
                  </div>
                }
              />
            ))}
          </div>
        )}

        {empty && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-xl py-3 text-sm font-semibold transition-colors duration-150"
            style={{ backgroundColor: theme.accent, color: theme.onAccent }}
          >
            + add schedule
          </button>
        )}

        {!empty && !showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full rounded-xl py-2.5 text-sm font-medium transition-colors duration-150"
            style={{
              backgroundColor: theme.surface,
              color: theme.accent,
              border: `1px dashed ${theme.borderMuted}`,
            }}
          >
            + add schedule
          </button>
        )}

        {showForm && (
          <div
            className="flex flex-col gap-3 rounded-xl p-4"
            style={{ backgroundColor: theme.surface, border: `1px solid ${theme.borderSoft}` }}
          >
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="session name"
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
              style={{ backgroundColor: theme.background, color: theme.textPrimary }}
            />
            <div className="flex gap-2.5">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium" style={{ color: theme.textSecondary }}>start</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
                  style={{ backgroundColor: theme.background, color: theme.textPrimary }}
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium" style={{ color: theme.textSecondary }}>end</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
                  style={{ backgroundColor: theme.background, color: theme.textPrimary }}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: theme.textSecondary }}>days</label>
              <div className="flex gap-1.5">
                {DAYS_SHORT.map((day, i) => {
                  const active = days.includes(i)
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className="flex-1 rounded-lg py-2.5 text-xs font-medium transition-colors duration-150"
                      style={{
                        backgroundColor: active ? theme.accent : theme.background,
                        color: active ? theme.onAccent : theme.textSecondary,
                      }}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors duration-150"
                style={{ backgroundColor: theme.background, color: theme.textSecondary }}
              >
                cancel
              </button>
              <button
                type="button"
                onClick={addSchedule}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors duration-150"
                style={{ backgroundColor: theme.accent, color: theme.onAccent }}
              >
                save
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function CalendarIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}