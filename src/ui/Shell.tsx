import { useTheme } from './theme'
import { FRAME } from './frame'

export function Shell({
  mascotUrl,
  onMascot,
  status,
  children,
  tabs,
  activeTab,
  onTab,
  mainRef,
}: {
  mascotUrl: string
  onMascot: () => void
  /** header status word; null hides it (strict/schedule tabs own their own) */
  status: string | null
  children: React.ReactNode
  tabs: { id: string; label: string; icon: React.ReactNode }[]
  activeTab: string
  onTab: (id: string) => void
  mainRef: React.Ref<HTMLElement>
}) {
  const t = useTheme()
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
        <button
          type="button"
          onClick={onMascot}
          aria-label="open curfew on github"
          title="open curfew on github"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: 0,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          <img
            src={mascotUrl}
            alt="Curfew"
            width={30}
            height={30}
            style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
          <span
            className="font-display"
            style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2, color: t.textPrimary }}
          >
            curfew
          </span>
        </button>
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
              backgroundColor: t.successSoft,
              color: t.success,
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
