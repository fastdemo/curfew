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

## product images

<img width="450" height="700" alt="home page" src="https://github.com/user-attachments/assets/55d9d953-f8aa-47c0-b5a1-56933e96b8ad" />
<img width="450" height="700" alt="add/remove websites" src="https://github.com/user-attachments/assets/decb8b0f-535b-46a9-8107-e34480590005" />
<img width="1100" height="550" alt="block page" src="https://github.com/user-attachments/assets/8b9ef24e-475e-4a26-b574-f7606722e23e" />
