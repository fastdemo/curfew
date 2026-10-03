import { useState, type KeyboardEvent } from 'react'
import type { BlockedItem, ChromeStorage } from '../types'
import { useTheme } from '../ui/theme'
import { Screen } from '../ui/Screen'

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
  {
    label: 'ai tools',
    sites: ['chatgpt.com', 'claude.ai', 'gemini.google.com', 'perplexity.ai', 'character.ai', 'poe.com', 'you.com', 'copilot.microsoft.com', 'huggingface.co', 'deepseek.com', 'chat.deepseek.com', 'grok.com', 'meta.ai', 'mistral.ai'],
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

function splitLines(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

// Blocked list: defines the engine's match scope. One bulk box (kind switch
// + textarea + add-all), one quick-add strip, one grouped list with
// dividers. The count lives in the list heading only — nowhere else.
export function BlockedScreen({ storage }: Props) {
  const t = useTheme()
  const [kind, setKind] = useState<Kind>('website')
  const [value, setValue] = useState('')
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  const items = storage.blockedItems
  const lines = splitLines(value)
  // Only lines that normalize to something new count as addable.
  const addable = lines.filter((l) => {
    const n = normalize(kind, l)
    return n && !isDuplicate(items, kind, n)
  })

  const add = async (k: Kind, raw: string) => {
    const n = normalize(k, raw)
    if (!n || isDuplicate(items, k, n)) return false
    await storage.update({
      blockedItems: [...items, { id: crypto.randomUUID(), type: k, value: n }],
    })
    return true
  }

  const addMany = async (k: Kind, raws: string[]) => {
    const seen = new Set(items.map((i) => `${i.type}:${i.value.toLowerCase()}`))
    const next = [...items]
    for (const raw of raws) {
      const n = normalize(k, raw)
      if (!n || seen.has(`${k}:${n}`)) continue
      seen.add(`${k}:${n}`)
      next.push({ id: crypto.randomUUID(), type: k, value: n })
    }
    if (next.length === items.length) return 0
    await storage.update({ blockedItems: next })
    return next.length - items.length
  }

  const handleAdd = async () => {
    const added = await addMany(kind, lines)
    if (added > 0) setValue('')
  }

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleAdd()
    }
  }

  const remove = async (id: string) => {
    await storage.update({ blockedItems: items.filter((i) => i.id !== id) })
  }

  const input = {
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    height: 148,
    padding: '10px 12px',
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.6,
    color: t.textPrimary,
    resize: 'none',
    overflowY: 'auto',
  } as const

  return (
    <Screen>
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
          <div
            style={{
              marginTop: 8,
              paddingTop: 8,
              borderTop: `1px solid ${t.border}`,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
            }}
          >            {QUICK.find((g) => g.label === openGroup)!.sites.map((site) => {
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
          {addable.length === 0 ? 'add sites' : `add sites · ${addable.length} new`}
        </p>
        <div
          style={{
            padding: 4,
            borderRadius: 10,
            backgroundColor: t.bgSurface,
            border: `1px solid ${t.border}`,
          }}
        >
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKey}
            placeholder={kind === 'website' ? 'x.com\nyoutube.com\n67.com' : 'one keyword per line'}
            aria-label={kind === 'website' ? 'websites to block, one per line. enter adds them.' : 'keywords to block, one per line. enter adds them.'}
            style={input}
          />
        </div>
      </div>
    </Screen>
  )
}
