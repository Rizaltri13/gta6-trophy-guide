// Progress store: everything the reader ticks, counts or writes is kept in
// localStorage under one key, so it survives a reload. Export writes a JSON
// file; import reads one back. Nothing leaves the browser.

const KEY = 'leonida-platinum-v1';

function blank() {
  return { earned: {}, progress: {}, notes: {}, spoilers: true };
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const parsed = JSON.parse(raw);
    return { ...blank(), ...parsed, earned: parsed.earned || {}, progress: parsed.progress || {}, notes: parsed.notes || {} };
  } catch {
    return blank();
  }
}

export function saveStore(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: progress still lives in memory for this visit.
  }
}

export function isEarned(state, trophy) {
  return Boolean(state.earned[trophy.name]);
}

export function toggleEarned(state, trophy) {
  if (state.earned[trophy.name]) delete state.earned[trophy.name];
  else state.earned[trophy.name] = true;
  saveStore(state);
}

export function earnedCount(state) {
  return Object.keys(state.earned).length;
}

export function progressOf(state, trophy) {
  return state.progress[trophy.id] || 0;
}

export function setProgress(state, trophy, value) {
  const target = typeof trophy.target === 'number' ? trophy.target : null;
  let v = Math.max(0, Math.floor(value) || 0);
  if (target !== null) v = Math.min(target, v);
  if (v === 0) delete state.progress[trophy.id];
  else state.progress[trophy.id] = v;
  saveStore(state);
  return v;
}

export function noteOf(state, trophy) {
  return state.notes[trophy.id] || '';
}

export function setNote(state, trophy, text) {
  const v = String(text || '').slice(0, 500);
  if (v.trim() === '') delete state.notes[trophy.id];
  else state.notes[trophy.id] = v;
  saveStore(state);
}

/** JSON text of the whole save, for export. */
export function exportText(state) {
  return JSON.stringify({ app: 'leonida-platinum', version: 1, exportedAt: new Date().toISOString(), state }, null, 2);
}

/** Parse an exported file back into state. Returns null when it is not ours. */
export function importText(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  const state = parsed && parsed.state ? parsed.state : parsed;
  if (!state || typeof state !== 'object') return null;
  const clean = blank();
  if (state.earned && typeof state.earned === 'object') clean.earned = state.earned;
  if (state.progress && typeof state.progress === 'object') clean.progress = state.progress;
  if (state.notes && typeof state.notes === 'object') clean.notes = state.notes;
  if (typeof state.spoilers === 'boolean') clean.spoilers = state.spoilers;
  return clean;
}

export function resetStore() {
  const fresh = blank();
  saveStore(fresh);
  return fresh;
}

/** Demo state for screenshots: 13 trophies earned, a few counters part-way.
 * Only runs when the page is opened with ?demo=1. */
export function seedDemo(state) {
  const demo = blank();
  for (const name of [
    'Just Like Paradise', 'Paradise Lost', 'Trust', 'Master of None',
    'Baited My Tackle', 'Stick Fiddler', 'Hot Together', 'In The Beginning…',
    'Let’s Go Bowling', 'Ten Pin', 'Treat Yo Self', 'On the Spot',
    'Positive Mental Attitude',
  ]) demo.earned[name] = true;
  demo.progress = { 15: 87, 17: 12, 31: 34, 35: 41, 42: 21 };
  demo.notes = { 17: 'Gold the pistol challenges first — they are the easiest.' };
  demo.spoilers = true;
  saveStore(demo);
  return demo;
}
