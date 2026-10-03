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

function splitLines(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

// Blocked tab: kind switch, quick-add strip, then two lists that ARE the
// boxes — "blocked on focus" (only while focus/schedule/strict runs) and
// "blocked forever" (always on). One row per site: the value plus a ×
// button. Add via the bottom input (Enter or the + button, one or many
// lines pasted); remove with ×. No drafts, no debounce, no blur commits —
// every action is one direct storage write, so nothing can be silently
// lost. Quick-add chips only ever land in "blocked on focus".
export function BlockedScreen({ storage }: Props) {
  const t = useTheme()
  const [kind, setKind] = useState<Kind>('website')
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [entry, setEntry] = useState('')
  const [entryScope, setEntryScope] = useState<Scope>('focus')

  const items = storage.blockedItems

  const addLines = (scope: Scope, raw: string) => {
    const fresh: string[] = []
    for (const line of splitLines(raw)) {
      const n = normalize(kind, line)
      if (!n || fresh.includes(n)) continue
      const exists = items.some(
        (i) => i.type === kind && scopeOf(i) === scope && i.value.toLowerCase() === n,
      )
      if (!exists) fresh.push(n)
    }
    if (fresh.length === 0) return 0
    void storage.update({
      blockedItems: [
        ...items,
        ...fresh.map((value) => ({ id: crypto.randomUUID(), type: kind, scope, value })),
      ],
    })
    return fresh.length
  }

  const remove = (id: string) => {
    void storage.update({ blockedItems: items.filter((i) => i.id !== id) })
  }

  const quickAdd = async (raw: string) => {
    const n = normalize('website', raw)
    if (!n) return false
    // Quick-add targets focus only; forever rows never affect chip state.
    const inFocus = items.some((i) => i.type === 'website' && scopeOf(i) === 'focus' && i.value.toLowerCase() === n)
    if (inFocus) return false
    await storage.update({
      blockedItems: [
        ...items,
        { id: crypto.randomUUID(), type: 'website' as const, scope: 'focus' as const, value: n },
      ],
    })
    return true
  }

  const label = {
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1.3,
    color: t.textSecondary,
    margin: '0 0 6px',
  } as const

  const renderBox = (scope: Scope, title: string, placeholder: string) => {
    const scoped = items.filter((i) => i.type === kind && scopeOf(i) === scope)
    const submitEntry = () => {
      if (addLines(scope, entry) > 0) setEntry('')
    }
    return (
      <div>
        <p style={label}>
          {scoped.length === 0 ? title : `${title} · ${scoped.length}`}
        </p>
        <div
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: t.bgSurface,
            border: `1px solid ${t.border}`,
          }}
        >
          {scoped.map((item, i) => (
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
                onClick={() => remove(item.id)}
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: 4,
              borderTop: scoped.length > 0 ? `1px solid ${t.border}` : 'none',
            }}
          >
            <textarea
              value={scope === entryScope ? entry : ''}
              onChange={(e) => {
                setEntryScope(scope)
                setEntry(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submitEntry()
                }
              }}
              rows={1}
              placeholder={placeholder}
              aria-label={scope === 'focus' ? 'add sites blocked while focusing' : 'add sites blocked at all times'}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                flex: 1,
                minWidth: 0,
                padding: '9px 4px 9px 10px',
                fontSize: 13,
                fontWeight: 500,
                lineHeight: 1.4,
                color: t.textPrimary,
                resize: 'none',
                overflow: 'hidden',
              }}
            />
            <button
              type="button"
              onClick={submitEntry}
              disabled={!entry.trim() || scope !== entryScope}
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
                cursor: !entry.trim() || scope !== entryScope ? 'not-allowed' : 'pointer',
                backgroundColor: !entry.trim() || scope !== entryScope ? t.highlight : t.accent,
                color: !entry.trim() || scope !== entryScope ? t.textTertiary : t.onAccent,
                transition: 'background-color 150ms ease-out',
              }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
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
              // ✓ only when already in the focus box. Forever rows never
              // affect the chip state — each box owns its own list.
              const n = normalize('website', site)
              const inFocus = items.some((i) => i.type === 'website' && scopeOf(i) === 'focus' && i.value.toLowerCase() === n)
              const blocked = !n || inFocus
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
