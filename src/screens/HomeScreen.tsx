import { useTimer } from '../hooks/useTimer'
import type { ChromeStorage, InterventionId } from '../types'
import { useTheme } from '../ui/theme'
import { Switch } from '../ui/Switch'
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
  const checked = storage.masterToggle || strictLive

  const toggleIntervention = async (id: InterventionId) => {
    const current = storage.selectedInterventions
    const next = current.includes(id)
      ? current.filter((i) => i !== id)
      : [...current, id]
    await storage.update({ selectedInterventions: next })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center', minHeight: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          minHeight: 56,
          padding: '8px 12px 8px 14px',
          borderRadius: 12,
          backgroundColor: t.bgSurface,
          border: `1px solid ${t.border}`,
        }}
      >
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
          disabled={strictLive}
          onChange={onToggleMaster}
          label="quick focus"
        />
      </div>

      <InterventionTiles
        selected={storage.selectedInterventions}
        onToggle={toggleIntervention}
      />
    </div>
  )
}
