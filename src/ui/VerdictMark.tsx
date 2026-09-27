import { useTheme } from './theme'

// Verdict mark for the home verdict card. Idle shows a hexagon outline,
// blocking morphs it into a circle outline: both glyphs stay mounted and
// crossfade + scale/rotate between states for a continuous morph.
// Color hierarchy: blocking glyph reads accent; idle glyph reads tertiary
// (decorative, never competes with the verdict text or switch).
export function VerdictMark({ blocking }: { blocking: boolean }) {
  const t = useTheme()
  const common = {
    width: 20,
    height: 20,
    fill: 'none' as const,
    viewBox: '0 0 24 24',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  return (
    <span
      aria-hidden
      style={{
        position: 'relative',
        width: 20,
        height: 20,
        flexShrink: 0,
        color: blocking ? t.accent : t.textTertiary,
        transition: 'color 220ms ease-out',
      }}
    >
      <svg
        {...common}
        stroke="currentColor"
        className="verdict-mark-glyph"
        style={{
          opacity: blocking ? 0 : 1,
          transform: blocking ? 'scale(0.6) rotate(-30deg)' : 'scale(1) rotate(0deg)',
        }}
      >
        <path d="M12 2.8 19.4 7v9.9L12 21.2 4.6 16.9V7L12 2.8Z" />
      </svg>
      <svg
        {...common}
        stroke="currentColor"
        className="verdict-mark-glyph"
        style={{
          opacity: blocking ? 1 : 0,
          transform: blocking ? 'scale(1) rotate(0deg)' : 'scale(0.6) rotate(30deg)',
        }}
      >
        <circle cx="12" cy="12" r="8.2" />
      </svg>
    </span>
  )
}
