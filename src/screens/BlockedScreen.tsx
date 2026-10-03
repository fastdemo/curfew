import { useState } from 'react'
import type { BlockedItem, ChromeStorage } from '../types'
import { useTheme } from '../ui/theme'
import { Screen } from '../ui/Screen'

interface Props {
  storage: ChromeStorage & { update: (p: Partial<ChromeStorage>) => Promise<void> }
}

type Kind = 'website' | 'keyword'
type Scope = 'focus' | 'always'

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

function scopeOf(item: BlockedItem): Scope {
  return item.scope ?? 'focus'
}

function isDuplicate(items: BlockedItem[], scope: Scope, kind: Kind, value: string): boolean {
  const n = normalize(kind, value)
  if (!n) return true
  return items.some((i) => scopeOf(i) === scope && i.type === kind && i.value.toLowerCase() === n)
}

function splitLines(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

// Blocked tab: kind switch, quick-add strip, then two boxes that ARE the
// lists — "blocked on focus" (only while focus/schedule/strict runs) and
// "blocked forever" (always on). Each box always mirrors storage for the
// active kind+scope, one value per line; editing lines adds/removes live.
// Quick-add chips only ever land in "blocked on focus".
export function BlockedScreen({ storage }: Props) {
  const t = useTheme()
  const [kind, setKind] = useState<Kind>('website')
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  const items = storage.blockedItems

  const syncLines = (scope: Scope, raw: string) => {
    const wanted = new Map<string, string>()
    for (const line of splitLines(raw)) {
      const n = normalize(kind, line)
      if (n && !wanted.has(n)) wanted.set(n, line)
    }
    const kept = new Map<string, BlockedItem>()
    for (const item of items) {
      if (item.type !== kind || scopeOf(item) !== scope) continue
      if (wanted.has(item.value.toLowerCase()) && !kept.has(item.value.toLowerCase())) {
        kept.set(item.value.toLowerCase(), item)
      }
    }
    const next = [
      ...items.filter((i) => i.type !== kind || scopeOf(i) !== scope),
      ...[...wanted.keys()].map((n) => kept.get(n) ?? { id: crypto.randomUUID(), type: kind, scope, value: n }),
    ]
    void storage.update({ blockedItems: next })
  }

  const quickAdd = async (raw: string) => {
    const n = normalize('website', raw)
    if (!n || isDuplicate(items, 'focus', 'website', n)) return false
    await storage.update({
      blockedItems: [...items, { id: crypto.randomUUID(), type: 'website', scope: 'focus' as const, value: n }],
    })
    return true
  }

  const box = {
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

  const label = {
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1.3,
    color: t.textSecondary,
    margin: '0 0 6px',
  } as const

  const renderBox = (scope: Scope, title: string, placeholder: string) => {
    const scoped = items.filter((i) => i.type === kind && scopeOf(i) === scope)
    const value = scoped.map((i) => i.value).join('\n')
    return (
      <div>
        <p style={label}>
          {scoped.length === 0 ? title : `${title} · ${scoped.length}`}
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
            onChange={(e) => syncLines(scope, e.target.value)}
            placeholder={placeholder}
            aria-label={scope === 'focus' ? `sites blocked while focusing, one per line` : `sites blocked at all times, one per line`}
            style={box}
          />
        </div>
      </div>
    )
  }

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
        <p style={label}>
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
              const blocked = isDuplicate(items, 'focus', 'website', site)
              return (
                <button
                  key={site}
                  type="button"
                  disabled={blocked}
                  onClick={() => void quickAdd(site)}
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

      {renderBox('focus', 'blocked on focus', kind === 'website' ? 'x.com\nyoutube.com\nopen.spotify.com' : 'one keyword per line')}
      {renderBox('always', 'blocked forever', kind === 'website' ? 'tiktok.com\nreddit.com\nwhatsapp.com' : 'one keyword per line')}
    </Screen>
  )
}
