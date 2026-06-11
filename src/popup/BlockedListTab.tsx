import { useState } from 'react'
import { ChromeStorage, BlockedItem } from '../types'

const CATEGORIES: Record<string, string[]> = {
  'social media': ['facebook.com', 'x.com', 'instagram.com', 'tiktok.com', 'linkedin.com', 'reddit.com', 'pinterest.com', 'snapchat.com', 'tumblr.com', 'threads.net', 'discord.com', 'twitch.tv', 'whatsapp.com', 'telegram.org', 'bsky.app'],
  entertainment: ['youtube.com', 'netflix.com', 'hulu.com', 'spotify.com', 'disneyplus.com', 'hbomax.com', 'twitch.tv', 'crunchyroll.com', 'vimeo.com', 'soundcloud.com', 'peacocktv.com', 'paramountplus.com', 'plex.tv', 'dailymotion.com', 'rtve.es'],
  'e-commerce': ['amazon.com', 'ebay.com', 'walmart.com', 'target.com', 'bestbuy.com', 'etsy.com', 'aliexpress.com', 'shopify.com', 'newegg.com', 'homedepot.com', 'ikea.com', 'costco.com', 'wayfair.com', 'nike.com', 'temu.com'],
  news: ['cnn.com', 'nytimes.com', 'bbc.com', 'theguardian.com', 'foxnews.com', 'reuters.com', 'bloomberg.com', 'forbes.com', 'wsj.com', 'huffpost.com', 'nbcnews.com', 'washingtonpost.com', 'npr.org', 'apnews.com', 'lemonde.fr'],
  gaming: ['roblox.com', 'steampowered.com', 'epicgames.com', 'ign.com', 'kotaku.com', 'polygon.com', 'gamespot.com', 'nintendo.com', 'playstation.com', 'xbox.com', 'ea.com', 'blizzard.com', 'minecraft.net', 'chess.com', 'miniclip.com'],
  sports: ['espn.com', 'nba.com', 'nfl.com', 'mlb.com', 'skysports.com', 'theathletic.com', 'bleacherreport.com', 'cbssports.com', 'nbcsports.com', 'fifa.com', 'wwe.com', 'ufc.com', 'formula1.com', 'fubo.tv', 'as.com'],
  'finance & crypto': ['coinbase.com', 'binance.com', 'crypto.com', 'robinhood.com', 'marketwatch.com', 'tradingview.com', 'coingecko.com', 'coinmarketcap.com', 'etrade.com', 'fidelity.com', 'schwab.com', 'vanguard.com', 'mint.com', 'investopedia.com', 'bloomberg.com'],
  'meme & forums': ['9gag.com', 'imgur.com', '4chan.org', 'buzzfeed.com', 'boredpanda.com', 'knowyourmeme.com', 'ifunny.co', 'tumblr.com', 'fandom.com', 'quora.com', 'stackexchange.com', 'medium.com', 'deviantart.com', 'pinterest.com', 'kick.com'],
  'streaming & anime': ['crunchyroll.com', 'funimation.com', 'hidive.com', 'myanimelist.net', 'viz.com', 'webtoons.com', 'manganato.com', 'mangadex.org', 'animeflv.net', 'gogoanime3.co', 'aniwave.to', 'kick.com', 'vimeo.com', 'bilibili.com', 'iqiyi.com'],
  'tech & productivity pitfalls': ['github.com', 'stackoverflow.com', 'producthunt.com', 'hackernews.com', 'notion.so', 'figma.com', 'canva.com', 'slack.com', 'zoom.us', 'trello.com', 'asana.com', 'monday.com', 'clickup.com', 'linear.app', 'behance.net'],
}

function isDuplicate(items: BlockedItem[], type: BlockedItem['type'], value: string): boolean {
  const normalized = value.trim().toLowerCase()
  return items.some(i => i.type === type && i.value.toLowerCase() === normalized)
}

interface BlockedListTabProps {
  storage: ChromeStorage & { loading: boolean; update: (p: Partial<ChromeStorage>) => Promise<void> }
}

export default function BlockedListTab({ storage }: BlockedListTabProps) {
  const [inputType, setInputType] = useState<'website' | 'keyword'>('website')
  const [inputValue, setInputValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleAdd = async () => {
    const val = inputValue.trim()
    if (!val || isDuplicate(storage.blockedItems, inputType, val)) return

    const newItem: BlockedItem = {
      id: Date.now().toString(),
      type: inputType,
      value: val.toLowerCase(),
    }

    await storage.update({ blockedItems: [...storage.blockedItems, newItem] })
    setInputValue('')
  }

  const handleAddSite = async (site: string) => {
    if (isDuplicate(storage.blockedItems, 'website', site)) return

    const newItem: BlockedItem = {
      id: Date.now().toString(),
      type: 'website',
      value: site,
    }

    await storage.update({ blockedItems: [...storage.blockedItems, newItem] })
  }

  const handleRemove = async (id: string) => {
    await storage.update({ blockedItems: storage.blockedItems.filter(i => i.id !== id) })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="flex flex-col pb-2">
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>blocked list</h1>

      <div className="flex gap-1 bg-[var(--color-surface-tertiary)] rounded-2xl p-1 mb-3">
        <button
          onClick={() => setInputType('website')}
          className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${
            inputType === 'website'
              ? 'bg-[var(--color-surface)] text-[var(--color-curfew-600)] shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          website
        </button>
        <button
          onClick={() => setInputType('keyword')}
          className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${
            inputType === 'keyword'
              ? 'bg-[var(--color-surface)] text-[var(--color-curfew-600)] shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          keyword
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={inputType === 'website' ? 'eg. x.com' : 'eg. reddit'}
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none transition-colors"
          style={{ fontSize: '14px', fontWeight: 400 }}
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-[var(--color-curfew-600)] text-white hover:bg-[var(--color-curfew-700)] transition-colors"
        >
          +
        </button>
      </div>

      <p style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-text-muted)', marginBottom: '12px' }}>
        {inputType === 'website' ? 'not include the subdomain, add subdomain separately.' : 'block any url containing this keyword.'}
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        {Object.keys(CATEGORIES).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              selectedCategory === cat
                ? 'bg-[#8A7B6B] text-[#F3EEEA]'
                : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {selectedCategory && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {CATEGORIES[selectedCategory].map(site => {
            const blocked = isDuplicate(storage.blockedItems, 'website', site)
            return (
              <button
                key={site}
                onClick={() => { if (!blocked) handleAddSite(site) }}
                disabled={blocked}
                style={{
                  backgroundColor: blocked ? 'var(--color-menu-item-bg)' : 'var(--color-surface)',
                  color: blocked ? 'var(--color-text-muted)' : 'var(--color-menu-item-text)',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: blocked ? 'not-allowed' : 'pointer',
                }}
                className="text-xs px-3 py-1.5 inline-flex items-center gap-1.5 transition-opacity"
              >
                {site}
                <span className="text-sm leading-none">{blocked ? '✓' : '+'}</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {storage.blockedItems.length === 0 ? (
          <p style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-text-muted)' }} className="text-center py-8">
            no blocked items yet. add a website or keyword above.
          </p>
        ) : (
          storage.blockedItems.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: 'var(--color-menu-item-bg)',
                borderRadius: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-muted)',
                    padding: '2px 8px',
                    borderRadius: '8px',
                  }}
                >
                  {item.type === 'website' ? 'URL' : 'KEY'}
                </span>
                <span style={{ color: 'var(--color-menu-item-text)', fontSize: '15px', fontWeight: 600 }}>
                  {item.value}
                </span>
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
