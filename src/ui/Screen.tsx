import type { ReactNode } from 'react'

/**
 * Shared screen scaffold — every popup tab renders its content inside
 * <Screen>, so top spacing can never drift per-screen again. Root is always
 * a top-aligned column filling the shell's <main>; the ONLY variance is the
 * inter-section `gap` (8 for tile screens, 10 for list screens). No screen
 * may set its own justifyContent/padding/margin on the root — bottom-pinning
 * (e.g. strict's CTA) is done with marginTop:'auto' on the pinned element.
 */
export function Screen({ gap = 10, children }: { gap?: 8 | 10; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, flex: 1, minHeight: 0 }}>
      {children}
    </div>
  )
}
