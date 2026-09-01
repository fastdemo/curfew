// Curfew — single source of truth for the shipped design language
// All screens (home, settings, strict) must use these tokens. Do not add one-off values.

export const TOKENS = {
  // — Frame —
  popup: {
    width: '290px',
    minHeight: '448px',
    padX: '16px',
    padYOuter: '12px 0 6px',
    gapOuter: '8px',
  },

  // — Spacing scale (4/8/12/16/24) —
  space: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '24px',
  },

  // — Card —
  card: {
    radius: '8px',
    pad: '8px 10px',
    gapIconText: '8px',
    gapTitleDesc: '1px',
    border: '1px solid var(--color-borderSoft)',
    bg: 'var(--color-surface)',
  },

  // — Typography (all lowercase) —
  type: {
    sectionHeader: { size: '11px', weight: 600, lineHeight: 1.3, letterSpacing: '0.04em', transform: 'lowercase' as const },
    cardTitle: { size: '13px', weight: 600, lineHeight: 1.3 },
    cardDesc: { size: '11px', weight: 400, lineHeight: 1.3 },
    pill: { size: '11px', weight: 500, lineHeight: 1 },
    appTitle: { size: '16px', weight: 700, lineHeight: 1.2 },
    subtitle: { size: '10.5px', weight: 400, lineHeight: 1.3 },
    buttonPrimary: { size: '13px', weight: 600, lineHeight: 1 },
  },

  // — Icon —
  icon: {
    box: '20px',
    glyph: '13px',
    gap: '8px',
  },

  // — Pills —
  pill: {
    pad: '3px 8px',
    gap: '5px',
    dot: '5px',
    radius: '999px',
  },

  // — Inputs / Toggles —
  input: {
    pad: '8px 10px',
    radius: '8px',
    fontSize: '12.5px',
    weight: 500,
  },
  toggle: {
    w: '32px',
    h: '18px',
    knob: '14px',
  },

  // — Buttons —
  button: {
    primary: { h: '42px', radius: '8px', padX: '12px', fontSize: '13px', weight: 600, gap: '6px', icon: '14px' },
    secondary: { h: '36px', radius: '8px', padX: '12px', fontSize: '13px', weight: 500 },
  },

  // — Header —
  header: {
    mascot: '32px',
    topMargin: '4px',
    bottomPad: '6px',
    gap: '2px',
    height: 'auto',
  },

  // — Nav —
  nav: {
    height: '44px',
    btn: '36px',
    icon: '18px',
    padX: '8px',
  },

  // — Progress —
  progress: {
    trackH: '6px',
  },
} as const
