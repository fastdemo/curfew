import { useState, useRef, useEffect } from 'react'
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

// Blocked tab: kind switch, quick-add strip, then two boxes that ARE the
// lists — "blocked on focus" (only while focus/schedule/strict runs) and
// "blocked forever" (always on). Each box holds a local draft while focused
// (so typing never fights storage); on blur the draft commits: values are
// normalized/deduped, ids preserved for survivors, and a value typed here
// moves from the other box (one value lives in exactly one box).
// Quick-add chips only ever land in "blocked on focus".
export function BlockedScreen({ storage }: Props) {
  const t = useTheme()
  const [kind, setKind] = useState<Kind>('website')
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  // Local drafts keyed by kind+scope, plus which box is being edited.
  // Drafts commit on blur AND on a 800ms idle debounce after the last
  // keystroke — closing the popup (unmount, no blur) can only lose ≤800ms
  // of typing, never the whole session. update() mirrors into hook state
  // synchronously, so storage is fresh right after commit. Cross-box moves
  // are explicit (erase here + type there), never implicit: a commit only
  // reconciles its own kind+scope and leaves every other row — including
  // the same value under the other box — untouched.
  const [drafts, setDrafts] = useState<Partial<Record<string, string>>>({})
  const [editing, setEditing] = useState<string | null>(null)

  const items = storage.blockedItems
  const boxKey = (scope: Scope) => `${kind}:${scope}`
  // Latest items for timer callbacks (avoids stale closures).
  const itemsRef = useRef(items)
  itemsRef.current = items
  const updatedRef = useRef(storage.update)
  updatedRef.current = storage.update
  const timers = useRef<Partial<Record<string, ReturnType<typeof setTimeout>>>>({})
  useEffect(() => {
    const t = timers.current
    return () => {
      for (const id of Object.values(t)) clearTimeout(id)
    }
  }, [])

  const buildNext = (scope: Scope, raw: string, base: BlockedItem[]) => {
    const wanted = new Map<string, string>()
    for (const line of splitLines(raw)) {
      const n = normalize(kind, line)
      if (n && !wanted.has(n)) wanted.set(n, line)
    }
    const kept = new Map<string, BlockedItem>()
    for (const item of base) {
      if (item.type !== kind) continue
      if (wanted.has(item.value.toLowerCase()) && !kept.has(item.value.toLowerCase())) {
        kept.set(item.value.toLowerCase(), item)
      }
    }
    // Only rows of THIS kind+scope are reconciled, and the box text is the
    // authority for ORDER: survivors are emitted in box order (wanted
    // insertion order), not storage order — so the box never reshuffles
    // under the cursor. Every other row — other kind, other box, even the
    // same value under the other box — passes through untouched.
    const sameScope = base.filter((i) => i.type === kind && scopeOf(i) === scope)
    const untouched = base.filter((i) => i.type !== kind || scopeOf(i) !== scope)
    const byValue = new Map(sameScope.map((i) => [i.value.toLowerCase(), i]))
    return [
      ...untouched,
      ...[...wanted.keys()].map((n) => byValue.get(n) ?? { id: crypto.randomUUID(), type: kind, scope, value: n }),
    ]
  }

  const scheduleSave = (scope: Scope, key: string, raw: string) => {
    const timersMap = timers.current
    if (timersMap[key]) clearTimeout(timersMap[key])
    timersMap[key] = setTimeout(() => {
      delete timersMap[key]
      void updatedRef.current({ blockedItems: buildNext(scope, raw, itemsRef.current) })
    }, 800)
  }

  const quickAdd = async (raw: string) => {
    const n = normalize('website', raw)
    if (!n) return false
    // Quick-add targets focus: skip if already in focus; a forever-row with
    // the same value stays put (a value may live in both boxes — each box
    // owns its own list, no stealing). If the focus box holds an
    // uncommitted draft (typed but not blurred), reconcile the draft first
    // so nothing typed is lost to stale storage text.
    const inFocus = items.some((i) => i.type === 'website' && scopeOf(i) === 'focus' && i.value.toLowerCase() === n)
    if (inFocus) return false
    const key = `website:focus`
    const draft = editing === key ? drafts[key] : undefined
    const base =
      draft !== undefined
        ? buildNext('focus', `${draft}\n${n}`, items)
        : [
            ...items,
            { id: crypto.randomUUID(), type: 'website' as const, scope: 'focus' as const, value: n },
          ]
    await storage.update({ blockedItems: base })
    if (draft !== undefined) {
      setDrafts((d) => ({ ...d, [key]: `${draft.trimEnd()}\n${n}` }))
    }
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
    const key = boxKey(scope)
    // While editing, show the draft untouched; otherwise mirror storage.
    // External writes (quick-add, the other box) refresh the draft too, so
    // the box never shows stale lines once you tab into it.
    const value = editing === key ? (drafts[key] ?? '') : scoped.map((i) => i.value).join('\n')
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
            onFocus={() => {
              setEditing(key)
              setDrafts((d) => ({ ...d, [key]: scoped.map((i) => i.value).join('\n') }))
            }}
            onChange={(e) => {
              const raw = e.target.value
              setDrafts((d) => ({ ...d, [key]: raw }))
              scheduleSave(scope, key, raw)
            }}
            onBlur={(e) => {
              // Flush any pending debounce NOW (synchronous build off the
              // blur value, not the timer's stale closure), then clear.
              const timersMap = timers.current
              if (timersMap[key]) {
                clearTimeout(timersMap[key])
                delete timersMap[key]
              }
              const next = buildNext(scope, e.target.value, itemsRef.current)
              // Clear the draft FIRST so the blur re-render (editing=null)
              // falls through to storage text, not the stale draft — then
              // commit. update() mirrors synchronously in the mock and in
              // the real hook, so no flash of old lines.
              setDrafts((d) => {
                const c = { ...d }
                delete c[key]
                return c
              })
              setEditing((cur) => (cur === key ? null : cur))
              void updatedRef.current({ blockedItems: next })
            }}
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
