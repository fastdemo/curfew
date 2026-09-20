import { ChromeStorage, InterventionId } from '../types'
import { INTERVENTIONS } from '../lib/interventions'
import { useTimer } from '../hooks/useTimer'
import { isScheduleActive } from '../lib/interventions'
import { useTheme } from '../lib/theme-context'
import SectionHeader from './components/SectionHeader'
import RowItem from './components/RowItem'
import Toggle from './components/Toggle'
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

  const activeSchedule = storage.schedules.find(s => s.isActive && isScheduleActive([s]))
  const isStrictActive = storage.strictSession.isActive && now < storage.strictSession.endTime

  const websiteCount = storage.blockedItems.filter(i => i.type === 'website').length
  const keywordCount = storage.blockedItems.filter(i => i.type === 'keyword').length
  const scopeLabel = `${websiteCount} site${websiteCount !== 1 ? 's' : ''} · ${keywordCount} keyword${keywordCount !== 1 ? 's' : ''}`

  // Single driver line: the one place on this screen that names WHY blocking
  // is on (or that it is off). Priority matches the blocking engine:
  // strict session > running schedule > manual toggle > idle.
  let focusSubtitle: string
  if (isStrictActive) {
    focusSubtitle = 'strict session is locking everything'
  } else if (activeSchedule) {
    focusSubtitle = `schedule · ${activeSchedule.name} until ${formatTime(activeSchedule.endTime)}`
  } else if (storage.masterToggle) {
    focusSubtitle = websiteCount + keywordCount > 0 ? `${scopeLabel} locked` : 'blocking is on · list is empty'
  } else {
    focusSubtitle = 'all sites are accessible'
  }

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
        icon={<BoltIcon size={13} color={theme.textSecondary} />}
        title="quick focus"
        subtitle={focusSubtitle}
        right={
          <Toggle
            checked={storage.masterToggle || isStrictActive}
            disabled={isStrictActive}
            onChange={onToggleMaster}
          />
        }
      />

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
    style: { color: theme.textSecondary },
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
