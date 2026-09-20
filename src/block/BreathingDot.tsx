import { useEffect, useState, useRef } from 'react'
import { useBlockTheme } from './theme'

// Breathing friction (19s guided breath). Logic mirrors the old intervention:
// fixed phase timeline, onComplete fires once at the end regardless of phase.
export function BreathingDot({ onComplete }: { onComplete: () => void }) {
  const c = useBlockTheme()
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const timers = useRef<number[]>([])

  useEffect(() => {
    const t = window.setTimeout(onComplete, 19000)
    return () => window.clearTimeout(t)
  }, [onComplete])

  useEffect(() => {
    const seq: { phase: 'inhale' | 'hold' | 'exhale'; duration: number }[] = [
      { phase: 'inhale', duration: 4000 },
      { phase: 'hold', duration: 2000 },
      { phase: 'exhale', duration: 4000 },
      { phase: 'hold', duration: 2000 },
      { phase: 'inhale', duration: 4000 },
      { phase: 'hold', duration: 2000 },
      { phase: 'exhale', duration: 1000 },
    ]
    let idx = 1
    let dead = false
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms)
      timers.current.push(id)
    }
    const run = () => {
      if (dead) return
      const cur = seq[idx]
      if (!cur) return
      setPhase(cur.phase)
      idx += 1
      if (idx < seq.length) later(run, cur.duration)
    }
    later(run, seq[0].duration)
    return () => {
      dead = true
      timers.current.forEach((id) => window.clearTimeout(id))
      timers.current = []
    }
  }, [])

  const label = { inhale: 'breathe in', hold: 'hold', exhale: 'breathe out' } as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <p style={{ margin: 0, fontSize: 14, color: c.secondary }}>follow the breath (19s)</p>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: 128, height: 128, borderRadius: '50%',
            background: `linear-gradient(135deg, ${c.accent}, ${c.card})`,
            transition: 'transform 2000ms ease-in-out, opacity 500ms ease',
            transform: phase === 'inhale' ? 'scale(1)' : phase === 'exhale' ? 'scale(0.68)' : 'scale(0.92)',
            opacity: phase === 'hold' ? 0.85 : 1,
          }}
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(255,255,255,0.22)',
              transition: 'transform 2000ms ease-in-out',
              transform: phase === 'inhale' ? 'scale(1.15)' : phase === 'exhale' ? 'scale(0.8)' : 'scale(1)',
            }}
          />
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 18, fontWeight: 500, color: c.accent, minHeight: 27 }}>
        {label[phase]}
      </p>
    </div>
  )
}
