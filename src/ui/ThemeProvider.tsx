import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext, readTheme, type Theme } from './theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => readTheme())

  useEffect(() => {
    const refresh = () => setTheme(readTheme())
    const observer = new MutationObserver(refresh)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}
