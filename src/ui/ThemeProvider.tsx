import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext, readTheme, applyTheme, type Theme } from './theme'

// Re-resolves palette + mode whenever storage or the OS changes, then
// repaints CSS vars on <html>. Every surface (popup, block page, overlay)
// renders through this provider, so a theme pick applies instantly.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => readTheme())

  useEffect(() => {
    const repaint = () => setTheme(readTheme())

    const onStorage = () => {
      // storage listener lives in App/block/overlay shells; they call
      // applyTheme themselves — here we just re-read the painted result.
      repaint()
    }
    chrome.storage.onChanged.addListener(onStorage)

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onOs = () => {
      // Only OS-driven when the stored mode is system.
      chrome.storage.local.get('settings', (result) => {
        const mode = (result.settings as { theme?: string } | undefined)?.theme ?? 'system'
        if (mode === 'system') {
          const palette = document.documentElement.dataset.curfewPalette || 'curfew'
          applyTheme(palette, 'system')
          repaint()
        }
      })
    }
    mq.addEventListener('change', onOs)

    const observer = new MutationObserver(repaint)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style', 'data-curfew-palette'],
    })
    return () => {
      chrome.storage.onChanged.removeListener(onStorage)
      mq.removeEventListener('change', onOs)
      observer.disconnect()
    }
  }, [])

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}
