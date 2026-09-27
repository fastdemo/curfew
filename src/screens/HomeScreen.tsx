import { useTimer } from '../hooks/useTimer'
import type { ChromeStorage, InterventionId } from '../types'
import { useTheme } from '../ui/theme'
import { Screen } from '../ui/Screen'
import { Switch } from '../ui/Switch'
import { VerdictMark } from '../ui/VerdictMark'
import { InterventionTiles } from '../ui/InterventionTiles'
import { verdictFor } from '../ui/verdict'

interface Props {
  storage: ChromeStorage & { update: (p: Partial<ChromeStorage>) => Promise<void> }
  onToggleMaster: () => void
}

// Direction A — verdict + switch. One plain sentence, toggle inline right,
// 2x2 intervention tiles below. No other status widgets on this screen.
export function HomeScreen({ storage, onToggleMaster }: Props) {
  const t = useTheme()
  const { now } = useTimer()
  const verdict = verdictFor(storage, now)

  const strictLive = verdict.kind === 'strict'
  const scheduleLive = verdict.kind === 'schedule'
  // Priority already established: strict > schedule > manual. A live driver
  // locks the toggle ON and disabled — same treatment for strict and
  // schedule, so the switch can never contradict the engine.
  const locked = strictLive || scheduleLive
  const checked = storage.masterToggle || locked

  const toggleIntervention = async (id: InterventionId) => {
    const current = storage.selectedInterventions
    const next = current.includes(id)
      ? current.filter((i) => i !== id)
      : [...current, id]
    await storage.update({ selectedInterventions: next })
  }

  return (
    <Screen gap={8}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minHeight: 48,
          padding: '6px 12px 6px 7px',
          borderRadius: 12,
          backgroundColor: t.bgSurface,
          border: `1px solid ${t.border}`,
          flexShrink: 0,
        }}
      >
        <VerdictMark blocking={checked} />
        <p
          style={{
            flex: 1,
            minWidth: 0,
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.3,
            color: t.textPrimary,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {verdict.line}
        </p>
        <Switch
          checked={checked}
          disabled={locked}
          onChange={onToggleMaster}
          label="quick focus"
        />
      </div>

      <InterventionTiles
        selected={storage.selectedInterventions}
        onToggle={toggleIntervention}
      />
    </Screen>
  )
}
