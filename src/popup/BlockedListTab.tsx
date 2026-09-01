import { useState, type KeyboardEvent } from 'react'
import { ChromeStorage, BlockedItem } from '../types'
import { useTheme } from '../lib/theme-context'
import SectionHeader from './components/SectionHeader'
import RowItem from './components/RowItem'
import Chip from './components/Chip'
import SegmentedControl from './components/SegmentedControl'

const CATEGORIES: Record<string, string[]> = {
  'social media': ['facebook.com', 'x.com', 'twitter.com', 'instagram.com', 'tiktok.com', 'linkedin.com', 'reddit.com', 'pinterest.com', 'snapchat.com', 'threads.net', 'discord.com', 'twitch.tv', 'whatsapp.com', 'bsky.app'],
  entertainment: ['youtube.com', 'netflix.com', 'hulu.com', 'spotify.com', 'disneyplus.com', 'crunchyroll.com', 'vimeo.com', 'soundcloud.com', 'peacocktv.com', 'plex.tv'],
  'e-commerce': ['amazon.com', 'ebay.com', 'walmart.com', 'target.com', 'bestbuy.com', 'etsy.com', 'aliexpress.com', 'newegg.com', 'homedepot.com', 'ikea.com', 'costco.com', 'nike.com', 'temu.com'],
  gaming: ['roblox.com', 'steampowered.com', 'epicgames.com', 'ign.com', 'polygon.com', 'gamespot.com', 'nintendo.com', 'playstation.com', 'xbox.com', 'minecraft.net', 'chess.com'],
  news: ['cnn.com', 'nytimes.com', 'bbc.com', 'theguardian.com', 'foxnews.com', 'reuters.com', 'bloomberg.com', 'forbes.com', 'wsj.com', 'nbcnews.com', 'washingtonpost.com', 'npr.org'],
}

function normalizeWebsite(value: string): string {
  let v = value.trim().toLowerCase()
  // strip protocol, www, path, and trailing slash
  v = v.replace(/^https?:\/\//, '')
  v = v.replace(/^www\./, '')
  v = v.split('/')[0]
  v = v.split('?')[0]
  v = v.split('#')[0]
  v = v.replace(/:\d+$/, '')
  return v
}

function isDuplicate(items: BlockedItem[], type: BlockedItem['type'], value: string): boolean {
  const normalized = (type === 'website' ? normalizeWebsite(value) : value.trim().toLowerCase())
  return items.some(i => i.type === type && i.value.toLowerCase() === normalized)
}

interface BlockedListTabProps {
  storage: ChromeStorage & { loading: boolean; update: (p: Partial<ChromeStorage>) => Promise<void> }
}

export default function BlockedListTab({ storage }: BlockedListTabProps) {
  const theme = useTheme()
  const [inputType, setInputType] = useState<'website' | 'keyword'>('website')
  const [inputValue, setInputValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleAdd = async () => {
    const raw = inputValue.trim()
    if (!raw) return
    const normalized = inputType === 'website' ? normalizeWebsite(raw) : raw.toLowerCase()
    if (!normalized || isDuplicate(storage.blockedItems, inputType, normalized)) return

    const newItem: BlockedItem = {
      id: crypto.randomUUID(),
      type: inputType,
      value: normalized,
    }

    await storage.update({ blockedItems: [...storage.blockedItems, newItem] })
    setInputValue('')
  }

  const handleAddSite = async (site: string) => {
    if (isDuplicate(storage.blockedItems, 'website', site)) return

    const newItem: BlockedItem = {
      id: crypto.randomUUID(),
      type: 'website',
      value: site,
    }

    await storage.update({ blockedItems: [...storage.blockedItems, newItem] })
  }

  const handleRemove = async (id: string) => {
    await storage.update({ blockedItems: storage.blockedItems.filter(i => i.id !== id) })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="flex flex-col gap-3">
      <section className="flex flex-col gap-2.5">
        <SectionHeader title="add to blocked list" />
        <SegmentedControl
          value={inputType}
          onChange={setInputType}
          options={[
            { value: 'website', label: 'website' },
            { value: 'keyword', label: 'keyword' },
          ]}
        />
        <div
          className="flex items-center gap-1.5 rounded-lg px-2 py-1"
          style={{ backgroundColor: theme.surface, border: `1px solid ${theme.borderSoft}` }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={inputType === 'website' ? 'eg. x.com' : 'eg. reddit'}
            className="flex-1 bg-transparent px-2.5 py-2 text-sm outline-none"
            style={{ color: theme.textPrimary }}
          />
          <button
            type="button"
            onClick={handleAdd}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors duration-150"
            style={{ backgroundColor: theme.accent, color: theme.onAccent }}
            aria-label="Add"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <SectionHeader title="quick add" subtitle="tap a category to browse sites" />
        <div className="flex flex-wrap gap-2">
          {Object.keys(CATEGORIES).map(cat => (
            <Chip
              key={cat}
              label={cat}
              selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            />
          ))}
        </div>

        {selectedCategory && (
          <div className="flex flex-wrap gap-2">
            {CATEGORIES[selectedCategory].map(site => {
              const blocked = isDuplicate(storage.blockedItems, 'website', site)
              return (
                <Chip
                  key={site}
                  label={site}
                  disabled={blocked}
                  trailing={<span className="text-xs leading-none">{blocked ? '✓' : '+'}</span>}
                  onClick={() => { if (!blocked) handleAddSite(site) }}
                />
              )
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2.5">
        <SectionHeader title={`blocked items (${storage.blockedItems.length})`} />
        {storage.blockedItems.length === 0 ? (
          <div
            className="flex flex-col items-center gap-2 rounded-xl px-4 py-8 text-center"
            style={{ backgroundColor: theme.surface, border: `1px solid ${theme.borderSoft}` }}
          >
            <span className="text-2xl" style={{ color: theme.textTertiary }}>🗒</span>
            <p className="text-sm font-medium" style={{ color: theme.textPrimary }}>nothing blocked yet</p>
            <p className="text-xs" style={{ color: theme.textSecondary }}>
              add a website or keyword above to get started.
            </p>
          </div>
        ) : (
          <div
            className="overflow-hidden rounded-xl"
            style={{ backgroundColor: theme.surface, border: `1px solid ${theme.borderSoft}` }}
          >
            {storage.blockedItems.map((item, i) => (
              <RowItem
                key={item.id}
                variant="flat"
                divider={i > 0}
                icon={
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={{ backgroundColor: theme.highlight, color: theme.textSecondary }}
                  >
                    {item.type === 'website' ? 'URL' : 'KEY'}
                  </span>
                }
                title={item.value}
                right={
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-150"
                    style={{ color: theme.textTertiary }}
                    aria-label="Remove"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}