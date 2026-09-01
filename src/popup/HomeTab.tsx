import { ChromeStorage, InterventionId } from '../types'
import { INTERVENTIONS } from '../lib/interventions'
import { useTimer } from '../hooks/useTimer'
import { isScheduleActive } from '../lib/interventions'
import { useTheme } from '../lib/theme-context'
import SectionHeader from './components/SectionHeader'
import RowItem from './components/RowItem'
import Toggle from './components/Toggle'
import StatusPill from './components/StatusPill'
import InterventionOption from './components/InterventionOption'

interface HomeTabProps {
  storage: ChromeStorage & { loading: boolean; update: (p: Partial<ChromeStorage>) => Promise<void> }
  onToggleMaster: () => void
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function HomeTab({ storage, onToggleMaster }: HomeTabProps) {
  const { now } = useTimer()
  const theme = useTheme()

  const scheduleActive = isScheduleActive(storage.schedules)
  const activeSchedule = storage.schedules.find(s => s.isActive && isScheduleActive([s]))
  const isStrictActive = storage.strictSession.isActive && now < storage.strictSession.endTime

  const blocking = storage.masterToggle || isStrictActive || scheduleActive

  const toggleIntervention = async (id: InterventionId) => {
    const current = storage.selectedInterventions
    const next = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id]
    await storage.update({ selectedInterventions: next })
  }

  return (
    <div className="flex flex-col" style={{ gap: '8px' }}>
      <RowItem
        icon={<BoltIcon size={13} color={theme.textPrimary} />}
        title="quick focus"
        subtitle="pause or enable site restrictions"
        right={
          <Toggle
            checked={storage.masterToggle || isStrictActive}
            disabled={isStrictActive}
            onChange={onToggleMaster}
          />
        }
      />

      <section>
        <SectionHeader title="status" />
        <div
          className="overflow-hidden"
          style={{ backgroundColor: theme.surface, border: `1px solid ${theme.borderSoft}`, borderRadius: '8px' }}
        >
          <RowItem
            variant="flat"
            icon={<CalendarIcon size={13} color={theme.textSecondary} />}
            title={activeSchedule ? activeSchedule.name : 'no active schedule'}
            subtitle={
              activeSchedule
                ? `${formatTime(activeSchedule.startTime)} – ${formatTime(activeSchedule.endTime)}`
                : 'nothing scheduled right now'
            }
            right={<StatusPill label={scheduleActive ? 'active' : 'disabled'} tone={scheduleActive ? 'success' : 'muted'} />}
          />
          <RowItem
            variant="flat"
            divider
            icon={<ShieldIcon size={13} color={theme.textSecondary} />}
            title={blocking ? 'blocking active' : 'not blocking'}
            subtitle={blocking ? 'distracting sites are locked' : 'all sites are accessible'}
            right={<StatusPill label={blocking ? 'active' : 'idle'} tone={blocking ? 'success' : 'muted'} />}
          />
        </div>
      </section>

      <section>
        <SectionHeader title="interventions" subtitle="tap to choose how blocked sites are handled" />
        <div
          className="overflow-hidden"
          style={{ backgroundColor: theme.surface, border: `1px solid ${theme.borderSoft}`, borderRadius: '8px' }}
        >
          {INTERVENTIONS.map((intervention, i) => {
            const selected = storage.selectedInterventions.includes(intervention.id)
            return (
              <InterventionOption
                key={intervention.id}
                icon={<InterventionIcon id={intervention.id} />}
                title={intervention.title}
                time={intervention.time}
                selected={selected}
                divider={i > 0}
                onClick={() => toggleIntervention(intervention.id)}
              />
            )
          })}
        </div>
      </section>
    </div>
  )
}

function InterventionIcon({ id }: { id: InterventionId }) {
  const theme = useTheme()
  const props = {
    width: 13,
    height: 13,
    fill: 'none' as const,
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { color: theme.textPrimary },
  }
  switch (id) {
    case 'instant':
      return <svg {...props}><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636" /></svg>
    case 'hold':
      return <svg {...props}><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
    case 'slide':
      return <svg {...props}><path d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
    case 'breathing':
      return <svg {...props}><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
  }
}

function BoltIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

function CalendarIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function ShieldIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
