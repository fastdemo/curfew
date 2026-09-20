import { useEffect } from 'react'
import { useTheme } from '../ui/theme'

/** Theme tokens for the block page + overlay, read from the live CSS theme. */
export function useBlockTheme() {
  const t = useTheme()
  useEffect(() => {
    document.documentElement.classList.toggle('dark', t.mode === 'dark')
  }, [t.mode])
  // Dotted texture for the page backdrop: barely-visible dots that echo the
  // popup shell, in both modes. Kept off the card so content stays clean.
  const dot = t.mode === 'dark' ? 'rgba(255,255,255,0.055)' : 'rgba(46,42,38,0.07)'
  return {
    bg: t.bgApp,
    card: t.bgSurface,
    border: t.border,
    inset: t.highlight,
    primary: t.textPrimary,
    secondary: t.textSecondary,
    tertiary: t.textTertiary,
    accent: t.accent,
    onAccent: t.onAccent,
    dotPattern: `radial-gradient(${dot} 1px, transparent 1px)`,
  }
}
