import { useRef } from 'react'
import { useTheme } from './theme'
import { FRAME } from './frame'

export function Shell({
  mascotUrl,
  status,
  children,
  tabs,
  activeTab,
  onTab,
  mainRef,
}: {
  mascotUrl: string
  /** header status word; null hides it (strict/schedule tabs own their own) */
  status: string | null
  children: React.ReactNode
  tabs: { id: string; label: string; icon: React.ReactNode }[]
  activeTab: string
  onTab: (id: string) => void
  mainRef: React.Ref<HTMLElement>
}) {
  const t = useTheme()
  // Potion chime on mascot click (autobing-style: icon click plays a sound,
  // navigates nowhere). Lazily created so no audio loads until first click.
  const potionRef = useRef<HTMLAudioElement | null>(null)
  const playPotion = () => {
    try {
      if (!potionRef.current) {
        potionRef.current = new Audio(chrome.runtime.getURL('audio/potion.mp3'))
      }
      potionRef.current.currentTime = 0
      void potionRef.current.play().catch(() => {})
    } catch { /* audio unavailable — silent */ }
  }
  return (
    <div
      style={{
        width: FRAME.width,
        minWidth: FRAME.width,
        maxWidth: FRAME.width,
        height: FRAME.height,
        minHeight: FRAME.height,
        maxHeight: FRAME.height,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: t.bgApp,
        color: t.textPrimary,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          height: FRAME.headerHeight,
          padding: `0 ${FRAME.padX}px`,
          flexShrink: 0,
        }}
      >
        {/* Mascot icon is its own hover/click target (autobing-style pop +
            potion sound) — the "curfew" word is a separate, static element. */}
        <img
          src={mascotUrl}
          alt="Curfew"
          width={30}
          height={30}
          onClick={playPotion}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') playPotion() }}
          tabIndex={0}
          role="button"
          aria-label="play curfew sound"
          title="curfew"
          className="curfew-mascot-icon"
          style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }}
        />
        {/* Wordmark: letters bounce in sequence on hover (pure CSS, one
            span per letter — text still reads "curfew" for a11y/UA),
            opens the repo in a new tab, never selectable. */}
        <span
          className="font-display curfew-wordmark"
          role="link"
          tabIndex={0}
          aria-label="open curfew on github"
          title="open curfew on github"
          onClick={() => chrome.tabs.create({ url: 'https://github.com/fastdemo/curfew' })}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') chrome.tabs.create({ url: 'https://github.com/fastdemo/curfew' }) }}
          style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2, color: t.textPrimary, cursor: 'pointer', userSelect: 'none' }}
        >
          {'curfew'.split('').map((ch, i) => (
            <span key={i} className="curfew-letter" aria-hidden="true">
              {ch}
            </span>
          ))}
        </span>
        {status && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1,
              padding: '4px 9px',
              borderRadius: 999,
              whiteSpace: 'nowrap',
              // "active" is informational, not the primary action: tint it
              // with the accent so curfew's green stays reserved, except on
              // the curfew palette itself where green is the brand signal.
              backgroundColor: t.paletteId === 'curfew' ? t.successSoft : t.highlight,
              color: t.paletteId === 'curfew' ? t.success : t.accent,
            }}
          >
            {status}
          </span>
        )}
      </header>
      <main
        ref={mainRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
          padding: `2px ${FRAME.padX}px 12px`,
        }}
      >
        {children}
      </main>
      <nav
        aria-label="sections"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: FRAME.navHeight,
          padding: `0 ${FRAME.padX}px`,
          flexShrink: 0,
          borderTop: `1px solid ${t.border}`,
          backgroundColor: t.bgApp,
        }}
      >
        {tabs.map((tab) => {
          const on = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTab(tab.id)}
              aria-label={tab.label}
              aria-current={on ? 'page' : undefined}
              style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                backgroundColor: on ? t.highlight : 'transparent',
                color: on ? t.textPrimary : t.textTertiary,
                transition: 'background-color 150ms ease-out, color 150ms ease-out',
              }}
            >
              {tab.icon}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
