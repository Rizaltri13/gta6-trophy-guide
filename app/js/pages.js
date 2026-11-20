// The guide's pages: the roadmap to the platinum, the missables list, the
// Next-up planner, and Settings. Each is built from the trophy data, so the
// counts on screen always match the list.

import { KIND_LABELS, STAGES, GRADE_ORDER } from './data.js';
import { isEarned, progressOf, earnedCount, exportText, importText, resetStore } from './store.js';

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

const GRADE_DOT = { platinum: '#5f7d95', gold: '#b98a1d', silver: '#7d8894', bronze: '#a86a3c' };

function miniRow(trophy, state, onOpen) {
  const row = el('div', 'mini-row');
  if (isEarned(state, trophy)) row.classList.add('done');
  row.append(el('span', 'dot'));
  row.lastChild.style.background = GRADE_DOT[trophy.grade] || '#888';
  row.append(el('span', 'mini-name', trophy.name));
  if (typeof trophy.target === 'number') {
    row.append(el('span', 'mini-kind', `${progressOf(state, trophy)}/${trophy.target}`));
  } else {
    row.append(el('span', 'mini-kind', KIND_LABELS[trophy.kind] || trophy.kind));
  }
  if (trophy.missable) row.append(el('span', 'tag missable', 'Missable'));
  row.style.cursor = 'pointer';
  row.addEventListener('click', () => onOpen(trophy));
  return row;
}

export function renderRoadmap(bodyEl, trophies, state, onOpen) {
  bodyEl.replaceChildren();
  for (const stage of STAGES) {
    const members = trophies.filter((t) => t.roadmapStage === stage.n)
      .sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id);
    const done = members.filter((t) => isEarned(state, t)).length;
    const section = el('section', 'stage');
    const head = el('div', 'stage-head');
    head.append(el('h3', null, stage.title));
    head.append(el('span', 'stage-count', `${done} of ${members.length} earned`));
    section.append(head);
    section.append(el('p', null, stage.blurb));
    const list = el('div', 'trophy-list');
    for (const t of members) list.append(miniRow(t, state, onOpen));
    section.append(list);
    bodyEl.append(section);
  }
  const foot = el('p', 'section-intro', 'Work the stages in order. The platinum pops the moment the last of the 54 others is earned — there is no separate final step.');
  bodyEl.append(foot);
}

export function renderMissables(bodyEl, trophies, state, onOpen) {
  bodyEl.replaceChildren();
  const flagged = trophies.filter((t) => t.missable);
  const done = flagged.filter((t) => isEarned(state, t)).length;
  const head = el('p', 'section-intro', `${flagged.length} trophies flagged · ${done} earned. These are the ones to do early, before the story moves past them.`);
  bodyEl.append(head);
  const list = el('div', 'trophy-list');
  for (const t of flagged) {
    const card = el('div', 'detail-card');
    const title = el('h3', null, t.name);
    card.append(title);
    const tags = el('div', 'trophy-tags');
    tags.append(el('span', `badge ${t.grade}`, t.grade));
    tags.append(el('span', 'tag', KIND_LABELS[t.kind] || t.kind));
    card.append(tags);
    card.append(el('p', 'official-desc', `“${t.description}”`));
    const warn = el('p', 'missable-note');
    warn.append(el('strong', null, 'Why it can be missed: '));
    warn.append(document.createTextNode(t.missableNote || 'See its guide.'));
    card.append(warn);
    const btn = el('button', null, 'Open its guide');
    btn.type = 'button';
    btn.addEventListener('click', () => onOpen(t));
    card.append(btn);
    list.append(card);
  }
  bodyEl.append(list);
  const note = el('p', 'section-intro', 'Not flagged here: every story chapter and mission trophy. Those unlock on completion, so they cannot be missed — play the story and they come. The full list of 55, with every guide, is on the Checklist tab.');
  bodyEl.append(note);
}

