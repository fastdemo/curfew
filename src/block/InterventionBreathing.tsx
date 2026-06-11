import { useEffect, useState } from 'react'

interface InterventionBreathingProps {
  onComplete: () => void
}

const BREATHING_DURATION = 19000

export default function InterventionBreathing({ onComplete }: InterventionBreathingProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')

  useEffect(() => {
    const timer = setTimeout(onComplete, BREATHING_DURATION)
    return () => clearTimeout(timer)
  }, [onComplete])

  useEffect(() => {
    const phases: { phase: 'inhale' | 'hold' | 'exhale'; duration: number }[] = [
      { phase: 'inhale', duration: 4000 },
      { phase: 'hold', duration: 2000 },
      { phase: 'exhale', duration: 4000 },
      { phase: 'hold', duration: 2000 },
    ]

    let idx = 0
    const run = () => {
      const current = phases[idx % phases.length]
      setPhase(current.phase)
      idx++
      if (idx < 4) {
        setTimeout(run, current.duration)
      }
    }

    const initial = setTimeout(run, 0)
    return () => clearTimeout(initial)
  }, [])

  const phaseLabel = {
    inhale: 'breathe in',
    hold: 'hold',
    exhale: 'breathe out',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>follow the breath (19s)</p>

      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: '128px', height: '128px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-accent), var(--color-surface-secondary))',
            transition: 'all 4000ms ease-in-out',
            transform: phase === 'inhale' ? 'scale(1)' : phase === 'exhale' ? 'scale(0.6)' : 'scale(1)',
            opacity: phase === 'hold' ? 0.8 : 1,
          }}
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(4px)',
              transition: 'all 4000ms ease-in-out',
              transform: phase === 'inhale' ? 'scale(1.2)' : phase === 'exhale' ? 'scale(0.8)' : 'scale(1)',
            }}
          />
        </div>
      </div>

      <p style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-accent)' }}>
        {phaseLabel[phase]}
      </p>
    </div>
  )
}
