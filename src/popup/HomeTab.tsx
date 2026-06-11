import { ChromeStorage, InterventionId } from '../types'
import { INTERVENTIONS } from '../lib/interventions'
import { useTimer } from '../hooks/useTimer'
import { isScheduleActive } from '../lib/interventions'

interface HomeTabProps {
  storage: ChromeStorage & { loading: boolean; update: (p: Partial<ChromeStorage>) => Promise<void> }
}

export default function HomeTab({ storage }: HomeTabProps) {
  const { now, formatTime } = useTimer()

  const scheduleActive = isScheduleActive(storage.schedules)
  const activeSchedule = storage.schedules.find(s => s.isActive && isScheduleActive([s]))
  const isStrictActive = storage.strictSession.isActive && now < storage.strictSession.endTime

  const toggleMaster = async () => {
    if (isStrictActive) return
    const newVal = !storage.masterToggle
    await storage.update({ masterToggle: newVal })
    if (newVal) {
      chrome.runtime.sendMessage({ type: 'CURFEW_RELOAD_BLOCKED_TABS' })
    }
  }

  const toggleIntervention = async (id: InterventionId) => {
    const current = storage.selectedInterventions
    const next = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id]
    await storage.update({ selectedInterventions: next })
  }

  return (
    <div className="flex flex-col pb-2">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: '18px', fontWeight: 700 }}>quick focus</h1>
        <button
          onClick={toggleMaster}
          disabled={isStrictActive}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            storage.masterToggle || isStrictActive ? 'bg-[var(--color-curfew-600)]' : 'bg-[var(--color-surface-tertiary)]'
          } ${isStrictActive ? 'opacity-80 cursor-not-allowed' : ''}`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              storage.masterToggle || isStrictActive ? 'translate-x-[22px]' : 'translate-x-[2px]'
            }`}
          />
        </button>
      </div>

      <div className="rounded-2xl bg-[var(--color-surface-secondary)] p-4 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-[var(--color-curfew-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '15px', fontWeight: 600 }}>schedule status</span>
        </div>
        <p style={{ fontSize: '13px', fontWeight: 400, color: '#B0A695' }} className="ml-6">
          {scheduleActive && activeSchedule
            ? `${activeSchedule.name} is active until ${activeSchedule.endTime}`
            : 'no active schedule right now.'}
        </p>
      </div>

      <div className="rounded-2xl bg-[var(--color-surface-secondary)] p-4 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4 text-[var(--color-curfew-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '15px', fontWeight: 600 }}>block status</span>
        </div>
        <p style={{ fontSize: '13px', fontWeight: 400, color: '#B0A695' }} className="ml-6">
          {storage.masterToggle || storage.strictSession.isActive || scheduleActive
            ? 'all websites and keywords are blocked based on the blocked list.'
            : 'focus mode is off. no websites are being blocked.'}
        </p>
      </div>

      <div className="rounded-2xl bg-[var(--color-surface-secondary)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-[var(--color-curfew-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '15px', fontWeight: 600 }}>interventions</span>
        </div>
        <p style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-text-muted)' }} className="mb-3 ml-6">
          select how you would like to be intervened when accessing the distracting websites. choose as many as you like, it will be randomized.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '100%' }}>
          {INTERVENTIONS.map(intervention => {
            const selected = storage.selectedInterventions.includes(intervention.id)
            const desc = interventionDescriptions[intervention.id]
            return (
              <button
                key={intervention.id}
                onClick={() => toggleIntervention(intervention.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  boxSizing: 'border-box',
                  padding: '14px',
                  borderRadius: '16px',
                  border: selected ? '2px solid var(--color-accent)' : '2px solid var(--color-border-muted)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  background: selected ? 'var(--color-accent)' : 'transparent',
                  color: selected ? 'var(--color-surface)' : 'var(--color-text-secondary)',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <InterventionIcon id={intervention.id} selected={selected} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span style={{ fontSize: '13px', fontWeight: 400, color: selected ? 'var(--color-surface)' : 'var(--color-text-muted)' }}>{intervention.time}</span>
                    <div style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: selected ? 'var(--color-surface)' : 'transparent',
                      border: selected ? 'none' : '1.5px solid var(--color-accent)',
                      boxSizing: 'border-box',
                    }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '8px' }}>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '14px', fontWeight: 600, color: selected ? 'var(--color-surface)' : 'var(--color-text-primary)' }}>{intervention.title}</span>
                  <span style={{ fontSize: '11px', fontWeight: 400, color: selected ? 'var(--color-surface)' : 'var(--color-text-muted)', marginTop: '3px', lineHeight: 1.35 }}>{desc}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const interventionDescriptions: Record<string, string> = {
  instant: 'immediately restricts access to the page with a clean takeover screen.',
  hold: 'requires holding down a button for the full duration before granting access.',
  slide: 'animates an interactive barrier pattern across the viewport screen.',
  breathing: 'guides you through a brief, calming box-breathing technique to clear focus.',
}

function InterventionIcon({ id, selected }: { id: InterventionId; selected?: boolean }) {
  const cls = `w-5 h-5 ${selected ? 'text-[var(--color-surface)]' : 'text-[var(--color-text-secondary)]'}`
  switch (id) {
    case 'instant':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636" /></svg>
    case 'hold':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
    case 'slide':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
    case 'breathing':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
  }
}
