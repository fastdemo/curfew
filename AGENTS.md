# Curfew — Agent Guide

## Build

```sh
npm run build              # full build (tsc → vite → vite content → copy assets)
npm run lint               # eslint
npm run dev                # Vite dev server (for popup/block page preview)
```

The `build` script chains: `tsc -b` → `vite build` (popup + block + service worker) → `vite build --config vite.content.config.ts` (content script IIFE) → `cp manifest.json + public/` to `dist/`.

## Architecture

Manifest V3 Chrome extension with 4 entry points built with Vite + React + Tailwind CSS v4:

| Entry | File | Build output |
|---|---|---|
| Popup | `popup.html` → `src/popup/main.tsx` | `dist/assets/popup.js` |
| Block page | `block.html` → `src/block/main.tsx` | `dist/assets/block.js` |
| Service worker | `src/background/service-worker.ts` | `dist/src/background/service-worker.js` |
| Content script | `src/content/overlay.tsx` | `dist/src/content/overlay.js` |

**Content script** is built as a **separate IIFE** via `vite.content.config.ts` (no React, no ES modules — Chrome rejects `type="module"` in content scripts). It uses `emptyOutDir: false` to coexist with the main Vite build.

**Service worker** uses `"type": "module"` in manifest — MV3 requires this.

## Key constraints (not obvious from code)

- **Block page & overlay buttons** use hardcoded inline styles (`#8A7B6B`, `#2D2824`, `#F3EEEA`) not CSS variables — required by the design spec
- **Overlay** uses `attachShadow({ mode: 'closed' })` with a CSS reset to isolate from host pages
- **`scripting` permission** is required for `chrome.scripting.executeScript` — it's in the manifest
- **Theme**: `.dark` class on `<html>` swaps CSS variables. App.tsx `useEffect` toggles it based on `storage.settings.theme` (light/dark/system)
- **Navigation interception**: `CURFEW_RELOAD_BLOCKED_TABS` message calls `handleNavigation(tab.id, tab.url)` directly (not `chrome.tabs.reload()`) to avoid race with `webNavigation`
- **Domain tracking**: `tickTracking` writes to `chrome.storage.local` every 1s via `setInterval` in the service worker
- **Analytics pie chart**: updates every 1s via polling + `chrome.storage.onChanged`
- **Tab operations** in `handleNavigation` are wrapped in try/catch — stale tab IDs crash otherwise
- **`declarativeNetRequestFeedback`** permission is required for the block page redirect flow
- **`<all_urls>`** host permission is needed for content script injection across all sites

## Style conventions

- Tailwind v4 via `@tailwindcss/vite` plugin (no PostCSS config, no `tailwind.config.js`)
- `noUnusedLocals` / `noUnusedParameters` are on in `tsconfig.app.json`
- `verbatimModuleSyntax` is on — use `import type` for type-only imports

## Loading the extension

Load `dist/` folder in `chrome://extensions` as unpacked. The extension icon is `public/icons/icon128.png` (single 128×128 file used for all sizes).
