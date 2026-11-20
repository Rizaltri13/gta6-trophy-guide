// Filters: the checklist's search box, kind and grade selects, the missable
// toggle, hide-earned, and the spoiler rule. One pure predicate, so the list
// and the counts always agree.

export function blankFilters() {
  return { q: '', kind: 'all', grade: 'all', missableOnly: false, hideEarned: false };
}

/**
 * The spoiler rule: with spoilers on, a story trophy the reader has not
 * earned yet is hidden behind a placeholder — its name and description stay
 * secret until earned. Everything else is always shown.
 */
export function isSpoilerHidden(trophy, state) {
  if (!state.spoilers) return false;
  if (trophy.kind !== 'story') return false;
  return !state.earned[trophy.name];
}

export function matches(trophy, filters, state) {
  if (filters.kind !== 'all' && trophy.kind !== filters.kind) return false;
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.missableOnly && !trophy.missable) return false;
  if (filters.hideEarned && state.earned[trophy.name]) return false;
  const q = filters.q.trim().toLowerCase();
  if (q) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.kind}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export function applyFilters(trophies, filters, state) {
  return trophies.filter((t) => matches(t, filters, state));
}
