import { useEffect, useState, type ReactNode } from 'react'
import { resolveThemeMode, themes, onAccent, type ThemeMode } from './theme'
import { getStorage } from './storage'
import { ThemeContext, type ResolvedTheme } from './theme-context'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeMode>('system')

  useEffect(() => {
    let cancelled = false

    getStorage().then(storage => {
      if (!cancelled) setThemeName(storage.settings.theme)
    })

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.settings) {
        const next = (changes.settings.newValue as { theme?: ThemeMode } | undefined)?.theme
        if (next) setThemeName(next)
      }
    }
    chrome.storage.onChanged.addListener(listener)
    return () => {
      cancelled = true
      chrome.storage.onChanged.removeListener(listener)
    }
  }, [])

  const [, forceUpdate] = useState(0)

  useEffect(() => {
    if (themeName !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => forceUpdate(v => v + 1)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [themeName])

  const mode = resolveThemeMode(themeName)
  const palette = themes[mode === 'dark' ? 'dark' : 'light']
  const value: ResolvedTheme = { ...palette, onAccent, mode, themeName }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}