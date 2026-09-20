import { useState, useEffect, useCallback } from 'react'
import { ChromeStorage, DEFAULT_STORAGE } from '../types'
import { getStorage, setStorage } from '../lib/storage'

export function useStorage() {
  const [data, setData] = useState<ChromeStorage>(DEFAULT_STORAGE)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStorage().then(storage => {
      setData(storage)
      setLoading(false)
    })

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      setData(prev => {
        const next = { ...prev } as ChromeStorage
        for (const [key, { newValue }] of Object.entries(changes)) {
          if (key in next) {
            if (key === 'settings' && newValue && typeof newValue === 'object') {
              (next as unknown as Record<string, unknown>)[key] = { ...DEFAULT_STORAGE.settings, ...newValue as object }
            } else if (key === 'strictSession' && newValue && typeof newValue === 'object') {
              (next as unknown as Record<string, unknown>)[key] = { ...DEFAULT_STORAGE.strictSession, ...newValue as object }
            } else {
              Object.assign(next, { [key]: newValue })
            }
          }
        }
        return next
      })
    }

    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }, [])

  const update = useCallback(async (partial: Partial<ChromeStorage>) => {
    await setStorage(partial)
    // Real chrome.storage only fires onChanged in OTHER contexts — never in
    // the writer itself. Mirror the write into local state so the UI (and
    // effects keyed off it, e.g. theme repaint) reacts synchronously.
    setData(prev => {
      const next = { ...prev } as ChromeStorage
      for (const [key, newValue] of Object.entries(partial)) {
        if (key in next) {
          if (key === 'settings' && newValue && typeof newValue === 'object') {
            (next as unknown as Record<string, unknown>)[key] = { ...prev.settings, ...newValue as object }
          } else if (key === 'strictSession' && newValue && typeof newValue === 'object') {
            (next as unknown as Record<string, unknown>)[key] = { ...prev.strictSession, ...newValue as object }
          } else {
            Object.assign(next, { [key]: newValue })
          }
        }
      }
      return next
    })
  }, [])

  return { ...data, loading, update }
}
