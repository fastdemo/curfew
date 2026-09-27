![Curfew icon](public/icons/anko128.png)
# Curfew

Blocks distracting websites and helps you stay locked in!

## Highlights

When enabled, Curfew adds friction to your chosen sites with a block screen instead, with mindfulness interventions, strict focus sessions, and automatic schedules to keep you on track and be productive.

## Preview

![Curfew product thumbnail](https://github.com/fastdemo/curfew/raw/refs/heads/main/website/images/curfew-thumb.jpg)

## Features

- **Block websites & keywords:** Add sites and keywords to your blocklist, or quick-add from curated categories like socials, entertainment, games, and AIs.
- **Interventions:** Before proceeding to a blocked site, you will be forced to complete a friction exercise (instant block, press & hold, slide, breathing), or none at all.
- **Strict sessions:** Start a timer where you can't bypass any blocked sites at all cost, for maximum focus.
- **Schedules:** Create recurring times (e.g. work hours) when blocking turns on automatically.
- **Usage analytics:** See how much time you spend on each site with a breakdown by day, week, or month.
- **16 color themes:** Pick from many curated color palettes (Curfew, Catppuccin, Dracula, Nord, and more), each with light & dark modes.
- **PIN protection:** Require a PIN before switching off, so future-you can't cheat hehe.

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
2. Toggle the switch to start blocking, or add sites and keywords in the Blocked tab.
3. Pick your interventions on the home screen, which adds friction between you and your distractions.
4. Start a strict session or set a schedule when you need to lock in.
5. Tweak themes and PIN protection in the Settings tab.

Preferences are stored locally by the extension.

## Credits

- **focusmode.app** - The main source of inspiration for this extension. It was great and all until the developers forced a paywall for an extension that does basic features *(now free, with Curfew!)*.
- **iago** - A Japanese learning app. I referenced their art style for the mascot, which is based on Anko Uguisu *(from the anime "Call of the Night")*.

This is an open-source project and I have no plans for monetization. If you're uncomfortable with any of the borrowed assets, reach out and it'll be taken down swiftly. Stay productive!

Made with love by **@fastdemo** <3
