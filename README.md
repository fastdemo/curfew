![Curfew icon](public/icons/anko128.png)
# Curfew

Blocks distracting websites and helps you stay locked in!

## Highlights

Curfew intercepts navigation to your blocked sites and shows a friendly block screen instead, with mindfulness interventions, strict focus sessions, and automatic schedules to keep you on track.

## Preview

![Curfew product thumbnail](https://github.com/fastdemo/curfew/raw/refs/heads/main/website/images/curfew-thumb.jpg)

## Features

- **Block websites & keywords** — add sites and keywords to your blocklist, or quick-add from curated categories like socials, entertainment, games, and AI tools.
- **Interventions** — before proceeding to a blocked site, complete a short friction exercise (instant block, press & hold, slide, breathing). Pick your favorites.
- **Strict sessions** — start a timer where you can't access any blocked sites. No bypass, no excuses.
- **Schedules** — set recurring windows (e.g. work hours) when blocking turns on automatically.
- **Overlay mode** — instead of redirecting to a separate block page, overlay the block screen on top of the site itself.
- **Usage analytics** — see how much time you spend on each site with a breakdown by day, week, or month.
- **16 color themes** — pick from curated palettes (Curfew, Catppuccin, Dracula, Nord, and more), each with light & dark modes.
- **PIN protection** — require a PIN before switching off, so future-you can't cheat.

## Install

1. Clone the repo:

   ```bash
   git clone https://github.com/fastdemo/curfew.git
   ```

2. Install dependencies and build:

   ```bash
   npm install
   npm run build
   ```

3. Open `chrome://extensions/`.
4. Turn on Developer mode.
5. Click Load unpacked.
6. Select the `dist/` folder.

## Usage

1. Click the Curfew icon in the toolbar.
2. Flip the switch to start blocking, or add sites and keywords in the Blocked tab.
3. Pick your interventions on the home screen — these stand between you and your distractions.
4. Start a strict session or set a schedule when you need to lock in.
5. Tweak themes and PIN protection in the Settings tab.

Preferences are stored locally by the extension.

## Credits

- **focusmode.app** - the main inspiration for this extension. It was great until the developers forced a paywall.
- **iago** - a Japanese learning app. I referenced their art style for the mascot, which is based on Anko (from the anime "Call of the Night").

This is a completely open-source project and I have no intentions of profiting from this. If you're uncomfortable with any of the borrowed assets, feel free to reach out and I'll take it down!

Made with love by **@fastdemo** <3
