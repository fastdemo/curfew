<img width="128" height="128" alt="anko128" src="https://github.com/user-attachments/assets/d61fd451-ca9a-460d-9672-0ec7811752c8" />

# curfew

a chrome extension that blocks distracting websites and helps you stay locked in.

## features

- **block websites & keywords** — add sites and keywords to your blocklist. curfew intercepts navigation and shows a friendly block screen instead.
- **interventions** — before proceeding to a blocked site, curfew asks you to complete a short mindfulness exercise (breathing, hold, slide). pick your favorites.
- **strict sessions** — start a timer where you can't access any blocked sites. no bypass, no excuses.
- **grace period** — need a quick break? curfew lets you through for 5 minutes. after that, the block comes back automatically.
- **schedules** — set recurring windows when blocking is active automatically.
- **overlay mode** — instead of redirecting to a separate block page, curfew can overlay the block screen on top of the site itself.
- **usage analytics** — see how much time you spend on each site with a pie chart breakdown.
- **light & dark themes** — follows your system preference or pick manually.

## building

```sh
npm run build    # tsc → vite → copy assets
npm run dev      # vite dev server
```

output goes to `dist/`. load that folder as an unpacked extension in `chrome://extensions`.

## stack

chrome extension manifest v3, react, typescript, tailwind css v4, vite.
