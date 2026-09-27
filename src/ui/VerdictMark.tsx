import { useEffect, useRef } from 'react'
import { useTheme } from './theme'

// Verdict mark for the home verdict card: a roundy hexagon (idle) that
// genuinely morphs into a circle (blocking) and back. One <path> with a
// fixed 72-vertex ring; each frame interpolates every vertex between the
// rounded-hexagon radius and the circle radius at the same angle, so every
// intermediate frame is a true in-between shape — not a crossfade.
// Single color always. Idle is decorative (tertiary glyph on a neutral
// disc, below text/switch in the hierarchy); blocking promotes the mark to
// the theme's accent pair (accent disc + onAccent glyph — the one combo
// every palette guarantees readable, so it holds in all 19 themes).
const N = 72
const R = 8.2
const CX = 12
const CY = 12

function wrapCentered(v: number, period: number): number {
  let m = v % period
  if (m > period / 2) m -= period
  if (m < -period / 2) m += period
  return m
}

// Pointy-top hexagon radius (vertex straight up, flats left/right):
// apothem over cos(offset from nearest edge normal), edge normals at
// 0/60/..., then 2 light smoothing passes so the corners read rounded.
// 1.3x exaggeration around the mean keeps true-hexagon proportions while
// still reading clearly at 18px.
function roundedHexRadii(): number[] {
  const apothem = R * Math.cos(Math.PI / 6)
  const raw: number[] = []
  for (let i = 0; i < N; i++) {
    const theta = (i / N) * Math.PI * 2
    const m = wrapCentered(theta, Math.PI / 3)
    raw.push(apothem / Math.cos(m) / R)
  }
  const mean = raw.reduce((s, r) => s + r, 0) / N
  let rs = raw.map((r) => R * (1 + 1.3 * (r - mean)))
  for (let pass = 0; pass < 2; pass++) {
    rs = rs.map((_, i) => (rs[(i - 1 + N) % N] + 2 * rs[i] + rs[(i + 1) % N]) / 4)
  }
  return rs
}

const HEX = roundedHexRadii()

function buildPath(t: number): string {
  const pts: [number, number][] = []
  for (let i = 0; i < N; i++) {
    const theta = (i / N) * Math.PI * 2
    const r = HEX[i] * (1 - t) + R * t
    pts.push([CX + r * Math.cos(theta), CY + r * Math.sin(theta)])
  }
  // Closed Catmull-Rom -> bezier; tension 0.5 keeps corners crisp.
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`
  for (let i = 0; i < N; i++) {
    const p0 = pts[(i - 1 + N) % N]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % N]
    const p3 = pts[(i + 2) % N]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`
  }
  return d + ' Z'
}

export function VerdictMark({ blocking }: { blocking: boolean }) {
  const t = useTheme()
  const pathRef = useRef<SVGPathElement>(null)
  const tRef = useRef(blocking ? 1 : 0)

  useEffect(() => {
    const to = blocking ? 1 : 0
    const from = tRef.current
    if (from === to) return
    let reduced = false
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch { /* ignore */ }
    if (reduced) {
      tRef.current = to
      pathRef.current?.setAttribute('d', buildPath(to))
      return
    }
    let raf = 0
    const DUR = 380
    const start = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / DUR)
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
      const v = from + (to - from) * e
      tRef.current = v
      pathRef.current?.setAttribute('d', buildPath(v))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [blocking])

  return (
    <span
      aria-hidden
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        backgroundColor: blocking ? t.accent : t.highlight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: blocking ? t.onAccent : t.textTertiary,
        transition: 'background-color 220ms ease-out, color 220ms ease-out',
      }}
    >
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <path ref={pathRef} d={buildPath(blocking ? 1 : 0)} />
      </svg>
    </span>
  )
}
