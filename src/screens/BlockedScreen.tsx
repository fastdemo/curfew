import { useState, type KeyboardEvent } from 'react'
import type { BlockedItem, ChromeStorage } from '../types'
import { useTheme } from '../ui/theme'

interface Props {
  storage: ChromeStorage & { update: (p: Partial<ChromeStorage>) => Promise<void> }
}

type Kind = 'website' | 'keyword'

const QUICK: { label: string; sites: string[] }[] = [
  {
    label: 'socials',
    sites: ['x.com', 'instagram.com', 'tiktok.com', 'reddit.com', 'facebook.com', 'linkedin.com', 'pinterest.com', 'threads.net', 'snapchat.com', 'discord.com', 'twitch.tv', 'bsky.app'],
  },
  {
    label: 'entertainment',
    sites: ['youtube.com', 'netflix.com', 'twitch.tv', 'disneyplus.com', 'hulu.com', 'spotify.com', 'crunchyroll.com', 'vimeo.com', 'soundcloud.com', 'peacocktv.com', 'plex.tv', 'max.com'],
  },
  {
    label: 'e-commerce',
    sites: ['amazon.com', 'ebay.com', 'walmart.com', 'target.com', 'bestbuy.com', 'etsy.com', 'aliexpress.com', 'newegg.com', 'homedepot.com', 'ikea.com', 'costco.com', 'nike.com', 'temu.com', 'shein.com'],
  },
  {
    label: 'games',
    sites: ['roblox.com', 'steampowered.com', 'epicgames.com', 'ign.com', 'polygon.com', 'gamespot.com', 'nintendo.com', 'playstation.com', 'xbox.com', 'minecraft.net', 'chess.com', 'poki.com'],
  },
  {
    label: 'news',
    sites: ['cnn.com', 'nytimes.com', 'bbc.com', 'theguardian.com', 'foxnews.com', 'reuters.com', 'bloomberg.com', 'forbes.com', 'wsj.com', 'nbcnews.com', 'washingtonpost.com', 'npr.org'],
  },
  {
    label: 'productivity',
    sites: ['mail.google.com', 'outlook.com', 'slack.com', 'notion.so', 'docs.google.com', 'drive.google.com', 'dropbox.com', 'figma.com', 'canva.com', 'asana.com', 'trello.com', 'evernote.com'],
  },
]

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

function normalize(kind: Kind, value: string): string {
  const v = value.trim().toLowerCase()
  return kind === 'website' ? normalizeWebsite(v) : v
}

function isDuplicate(items: BlockedItem[], kind: Kind, value: string): boolean {
  const n = normalize(kind, value)
  if (!n) return true
  return items.some((i) => i.type === kind && i.value.toLowerCase() === n)
}

