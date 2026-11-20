// Data layer: loads app/data/trophies.json (the official 55, with our own guides)
// and offers small lookups the views share. No network beyond this one file.

export const KIND_LABELS = {
  platinum: 'Platinum',
  story: 'Story',
  'side-story': 'Side story',
  collectibles: 'Collectibles',
  activities: 'Activities',
  exploration: 'Exploration',
  combat: 'Combat',
  money: 'Money',
  misc: 'Everything else',
};

export const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

export const STAGES = [
  { n: 1, title: 'Stage 1 — Play the story', blurb: 'Chapters 1–4, the opening mission and the finale. Story trophies unlock on completion, so nothing here can be missed — just play. Clear side content as it opens, before the story moves on.' },
  { n: 2, title: 'Stage 2 — Side strands, before the endgame', blurb: 'Andy, Kenton, Billy, Randy, Tyrone, Bret and the strangers. Strands can lock as the story advances, so finish each one while it is open — this is where the missables live.' },
  { n: 3, title: 'Stage 3 — Activities & skills', blurb: 'Shooting range, drone races, races, fishing, arcade, bowling, meditation and challenges. Grindable any time after they unlock; the shooting range golds are the long pole here.' },
  { n: 4, title: 'Stage 4 — Collectibles & exploration', blurb: 'Cards, WAiNK It spots, vehicles, the 52 areas of Leonida, garages and the Scooter Bros app. Sweep the map region by region and tick things off as you find them.' },
  { n: 5, title: 'Stage 5 — Money & mayhem', blurb: 'Robberies, vaults, armored trucks, gang operations, laundering, spending and Combat Focus. These feed each other — robberies make the marked bills that the laundering trophy counts.' },
  { n: 6, title: 'Stage 6 — Cleanup & the platinum', blurb: '100% completion, the cryptic one-offs, and the platinum itself. Whatever is left after stages 1–5, finished here.' },
];

let cache = null;

/** Load the trophy list once and keep it. */
export async function loadTrophies() {
  if (cache) return cache;
  const res = await fetch('data/trophies.json');
  if (!res.ok) throw new Error('could not load data/trophies.json');
  const doc = await res.json();
  cache = doc.trophies;
  return cache;
}

export function byId(trophies, id) {
  return trophies.find((t) => t.id === id) || null;
}

export function byName(trophies, name) {
  return trophies.find((t) => t.name === name) || null;
}

export function gradeCounts(trophies) {
  const out = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) out[t.grade] = (out[t.grade] || 0) + 1;
  return out;
}

/** PSN's progress target for a trophy, or null when it has none. */
export function targetOf(trophy) {
  return typeof trophy.target === 'number' ? trophy.target : null;
}
