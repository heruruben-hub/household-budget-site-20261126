// RumahAnggaran — router and event wiring. One page, hash routes:
// #/ (dashboard), #/transactions, #/budget, #/goals, #/bills,
// #/reports, #/about. State lives in data.js and localStorage; every
// change saves the state and re-renders the current view.

import { loadState, resetState, saveState } from './data.js';
import {
  drawDashboard, drawReports, viewAbout, viewBills, viewBudget,
  viewDashboard, viewGoals, viewReports, viewTransactions,
} from './views.js';

const NAV = [
  ['#/', 'Overview'],
  ['#/transactions', 'Transactions'],
  ['#/budget', 'Budget'],
  ['#/goals', 'Goals'],
  ['#/bills', 'Bills'],
  ['#/reports', 'Reports'],
  ['#/about', 'About'],
];

let state = loadState();
let editingId = null;

function parseHash() {
  const hash = location.hash || '#/';
  const [path, queryString] = hash.slice(1).split('?');
  const query = {};
  if (queryString) {
    for (const pair of queryString.split('&')) {
      const [key, value] = pair.split('=');
      if (key) query[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  }
  return { path: path || '/', query };
}

function render() {
  const { path, query } = parseHash();
  const main = document.getElementById('view');
  let html = '';
  let draw = null;
  if (path === '/') { html = viewDashboard(state); draw = drawDashboard; }
  else if (path === '/transactions') { html = viewTransactions(state, query); }
  else if (path === '/budget') { html = viewBudget(state); }
  else if (path === '/goals') { html = viewGoals(state); }
  else if (path === '/bills') { html = viewBills(state); }
  else if (path === '/reports') { html = viewReports(state); draw = drawReports; }
  else if (path === '/about') { html = viewAbout(); }
  else { html = viewDashboard(state); draw = drawDashboard; }
  main.innerHTML = html;
  document.querySelectorAll('nav a').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + path);
  });
  if (draw) draw(state);
  wireTransactions();
  wireGoals();
  window.scrollTo(0, 0);
}

function rerender() {
  saveState(state);
  render();
}

function nextId() {
  let n = state.transactions.length + 1;
  let id = 'u' + String(n).padStart(2, '0');
  while (state.transactions.some((t) => t.id === id)) {
    n += 1;
    id = 'u' + String(n).padStart(2, '0');
  }
  return id;
}

function wireTransactions() {
  const form = document.getElementById('tx-form');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const date = document.getElementById('tx-date').value;
    const description = document.getElementById('tx-desc').value.trim();
    const category = document.getElementById('tx-cat').value;
    const type = document.getElementById('tx-type').value;
    const amount = Math.round(Number(document.getElementById('tx-amount').value));
    if (!date || !description || !amount || amount <= 0) return;
    const signed = type === 'income' ? amount : -amount;
    if (editingId) {
      const tx = state.transactions.find((t) => t.id === editingId);
      if (tx) {
        tx.date = date;
        tx.description = description;
        tx.category = type === 'income' ? 'income' : category;
        tx.amount = signed;
      }
      editingId = null;
      document.getElementById('tx-submit').textContent = 'Add transaction';
      document.getElementById('tx-cancel').hidden = true;
    } else {
      state.transactions.push({
        id: nextId(), date, description,
        category: type === 'income' ? 'income' : category, amount: signed,
      });
    }
    document.getElementById('tx-hint').textContent = 'Saved. The dashboard, budgets and reports now include it.';
    rerender();
  });
  document.getElementById('tx-cancel').addEventListener('click', () => {
    editingId = null;
    form.reset();
    document.getElementById('tx-submit').textContent = 'Add transaction';
    document.getElementById('tx-cancel').hidden = true;
    document.getElementById('tx-hint').textContent = 'Amounts are stored in rupiah. Editing loads an entry back into this form.';
  });
  const filter = document.getElementById('tx-filter');
  filter.addEventListener('submit', (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const cat = document.getElementById('filter-cat').value;
    const type = document.getElementById('filter-type').value;
    const q = document.getElementById('filter-q').value.trim();
    if (cat !== 'all') params.set('category', cat);
    if (type !== 'all') params.set('type', type);
    if (q) params.set('q', q);
    const suffix = params.toString() ? '?' + params.toString() : '';
    location.hash = '#/transactions' + suffix;
  });
  document.getElementById('tx-reset').addEventListener('click', () => {
    state = resetState();
    editingId = null;
    rerender();
  });
}

function wireGoals() {
  document.querySelectorAll('form[data-goal]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const amount = Math.round(Number(form.querySelector('input').value));
      if (!amount || amount <= 0) return;
      const goal = state.goals.find((g) => g.id === form.dataset.goal);
      if (goal) goal.saved += amount;
      rerender();
    });
  });
  const form = document.getElementById('goal-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = document.getElementById('goal-name').value.trim();
      const target = Math.round(Number(document.getElementById('goal-target').value));
      const saved = Math.round(Number(document.getElementById('goal-saved').value));
      if (!name || !target || target <= 0 || saved < 0) return;
      state.goals.push({
        id: 'goal-' + Date.now(), name, target, saved,
        note: 'Added by the family.',
      });
      rerender();
    });
  }
}

function wireGlobalClicks(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'delete-tx') {
    state.transactions = state.transactions.filter((t) => t.id !== button.dataset.id);
    if (editingId === button.dataset.id) editingId = null;
    rerender();
  } else if (action === 'edit-tx') {
    const tx = state.transactions.find((t) => t.id === button.dataset.id);
    if (!tx) return;
    editingId = tx.id;
    document.getElementById('tx-date').value = tx.date;
    document.getElementById('tx-desc').value = tx.description;
    document.getElementById('tx-cat').value = tx.category === 'income' ? 'food' : tx.category;
    document.getElementById('tx-type').value = tx.amount > 0 ? 'income' : 'expense';
    document.getElementById('tx-amount').value = Math.abs(tx.amount);
    document.getElementById('tx-submit').textContent = 'Save changes';
    document.getElementById('tx-cancel').hidden = false;
    document.getElementById('tx-hint').textContent = 'Editing “' + tx.description + '” — press Save changes when done.';
    document.getElementById('tx-form').scrollIntoView({ behavior: 'smooth' });
  } else if (action === 'save-budget') {
    const input = document.querySelector('.budget-input[data-category="' + button.dataset.category + '"]');
    const value = Math.round(Number(input.value));
    if (Number.isFinite(value) && value >= 0) {
      state.budgets[button.dataset.category] = value;
      rerender();
    }
  } else if (action === 'toggle-bill') {
    const bill = state.bills.find((b) => b.id === button.dataset.id);
    if (bill) bill.paid = !bill.paid;
    rerender();
  }
}

document.addEventListener('click', wireGlobalClicks);
window.addEventListener('hashchange', () => {
  editingId = null;
  render();
});

// First paint.
render();