// Blocked list: defines the engine's match scope. One add-row (kind switch +
// input + add), one quick-add strip, one grouped list with dividers. The
// count lives in the list heading only — nowhere else on this screen.
export function BlockedScreen({ storage }: Props) {
  const t = useTheme()
  const [kind, setKind] = useState<Kind>('website')
  const [value, setValue] = useState('')
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  const items = storage.blockedItems
  const dup = value.trim() ? isDuplicate(items, kind, value) : false

  const add = async (k: Kind, raw: string) => {
    const n = normalize(k, raw)
    if (!n || isDuplicate(items, k, n)) return false
    await storage.update({
      blockedItems: [...items, { id: crypto.randomUUID(), type: k, value: n }],
    })
    return true
  }

  const handleAdd = async () => {
    if (await add(kind, value)) setValue('')
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') void handleAdd()
  }

  const remove = async (id: string) => {
    await storage.update({ blockedItems: items.filter((i) => i.id !== id) })
  }

  const input = {
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    flex: 1,
    minWidth: 0,
    padding: '8px 4px 8px 10px',
    fontSize: 13,
    fontWeight: 500,
    color: t.textPrimary,
  } as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <div
          role="tablist"
          aria-label="entry kind"
          style={{
            display: 'flex',
            padding: 3,
            gap: 2,
            borderRadius: 10,
            backgroundColor: t.bgSurface,
            border: `1px solid ${t.border}`,
          }}
        >
          {(['website', 'keyword'] as Kind[]).map((k) => {
            const on = k === kind
            return (
              <button
                key={k}
                role="tab"
                aria-selected={on}
                type="button"
                onClick={() => {
                  setKind(k)
                  setValue('')
                }}
                style={{
                  flex: 1,
                  height: 28,
                  border: 'none',
                  borderRadius: 7,
                  cursor: 'pointer',
                  fontSize: 12.5,
                  fontWeight: on ? 600 : 500,
                  backgroundColor: on ? t.highlight : 'transparent',
                  color: on ? t.textPrimary : t.textTertiary,
                  transition: 'background-color 150ms ease-out',
                }}
              >
                {k}
              </button>
            )
          })}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 8,
            padding: 4,
            borderRadius: 10,
            backgroundColor: t.bgSurface,
            border: `1px solid ${t.border}`,
          }}
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKey}
            placeholder={kind === 'website' ? 'example: youtube.com' : 'example: "movies"'}
            aria-label={kind === 'website' ? 'website to block' : 'keyword to block'}
            style={input}
          />
          <button
            type="button"
            onClick={() => void handleAdd()}
            disabled={!value.trim() || dup}
            aria-label="add"
            style={{
              width: 32,
              height: 32,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              borderRadius: 7,
              cursor: !value.trim() || dup ? 'not-allowed' : 'pointer',
              backgroundColor: !value.trim() || dup ? t.highlight : t.accent,
              color: !value.trim() || dup ? t.textTertiary : t.onAccent,
              transition: 'background-color 150ms ease-out',
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>

      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            lineHeight: 1.3,
            color: t.textSecondary,
            margin: '0 0 6px',
          }}
        >
          quick add
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {QUICK.map((g) => {
            const open = openGroup === g.label
            return (
              <button
                key={g.label}
                type="button"
                aria-expanded={open}
                onClick={() => setOpenGroup(open ? null : g.label)}
                style={{
                  padding: '6px 11px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 500,
                  lineHeight: 1,
                  cursor: 'pointer',
                  backgroundColor: open ? t.accent : t.bgSurface,
                  color: open ? t.onAccent : t.textSecondary,
                  border: `1px solid ${open ? t.accent : t.border}`,
                  transition: 'background-color 150ms ease-out',
                }}
              >
                {g.label}
              </button>
            )
          })}
        </div>
        {openGroup && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {QUICK.find((g) => g.label === openGroup)!.sites.map((site) => {
              const blocked = isDuplicate(items, 'website', site)
              return (
                <button
                  key={site}
                  type="button"
                  disabled={blocked}
                  onClick={() => void add('website', site)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 11px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 500,
                    lineHeight: 1,
                    cursor: blocked ? 'default' : 'pointer',
                    backgroundColor: t.bgSurface,
                    color: blocked ? t.textTertiary : t.textSecondary,
                    border: `1px solid ${t.border}`,
                    opacity: blocked ? 0.55 : 1,
                  }}
                >
                  {site}
                  <span style={{ fontSize: 11, lineHeight: 1 }}>{blocked ? '✓' : '+'}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            lineHeight: 1.3,
            color: t.textSecondary,
            margin: '0 0 6px',
          }}
        >
          {items.length === 0 ? 'blocked' : `blocked · ${items.length}`}
        </p>
        {items.length === 0 ? (
          <div
            style={{
              padding: '18px 14px',
              borderRadius: 12,
              textAlign: 'center',
              backgroundColor: t.bgSurface,
              border: `1px solid ${t.border}`,
            }}
          >
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
              nothing blocked yet
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 11, lineHeight: 1.4, color: t.textSecondary }}>
              add a site or keyword above.
            </p>
          </div>
        ) : (
          <div
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: t.bgSurface,
              border: `1px solid ${t.border}`,
            }}
          >
            {items.map((item, i) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 8px 9px 12px',
                  borderTop: i > 0 ? `1px solid ${t.border}` : 'none',
                }}
              >
                <span
                  style={{
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    backgroundColor: t.highlight,
                    color: t.textSecondary,
                  }}
                >
                  {item.type === 'website' ? 'URL' : 'KEY'}
                </span>
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 13,
                    fontWeight: 500,
                    color: t.textPrimary,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.value}
                </span>
                <button
                  type="button"
                  onClick={() => void remove(item.id)}
                  aria-label={`remove ${item.value}`}
                  style={{
                    width: 26,
                    height: 26,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    borderRadius: 6,
                    background: 'transparent',
                    cursor: 'pointer',
                    color: t.textTertiary,
                  }}
                >
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
