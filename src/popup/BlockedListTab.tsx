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
    <div className="flex flex-col" style={{ gap: '6px' }}>
      <section className="flex flex-col" style={{ gap: '6px' }}>
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
          className="flex items-center"
          style={{
            gap: '6px',
            padding: '4px',
            borderRadius: '8px',
            backgroundColor: theme.surface,
            border: `1px solid ${theme.borderSoft}`,
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={inputType === 'website' ? 'eg. x.com' : 'eg. reddit'}
            className="flex-1 bg-transparent outline-none"
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 500,
              lineHeight: 1.3,
              color: theme.textPrimary,
            }}
          />
          <button
            type="button"
            onClick={handleAdd}
            className="flex shrink-0 items-center justify-center transition-colors duration-150"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: theme.accent,
              color: theme.onAccent,
            }}
            aria-label="Add"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </section>

      <section className="flex flex-col" style={{ gap: '6px' }}>
        <SectionHeader title="quick add" subtitle="tap a category to browse sites" />
        <div className="flex flex-wrap" style={{ gap: '6px' }}>
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
          <div className="flex flex-wrap" style={{ gap: '6px' }}>
            {CATEGORIES[selectedCategory].map(site => {
              const blocked = isDuplicate(storage.blockedItems, 'website', site)
              return (
                <Chip
                  key={site}
                  label={site}
                  disabled={blocked}
                  trailing={<span style={{ fontSize: '11px', lineHeight: 1 }}>{blocked ? '✓' : '+'}</span>}
                  onClick={() => { if (!blocked) handleAddSite(site) }}
                />
              )
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col" style={{ gap: '6px' }}>
        <SectionHeader title={`blocked items (${storage.blockedItems.length})`} />
        {storage.blockedItems.length === 0 ? (
          <div
            className="flex flex-col items-center text-center"
            style={{
              gap: '6px',
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: theme.surface,
              border: `1px solid ${theme.borderSoft}`,
            }}
          >
            <span style={{ fontSize: '20px', color: theme.textTertiary }}>◯</span>
            <p style={{ fontSize: '13px', fontWeight: 600, color: theme.textPrimary }}>nothing blocked yet</p>
            <p style={{ fontSize: '11px', color: theme.textSecondary, lineHeight: 1.3 }}>
              add a website or keyword above to get started.
            </p>
          </div>
        ) : (
          <div
            className="overflow-hidden"
            style={{ backgroundColor: theme.surface, border: `1px solid ${theme.borderSoft}`, borderRadius: '8px' }}
          >
            {storage.blockedItems.map((item, i) => (
              <RowItem
                key={item.id}
                variant="flat"
                divider={i > 0}
                icon={
                  <span
                    style={{
                      padding: '2px 5px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      backgroundColor: theme.highlight,
                      color: theme.textSecondary,
                    }}
                  >
                    {item.type === 'website' ? 'URL' : 'KEY'}
                  </span>
                }
                title={item.value}
                right={
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="flex items-center justify-center transition-colors duration-150"
                    style={{ width: '24px', height: '24px', borderRadius: '6px', color: theme.textTertiary }}
                    aria-label="Remove"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
