// Boot + routing: loads the trophy list, wires the toolbar and the tabs,
// and switches views by hash. Routes: #/checklist, #/roadmap, #/missables,
// #/next, #/settings, and #/trophy/<id> (checklist with a guide open).
// Open with ?demo=1 to seed 13 earned trophies for screenshots.

import { loadTrophies, byId } from './data.js';
import {
  loadStore, saveStore, toggleEarned, setProgress, progressOf,
  earnedCount, exportText, importText, seedDemo,
} from './store.js';
import { blankFilters, applyFilters } from './filters.js';
import { renderChecklist, renderDetail } from './views.js';
import { renderRoadmap, renderMissables, renderNextUp, renderSettings } from './pages.js';

const $ = (id) => document.getElementById(id);

let trophies = [];
let state = loadStore();
let filters = blankFilters();
let selectedId = null;

const params = new URLSearchParams(location.search);
if (params.get('demo') === '1') state = seedDemo(state);

function updateHeader() {
  const n = earnedCount(state);
  $('earned-count').textContent = String(n);
  $('progress-fill').style.width = `${Math.round((n / 55) * 100)}%`;
  $('progress-pct').textContent = `${Math.round((n / 55) * 100)}% to the platinum`;
}

function showRoute(route) {
  for (const name of ['checklist', 'roadmap', 'missables', 'next', 'settings']) {
    $(`view-${name}`).hidden = route !== name;
  }
  for (const a of document.querySelectorAll('.tabs a')) {
    a.classList.toggle('active', a.dataset.route === route);
  }
}

function renderAll() {
  updateHeader();
  const visible = applyFilters(trophies, filters, state);
  renderChecklist($('trophy-list'), $('list-meta'), $('empty-note'), visible, state, filters, selectedId, {
    select: (t) => { location.hash = `#/trophy/${t.id}`; },
    toggle: (t, delta) => {
      if (typeof delta === 'number') {
        setProgress(state, t, progressOf(state, t) + delta);
      } else {
        toggleEarned(state, t);
      }
      renderAll();
    },
  });
  renderDetail($('detail-col'), selectedId ? byId(trophies, selectedId) : null, state, () => {
    renderAll();
  });
}

function openTrophy(trophy) {
  location.hash = `#/trophy/${trophy.id}`;
  document.getElementById('view-checklist').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function route() {
  const hash = location.hash || '#/checklist';
  updateHeader();
  const trophyMatch = hash.match(/^#\/trophy\/(\d+)$/);
  if (trophyMatch) {
    selectedId = Number(trophyMatch[1]);
    showRoute('checklist');
    renderAll();
    return;
  }
  const name = hash.replace(/^#\//, '');
  selectedId = null;
  const known = ['checklist', 'roadmap', 'missables', 'next', 'settings'];
  const routeName = known.includes(name) ? name : 'checklist';
  showRoute(routeName);
  if (routeName === 'checklist') renderAll();
  if (routeName === 'roadmap') renderRoadmap($('roadmap-body'), trophies, state, openTrophy);
  if (routeName === 'missables') renderMissables($('missables-body'), trophies, state, openTrophy);
  if (routeName === 'next') renderNextUp($('next-body'), trophies, state, openTrophy);
  if (routeName === 'settings') {
    renderSettings($('settings-body'), state, (next) => { state = next; saveStore(state); syncToolbar(); route(); }, (v) => {
      state.spoilers = v;
      saveStore(state);
      syncToolbar();
      route();
    });
  }
}

function syncToolbar() {
  $('search').value = filters.q;
  $('kind').value = filters.kind;
  $('grade').value = filters.grade;
  $('missable-only').checked = filters.missableOnly;
  $('hide-earned').checked = filters.hideEarned;
  $('spoilers').checked = state.spoilers;
}

function wireToolbar() {
  $('search').addEventListener('input', (e) => { filters.q = e.target.value; renderAll(); });
  $('kind').addEventListener('change', (e) => { filters.kind = e.target.value; renderAll(); });
  $('grade').addEventListener('change', (e) => { filters.grade = e.target.value; renderAll(); });
  $('missable-only').addEventListener('change', (e) => { filters.missableOnly = e.target.checked; renderAll(); });
  $('hide-earned').addEventListener('change', (e) => { filters.hideEarned = e.target.checked; renderAll(); });
  $('spoilers').addEventListener('change', (e) => {
    state.spoilers = e.target.checked;
    saveStore(state);
    renderAll();
  });
  $('export').addEventListener('click', () => {
    const blob = new Blob([exportText(state)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gta6-trophy-progress.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $('import').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const next = importText(await file.text());
    if (next) {
      state = next;
      saveStore(state);
      syncToolbar();
      renderAll();
    } else {
      alert('That file is not a Leonida Platinum export.');
    }
    e.target.value = '';
  });
}

async function boot() {
  trophies = await loadTrophies();
  wireToolbar();
  syncToolbar();
  window.addEventListener('hashchange', route);
  route();
}

boot().catch((err) => {
  document.getElementById('list-meta').textContent = `Could not load the trophy list: ${err.message}`;
});
