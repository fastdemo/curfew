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
        const next = { ...prev }
        for (const [key, { newValue }] of Object.entries(changes)) {
          if (key in next) {
            ;(next as any)[key] = newValue
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
  }, [])

  return { ...data, loading, update }
}