/** Next up: missables and open strands first, then the stage furthest along. */
export function renderNextUp(bodyEl, trophies, state, onOpen) {
  bodyEl.replaceChildren();
  const remaining = trophies.filter((t) => !isEarned(state, t));
  if (remaining.length === 0) {
    bodyEl.append(el('p', 'section-intro', 'That is the platinum — all 55 earned. Vice got its price.'));
    return;
  }
  const picks = [];
  const addPick = (t, reason) => {
    if (t && !picks.some((p) => p.trophy.id === t.id)) picks.push({ trophy: t, reason });
  };
  for (const t of remaining.filter((t) => t.missable)) addPick(t, 'Missable — do it before the story moves on.');
  const stageProgress = STAGES.map((s) => {
    const members = trophies.filter((t) => t.roadmapStage === s.n);
    const done = members.filter((t) => isEarned(state, t)).length;
    return { stage: s, done, total: members.length };
  }).filter((s) => s.done < s.total)
    .sort((a, b) => (b.done / b.total) - (a.done / a.total));
  for (const s of stageProgress.slice(0, 2)) {
    const next = trophies.filter((t) => t.roadmapStage === s.stage.n && !isEarned(state, t))
      .sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade])[0];
    addPick(next, `Stage ${s.stage.n} is ${s.done} of ${s.total} — the closest to finished.`);
  }
  const firstStory = remaining.filter((t) => t.kind === 'story')
    .sort((a, b) => a.id - b.id)[0];
  addPick(firstStory, 'Next story step on the roadmap.');
  const list = el('div', 'next-list');
  for (const { trophy, reason } of picks.slice(0, 5)) {
    const card = el('div', 'detail-card');
    card.append(el('h3', null, trophy.name));
    const tags = el('div', 'trophy-tags');
    tags.append(el('span', `badge ${trophy.grade}`, trophy.grade));
    tags.append(el('span', 'tag', KIND_LABELS[trophy.kind] || trophy.kind));
    if (trophy.missable) tags.append(el('span', 'tag missable', 'Missable'));
    card.append(tags);
    card.append(el('p', 'official-desc', `“${trophy.description}”`));
    card.append(el('p', 'next-reason', reason));
    const btn = el('button', null, 'Open its guide');
    btn.type = 'button';
    btn.addEventListener('click', () => onOpen(trophy));
    card.append(btn);
    list.append(card);
  }
  bodyEl.append(list);
  const total = el('p', 'section-intro', `${earnedCount(state)} of 55 earned · ${remaining.length} to go.`);
  bodyEl.append(total);
}

export function renderSettings(bodyEl, state, onStateChange, onSpoilersChange) {
  bodyEl.replaceChildren();
  const grid = el('div', 'settings-grid');

  const spoilerPanel = el('div', 'panel');
  spoilerPanel.append(el('h3', null, 'Spoilers'));
  const lab = document.createElement('label');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.spoilers;
  box.addEventListener('change', () => onSpoilersChange(box.checked));
  lab.append(box, document.createTextNode(' Hide story trophies until earned'));
  spoilerPanel.append(lab);
  spoilerPanel.append(el('p', 'status-line', 'When on, the names and descriptions of story trophies stay hidden until you tick them off. Side stories, collectibles and activities are always shown.'));
  grid.append(spoilerPanel);

  const savePanel = el('div', 'panel');
  savePanel.append(el('h3', null, 'Your save'));
  savePanel.append(el('p', null, `${earnedCount(state)} of 55 trophies earned. Progress lives in this browser (localStorage) and never leaves it.`));
  const exportBtn = el('button', null, 'Export progress (.json)');
  exportBtn.type = 'button';
  exportBtn.addEventListener('click', () => {
    const blob = new Blob([exportText(state)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gta6-trophy-progress.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  savePanel.append(exportBtn);
  const importLab = el('label', 'import-btn', 'Import progress');
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = 'application/json,.json';
  importInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const next = importText(await file.text());
    if (next) onStateChange(next);
    else alert('That file is not a Leonida Platinum export.');
    e.target.value = '';
  });
  importLab.append(importInput);
  savePanel.append(importLab);
  grid.append(savePanel);

  const dangerPanel = el('div', 'panel danger');
  dangerPanel.append(el('h3', null, 'Start over'));
  dangerPanel.append(el('p', null, 'Clears every tick, counter and note in this browser. Export first if you want to keep a copy.'));
  const resetBtn = el('button', null, 'Reset all progress');
  resetBtn.type = 'button';
  resetBtn.addEventListener('click', () => {
    if (confirm('Clear all 55 trophies, counters and notes?')) onStateChange(resetStore());
  });
  dangerPanel.append(resetBtn);
  grid.append(dangerPanel);

  bodyEl.append(grid);
}
