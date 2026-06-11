import { useState } from 'react'
import { ChromeStorage, Schedule } from '../types'

interface ScheduleTabProps {
  storage: ChromeStorage & { loading: boolean; update: (p: Partial<ChromeStorage>) => Promise<void> }
}

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function ScheduleTab({ storage }: ScheduleTabProps) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('13:00')
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5])

  const toggleScheduleMaster = async () => {
    const allActive = storage.schedules.every(s => s.isActive)
    const updated = storage.schedules.map(s => ({ ...s, isActive: !allActive }))
    await storage.update({ schedules: updated })
  }

  const addSchedule = async () => {
    if (!name.trim()) return
    if (days.length === 0) return

    const newSchedule: Schedule = {
      id: Date.now().toString(),
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

  return (
    <div className="flex flex-col pb-2">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: '18px', fontWeight: 700 }}>schedule</h1>
        <div className="flex items-center gap-2">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-3 py-1.5 text-sm font-semibold rounded-xl bg-[var(--color-curfew-600)] text-white hover:bg-[var(--color-curfew-700)] transition-colors"
            >
              + add
            </button>
          )}
        </div>
      </div>

      <p style={{ fontSize: '13px', fontWeight: 400, color: '#B0A695', marginBottom: '12px' }}>
        set multiple times and days to turn on focus mode.
      </p>

      {showForm && (
        <div className="rounded-2xl bg-[var(--color-surface-secondary)] p-4 space-y-3 mb-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="session name"
            className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-tertiary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none transition-colors"
            style={{ fontSize: '14px', fontWeight: 400 }}
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <label style={{ fontSize: '13px', fontWeight: 400, color: '#B0A695' }} className="mb-1 block">start</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-[var(--color-surface-tertiary)] text-[var(--color-text-primary)] outline-none transition-colors"
              />
            </div>
            <div className="flex-1">
              <label style={{ fontSize: '13px', fontWeight: 400, color: '#B0A695' }} className="mb-1 block">end</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-surface-tertiary)] text-[var(--color-text-primary)] outline-none transition-colors"
                style={{ fontSize: '14px', fontWeight: 400 }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 400, color: '#B0A695' }} className="mb-1.5 block">days</label>
            <div className="flex gap-1.5">
              {DAYS_SHORT.map((day, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={`w-9 h-9 text-xs font-medium rounded-xl transition-colors ${
                    days.includes(i)
                      ? 'bg-[var(--color-curfew-600)] text-white'
                      : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 text-sm font-medium rounded-xl bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] transition-colors"
            >
              cancel
            </button>
            <button
              onClick={addSchedule}
              className="flex-1 py-2 text-sm font-semibold rounded-xl bg-[var(--color-curfew-600)] text-white hover:bg-[var(--color-curfew-700)] transition-colors"
            >
              save
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {storage.schedules.length === 0 && !showForm && (
          <p style={{ fontSize: '13px', fontWeight: 400, color: '#B0A695' }} className="text-center py-8">
            no schedules yet. tap "+ add" to create one.
          </p>
        )}
        {storage.schedules.map(schedule => (
          <div
            key={schedule.id}
            className="rounded-2xl bg-[var(--color-surface-secondary)] p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: '15px', fontWeight: 600 }}>{schedule.name}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                  schedule.isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-muted)]'
                }`}>
                  {schedule.isActive ? 'active' : 'inactive'}
                </span>
                <button
                  onClick={() => deleteSchedule(schedule.id)}
                  className="p-1 rounded-lg hover:bg-[var(--color-surface-tertiary)] text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 400, color: '#B0A695' }} className="mb-2">
              {formatTimeDisplay(schedule.startTime)} - {formatTimeDisplay(schedule.endTime)}
            </p>
            <div className="flex gap-1.5">
              {DAYS_SHORT.map((day, i) => (
                <span
                  key={i}
                  className={`text-xs px-2 py-0.5 rounded-lg ${
                    schedule.daysOfWeek.includes(i)
                      ? 'bg-[var(--color-curfew-100)] text-[var(--color-curfew-700)] dark:bg-[var(--color-curfew-900)]/30 dark:text-[var(--color-curfew-400)]'
                      : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>
            <div className="mt-2 pt-2">
              <button
                onClick={() => toggleScheduleActive(schedule.id, !schedule.isActive)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  schedule.isActive ? 'bg-[var(--color-curfew-600)]' : 'bg-[var(--color-surface-tertiary)]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    schedule.isActive ? 'translate-x-[18px]' : 'translate-x-[2px]'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
