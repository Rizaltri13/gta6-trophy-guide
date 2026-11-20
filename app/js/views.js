// Checklist + detail pane: the heart of the tracker. The list shows every
// trophy with its official name, description and grade; the detail pane shows
// one trophy's guide, its steps, its sources and its missable warning.

import { KIND_LABELS } from './data.js';
import { isEarned, toggleEarned, progressOf, setProgress, noteOf, setNote } from './store.js';
import { isSpoilerHidden } from './filters.js';

const GRADE_DOT = { platinum: '#5f7d95', gold: '#b98a1d', silver: '#7d8894', bronze: '#a86a3c' };

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

function gradeBadge(grade) {
  return el('span', `badge ${grade}`, grade);
}

function kindTag(kind) {
  return el('span', 'tag', KIND_LABELS[kind] || kind);
}

function missableTag() {
  return el('span', 'tag missable', 'Missable — read the warning');
}

/** One row of the checklist. */
function trophyRow(trophy, state, selectedId, onSelect, onToggle) {
  const li = el('li', 'trophy-card');
  if (isEarned(state, trophy)) li.classList.add('earned');
  if (trophy.id === selectedId) li.classList.add('selected');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned(state, trophy);
  box.setAttribute('aria-label', `Mark ${trophy.name} earned`);
  box.addEventListener('change', () => onToggle(trophy));
  li.append(box);

  const body = el('div');
  const hidden = isSpoilerHidden(trophy, state);
  if (hidden) {
    const name = el('div', 'trophy-name');
    name.append(el('span', 'hidden-mark', 'Hidden story trophy — earn it to reveal its name'));
    body.append(name);
    body.append(el('p', 'trophy-desc', 'Its name and description stay hidden while spoilers are on. Tick it off once you have earned it in the game.'));
  } else {
    body.append(el('div', 'trophy-name', trophy.name));
    body.append(el('p', 'trophy-desc', trophy.description));
  }
  const tags = el('div', 'trophy-tags');
  tags.append(gradeBadge(trophy.grade));
  tags.append(kindTag(trophy.kind));
  if (trophy.missable) tags.append(missableTag());
  body.append(tags);

  if (typeof trophy.target === 'number') {
    const line = el('div', 'target-line');
    const current = progressOf(state, trophy);
    line.append(el('span', null, `Progress: ${current} / ${trophy.target} ${trophy.targetUnit || ''}`));
    const minus = el('button', null, '−');
    minus.type = 'button';
    minus.addEventListener('click', () => onToggle(trophy, -1));
    const plus = el('button', null, '+');
    plus.type = 'button';
    plus.addEventListener('click', () => onToggle(trophy, 1));
    line.append(minus, plus);
    body.append(line);
  }
  li.append(body);

  const actions = el('div', 'trophy-actions');
  const guideBtn = el('button', 'guide-btn', hidden ? 'Why hidden?' : 'Guide');
  guideBtn.type = 'button';
  guideBtn.addEventListener('click', () => onSelect(trophy));
  actions.append(guideBtn);
  li.append(actions);
  return li;
}

export function renderChecklist(listEl, metaEl, emptyEl, trophies, state, filters, selectedId, handlers) {
  listEl.replaceChildren();
  for (const t of trophies) {
    listEl.append(trophyRow(t, state, selectedId, handlers.select, handlers.toggle));
  }
  const earned = Object.keys(state.earned).length;
  metaEl.textContent = `${trophies.length} shown · ${earned} of 55 earned overall` +
    (filters.q || filters.kind !== 'all' || filters.grade !== 'all' || filters.missableOnly || filters.hideEarned
      ? ' · filters active' : '');
  emptyEl.hidden = trophies.length !== 0;
}

const SOURCE_LINKS = {
  'Exophase — official list': 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/',
  'PSNProfiles — PSN target': 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi',
};

function sourceHref(label) {
  for (const [prefix, href] of Object.entries(SOURCE_LINKS)) {
    if (label.startsWith(prefix)) return href;
  }
  return null;
}

/** The detail pane for one trophy: official text, our guide, steps, sources. */
export function renderDetail(detailEl, trophy, state, onEarnedChange) {
  detailEl.replaceChildren();
  if (!trophy) {
    const empty = el('div', 'detail-card detail-empty');
    empty.append(el('h3', null, 'Pick a trophy'));
    empty.append(el('p', null, 'Click “Guide” on any trophy to see how to earn it: what to do, where, how — and whether it can be missed. Every guide is written in our own words and names its sources.'));
    empty.append(el('p', null, 'Story trophies stay hidden while the spoiler setting is on. Turn it off in the toolbar or in Settings to see their names before you earn them.'));
    detailEl.append(empty);
    return;
  }

  const card = el('div', 'detail-card');
  const hidden = isSpoilerHidden(trophy, state);
  card.append(el('h3', null, hidden ? 'Hidden story trophy' : trophy.name));
  const tags = el('div', 'trophy-tags');
  tags.append(gradeBadge(trophy.grade));
  tags.append(kindTag(trophy.kind));
  if (trophy.missable) tags.append(missableTag());
  card.append(tags);
  card.append(el('p', 'official-desc', hidden
    ? '“The name and description of this story trophy are hidden until you earn it.”'
    : `“${trophy.description}” — the official description, as PlayStation publishes it.`));

  if (typeof trophy.target === 'number') {
    const line = el('p', 'target-line');
    line.append(el('span', null, `PSN tracks this one: ${progressOf(state, trophy)} / ${trophy.target} ${trophy.targetUnit || ''}`));
    card.append(line);
  }

  if (trophy.missable && trophy.missableNote) {
    const warn = el('p', 'missable-note');
    warn.append(el('strong', null, 'Missable — watch out: '));
    warn.append(document.createTextNode(trophy.missableNote));
    card.append(warn);
  }

  card.append(el('h4', null, 'How to earn it'));
  card.append(el('p', 'guide-text', trophy.guide));

  if (trophy.steps && trophy.steps.length) {
    card.append(el('h4', null, 'Steps'));
    const ol = el('ol');
    for (const s of trophy.steps) ol.append(el('li', null, s));
    card.append(ol);
  }

  card.append(el('h4', null, 'Sources'));
  const srcs = el('p', 'source-list');
  (trophy.sources || []).forEach((s, i) => {
    if (i) srcs.append(document.createTextNode(' · '));
    const href = sourceHref(s);
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = s;
      srcs.append(a);
    } else {
      srcs.append(document.createTextNode(s));
    }
  });
  card.append(srcs);

  card.append(el('h4', null, 'Your note'));
  const note = document.createElement('textarea');
  note.value = noteOf(state, trophy);
  note.placeholder = 'Your own note for this trophy — a spot, a loadout, a reminder…';
  note.setAttribute('aria-label', `Note for ${trophy.name}`);
  note.addEventListener('change', () => { setNote(state, trophy, note.value); });
  card.append(note);

  const earnedRow = el('p', 'target-line');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned(state, trophy);
  box.id = 'detail-earned';
  box.addEventListener('change', () => onEarnedChange(trophy));
  const lab = document.createElement('label');
  lab.htmlFor = 'detail-earned';
  lab.textContent = ' I have earned this trophy';
  earnedRow.append(box, lab);
  card.append(earnedRow);

  detailEl.append(card);
}

export { GRADE_DOT };
