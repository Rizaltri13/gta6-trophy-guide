[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Rizaltri13/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Rizaltri13/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Platinum — GTA VI Trophy Guide & Tracker

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI, built for the [make.fun bounty gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01) ("Build the best GTA 6 trophy guide").

Static files, no build step, no network at run time: open `app/index.html` from any static server and it works with the network off.

## What it does

- **Checklist of the official 55** — every trophy with its official name, description and grade (1 platinum, 2 gold, 6 silver, 46 bronze), saved in the browser (localStorage), with export and import.
- **Guides in our own words** — each trophy gets what to do, where, how, and when it can be missed, with its sources named beside it. Names, descriptions and grades are PlayStation's, as listed on [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/); PSN progress targets (0/N) are from [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi). Anything not yet checked in the game is flagged as such — no invented locations.
- **Filters by kind** — story, side stories, collectibles, activities, exploration, combat, money — plus grade, search, a missable-only toggle and hide-earned.
- **Spoiler setting** — hides the names and descriptions of story trophies until you earn them.
- **Roadmap to the platinum** — six stages in order, built from the official descriptions.
- **Missables flagged** — 11 trophies that can close off (side strands, one-off challenges, one-time choices), each with its warning.
- **Next up planner** — what to chase next: missables first, then the stage you are closest to finishing.
- **Progress counters** — PSN targets (250 stunts, 42 shooting-range golds, 100 WAiNK It spots…) with +/- steppers, and a personal note field per trophy.

## Run it

```sh
node serve.ts          # serves app/ on http://localhost:8080
```

Or serve `app/` with any static server and open `index.html`. Add `?demo=1` to seed 13 earned trophies for a quick look.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored `vendor/makefun-frontend.ts`.

## Screenshots

Real renders of the app's own code, taken in headless Chrome at 1280×800:

1. `1-checklist.jpg` — checklist with a trophy guide open, progress seeded
2. `2-roadmap.jpg` — the roadmap to the platinum
3. `3-missables.jpg` — the missables page
4. `4-nextup.jpg` — the Next up planner

## License

MIT. Unofficial fan guide — not affiliated with Rockstar Games, Sony Interactive Entertainment, or PlayStation. No Rockstar logo or official artwork is used.
