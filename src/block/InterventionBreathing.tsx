import { useEffect, useState, useRef } from 'react'
import { WARM_TEXT_SECONDARY, WARM_ACCENT, WARM_CARD } from './palette'

interface InterventionBreathingProps {
  onComplete: () => void
}

const BREATHING_DURATION = 19000

export default function InterventionBreathing({ onComplete }: InterventionBreathingProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    const t = window.setTimeout(onComplete, BREATHING_DURATION)
    return () => window.clearTimeout(t)
  }, [onComplete])

  useEffect(() => {
    const sequence: { phase: 'inhale' | 'hold' | 'exhale'; duration: number }[] = [
      { phase: 'inhale', duration: 4000 },
      { phase: 'hold', duration: 2000 },
      { phase: 'exhale', duration: 4000 },
      { phase: 'hold', duration: 2000 },
      { phase: 'inhale', duration: 4000 },
      { phase: 'hold', duration: 2000 },
      { phase: 'exhale', duration: 1000 },
    ]

    let idx = 1
    let cancelled = false

    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms)
      timersRef.current.push(id)
      return id
    }

    const run = () => {
      if (cancelled) return
      const current = sequence[idx]
      if (!current) return
      setPhase(current.phase)
      idx++
      if (idx < sequence.length) {
        schedule(run, current.duration)
      }
    }

    schedule(() => {
      run()
    }, sequence[0].duration)

    return () => {
      cancelled = true
      timersRef.current.forEach(id => window.clearTimeout(id))
      timersRef.current = []
    }
  }, [])

  const phaseLabel = {
    inhale: 'breathe in',
    hold: 'hold',
    exhale: 'breathe out',
  } as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <p style={{ fontSize: '14px', color: WARM_TEXT_SECONDARY }}>follow the breath (19s)</p>

      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: '128px', height: '128px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${WARM_ACCENT}, ${WARM_CARD})`,
            transition: 'transform 2000ms ease-in-out, opacity 500ms ease',
            transform: phase === 'inhale' ? 'scale(1)' : phase === 'exhale' ? 'scale(0.68)' : 'scale(0.92)',
            opacity: phase === 'hold' ? 0.85 : 1,
          }}
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.22)',
              backdropFilter: 'blur(4px)',
              transition: 'transform 2000ms ease-in-out',
              transform: phase === 'inhale' ? 'scale(1.15)' : phase === 'exhale' ? 'scale(0.8)' : 'scale(1)',
            }}
          />
        </div>
      </div>

      <p style={{ fontSize: '18px', fontWeight: 500, color: WARM_ACCENT, minHeight: '27px' }}>
        {phaseLabel[phase]}
      </p>
    </div>
  )
}
