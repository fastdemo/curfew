import { useEffect } from 'react'
import { useTheme } from '../ui/theme'

/** Theme tokens for the block page + overlay, read from the live CSS theme. */
export function useBlockTheme() {
  const t = useTheme()
  useEffect(() => {
    document.documentElement.classList.toggle('dark', t.mode === 'dark')
  }, [t.mode])
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
    trunk: '#5e4f3d',
    leaf: '#7c9670',
    leafLight: '#94aa7f',
  }
}
