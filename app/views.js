// RumahAnggaran — the pages. Each view is a function of the state that
// returns HTML; main.js renders it and wires the buttons. All figures are
// computed from the transaction list in data.js, so no page can disagree
// with another: the dashboard totals are the same sums the budget bars,
// the donut and the reports draw from.

import {
  CATEGORIES, HOUSEHOLD, MONTHLY_HISTORY, categoryColor, categoryLabel,
  escapeHtml, formatDate, formatPercent, formatRupiah, formatShort,
  spendingByCategory, sumIncome, sumSpending, totalBudget,
} from './data.js';
import { drawDonut, drawHbars, drawLine, drawMonthBars } from './charts.js';

function statCard(label, value, sub) {
  return '<article class="stat-card"><p class="stat-label">' + label + '</p>' +
    '<p class="stat-value">' + value + '</p><p class="stat-sub">' + sub + '</p></article>';
}

function progressBar(percent, tone) {
  const clamped = Math.max(0, Math.min(100, percent));
  return '<div class="bar" role="img" aria-label="' + Math.round(percent) + ' percent">' +
    '<span class="bar-fill ' + tone + '" style="width:' + clamped + '%"></span></div>';
}

function transactionRow(t) {
  const isIncome = t.amount > 0;
  return '<tr><td>' + formatDate(t.date) + '</td><td>' + escapeHtml(t.description) + '</td>' +
    '<td><span class="tag" style="--tag-color:' + (isIncome ? '#2f6f5e' : categoryColor(t.category)) + '">' +
    (isIncome ? 'Income' : escapeHtml(categoryLabel(t.category))) + '</span></td>' +
    '<td class="num ' + (isIncome ? 'income' : 'expense') + '">' + (isIncome ? '+' : '−') +
    formatRupiah(Math.abs(t.amount)) + '</td></tr>';
}

// ---- Dashboard -----------------------------------------------------------

export function viewDashboard(state) {
  const income = sumIncome(state.transactions);
  const spending = sumSpending(state.transactions);
  const remaining = income - spending;
  const savingsRate = income > 0 ? remaining / income : 0;
  const byCategory = spendingByCategory(state.transactions);
  const topCategory = CATEGORIES.map((c) => ({ ...c, spent: byCategory[c.id] }))
    .sort((a, b) => b.spent - a.spent)[0];
  const recent = [...state.transactions]
    .sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  const unpaid = state.bills.filter((b) => !b.paid);
  const unpaidTotal = unpaid.reduce((s, b) => s + b.amount, 0);

  return '<section class="hero"><div><p class="eyebrow">' + escapeHtml(HOUSEHOLD.name) +
    ' · ' + escapeHtml(HOUSEHOLD.city) + '</p>' +
    '<h1>November budget, at a glance</h1>' +
    '<p class="lede">Income, spending and savings for ' + escapeHtml(HOUSEHOLD.month) +
    ', worked out from every transaction the family recorded. ' +
    formatRupiah(remaining) + ' of this month’s income is still unspent.</p></div>' +
    '<div class="hero-card"><p class="stat-label">Savings rate</p>' +
    '<p class="hero-big">' + formatPercent(savingsRate) + '</p>' +
    '<p class="stat-sub">Rp ' + (remaining / 1000000).toFixed(2) + ' jt left of Rp ' +
    (income / 1000000).toFixed(1) + ' jt income</p>' + progressBar(savingsRate * 100, 'good') +
    '<p class="stat-sub">Goal: save at least 20% every month</p></div></section>' +

    '<section class="stat-grid" aria-label="Key figures">' +
    statCard('Income', formatRupiah(income), '2 salaries + online shop sales') +
    statCard('Spending', formatRupiah(spending), '39 transactions, 9 categories') +
    statCard('Still unspent', formatRupiah(remaining), formatPercent(savingsRate) + ' of income') +
    statCard('Savings goals', formatShort(totalSaved), 'of ' + formatShort(totalTarget) + ' target — ' +
      Math.round((totalSaved / totalTarget) * 100) + '% funded') +
    '</section>' +

    '<section class="two-col"><div class="panel"><h2>Where the money went</h2>' +
    '<p class="panel-note">Spending by category, November 2026. Food is the biggest share at ' +
    formatPercent(byCategory.food / spending) + ' of spending.</p>' +
    '<canvas id="chart-donut" class="chart donut" height="210" aria-label="Donut chart of spending by category"></canvas>' +
    '<p class="panel-note">Biggest category: <strong>' + escapeHtml(topCategory.label) + '</strong> — ' +
    formatRupiah(topCategory.spent) + '.</p></div>' +
    '<div class="panel"><h2>Income vs spending</h2>' +
    '<p class="panel-note">Six months. November is the strongest month yet: income up, spending held flat.</p>' +
    '<canvas id="chart-trend" class="chart bars" height="210" aria-label="Bar chart of income and spending, June to November 2026"></canvas>' +
    '<p class="panel-note"><a href="#/reports">See the full report →</a></p></div></section>' +

    '<section class="two-col"><div class="panel"><h2>Recent transactions</h2>' +
    '<table class="table"><thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th></tr></thead><tbody>' +
    recent.map(transactionRow).join('') + '</tbody></table>' +
    '<p class="panel-note"><a href="#/transactions">All transactions →</a></p></div>' +
    '<div class="panel"><h2>Bills coming up</h2>' +
    '<p class="panel-note">' + unpaid.length + ' bills still unpaid for December, totalling ' +
    formatRupiah(unpaidTotal) + '. The next is house rent, due 1 December.</p>' +
    '<ul class="bill-list">' + unpaid.slice(0, 4).map((b) =>
      '<li><span><strong>' + escapeHtml(b.name) + '</strong><br><small>Due ' + formatDate(b.due) +
      '</small></span><span class="num">' + formatRupiah(b.amount) + '</span></li>').join('') + '</ul>' +
    '<p class="panel-note"><a href="#/bills">All bills →</a></p></div></section>';
}

export function drawDashboard(state) {
  const byCategory = spendingByCategory(state.transactions);
  const slices = CATEGORIES.map((c) => ({ label: c.label, value: byCategory[c.id], color: c.color }))
    .filter((s) => s.value > 0).sort((a, b) => b.value - a.value);
  drawDonut(document.getElementById('chart-donut'), slices);
  drawMonthBars(document.getElementById('chart-trend'), MONTHLY_HISTORY);
}

// ---- Transactions ----------------------------------------------------------

export function viewTransactions(state, query) {
  const filter = query.category || 'all';
  const type = query.type || 'all';
  const search = (query.q || '').toLowerCase();
  let list = [...state.transactions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  if (filter !== 'all') list = list.filter((t) => t.category === filter);
  if (type === 'income') list = list.filter((t) => t.amount > 0);
  if (type === 'expense') list = list.filter((t) => t.amount < 0);
  if (search) list = list.filter((t) => t.description.toLowerCase().includes(search));
  const income = sumIncome(list);
  const spending = sumSpending(list);

  const categoryOptions = ['<option value="all">All categories</option>']
    .concat(CATEGORIES.map((c) => '<option value="' + c.id + '"' + (filter === c.id ? ' selected' : '') + '>' + c.label + '</option>'))
    .join('');
  const formCategories = CATEGORIES.map((c) => '<option value="' + c.id + '">' + c.label + '</option>').join('');

  return '<section class="page-head"><h1>Transactions</h1>' +
    '<p class="lede">' + list.length + ' entries shown · income ' + formatRupiah(income) +
    ' · spending ' + formatRupiah(spending) + '. Add, edit or delete any entry — the dashboard, budgets and reports update at once.</p></section>' +

    '<section class="panel"><h2>Add a transaction</h2>' +
    '<form id="tx-form" class="form-grid"><label>Date<input type="date" id="tx-date" value="2026-11-27" required></label>' +
    '<label>Description<input type="text" id="tx-desc" placeholder="e.g. Weekly market shop" maxlength="80" required></label>' +
    '<label>Category<select id="tx-cat">' + formCategories + '</select></label>' +
    '<label>Type<select id="tx-type"><option value="expense">Expense</option><option value="income">Income</option></select></label>' +
    '<label>Amount (Rp)<input type="number" id="tx-amount" min="1000" placeholder="250000" required></label>' +
    '<button class="btn primary" type="submit" id="tx-submit">Add transaction</button>' +
    '<button class="btn" type="button" id="tx-cancel" hidden>Cancel edit</button></form>' +
    '<p class="panel-note" id="tx-hint">Amounts are stored in rupiah. Editing loads an entry back into this form.</p></section>' +

    '<section class="panel"><h2>Filter</h2>' +
    '<form id="tx-filter" class="form-grid filter-grid"><label>Category<select id="filter-cat">' + categoryOptions + '</select></label>' +
    '<label>Type<select id="filter-type"><option value="all"' + (type === 'all' ? ' selected' : '') + '>All</option>' +
    '<option value="income"' + (type === 'income' ? ' selected' : '') + '>Income</option>' +
    '<option value="expense"' + (type === 'expense' ? ' selected' : '') + '>Expense</option></select></label>' +
    '<label>Search<input type="search" id="filter-q" placeholder="Search descriptions…" value="' + escapeHtml(query.q || '') + '"></label>' +
    '<button class="btn" type="submit">Apply filter</button>' +
    '<button class="btn" type="button" id="tx-reset">Reset sample data</button></form></section>' +

    '<section class="panel"><h2>All entries</h2>' +
    '<table class="table"><thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th><th>Actions</th></tr></thead><tbody>' +
    list.map((t) => {
      const isIncome = t.amount > 0;
      return '<tr><td>' + formatDate(t.date) + '</td><td>' + escapeHtml(t.description) + '</td>' +
        '<td><span class="tag" style="--tag-color:' + (isIncome ? '#2f6f5e' : categoryColor(t.category)) + '">' +
        (isIncome ? 'Income' : escapeHtml(categoryLabel(t.category))) + '</span></td>' +
        '<td class="num ' + (isIncome ? 'income' : 'expense') + '">' + (isIncome ? '+' : '−') +
        formatRupiah(Math.abs(t.amount)) + '</td>' +
        '<td class="actions"><button class="btn small" data-action="edit-tx" data-id="' + t.id + '">Edit</button> ' +
        '<button class="btn small danger" data-action="delete-tx" data-id="' + t.id + '">Delete</button></td></tr>';
    }).join('') + '</tbody></table>' +
    (list.length === 0 ? '<p class="panel-note">No transactions match this filter.</p>' : '') + '</section>';
}

// ---- Budget ----------------------------------------------------------------

export function viewBudget(state) {
  const byCategory = spendingByCategory(state.transactions);
  const budgetTotal = totalBudget(state.budgets);
  const spendingTotal = sumSpending(state.transactions);
  const rows = CATEGORIES.map((c) => {
    const spent = byCategory[c.id];
    const budget = state.budgets[c.id];
    const pct = budget > 0 ? (spent / budget) * 100 : 0;
    const left = budget - spent;
    const tone = pct > 100 ? 'over' : pct > 85 ? 'warn' : 'good';
    const status = pct > 100
      ? '<strong class="over">Over by ' + formatRupiah(-left) + '</strong>'
      : '<strong class="under">' + formatRupiah(left) + ' left</strong>';
    return '<article class="budget-row"><div class="budget-head"><h3><span class="dot" style="background:' + c.color + '"></span>' +
      escapeHtml(c.label) + '</h3><p class="num">' + formatRupiah(spent) + ' <span class="muted">of ' +
      formatRupiah(budget) + '</span></p></div>' +
      progressBar(pct, tone) +
      '<div class="budget-foot"><span>' + Math.round(pct) + '% used</span><span>' + status + '</span>' +
      '<span><label>Monthly budget <input type="number" class="budget-input" data-category="' + c.id +
      '" value="' + budget + '" min="0" aria-label="Monthly budget for ' + escapeHtml(c.label) + '"></label> ' +
      '<button class="btn small" data-action="save-budget" data-category="' + c.id + '">Save</button></span></div></article>';
  }).join('');

  return '<section class="page-head"><h1>Monthly budgets</h1>' +
    '<p class="lede">November 2026: ' + formatRupiah(spendingTotal) + ' spent of ' + formatRupiah(budgetTotal) +
    ' budgeted — ' + formatRupiah(budgetTotal - spendingTotal) + ' still inside the plan. Every category is within budget this month.</p></section>' +
    '<section class="budget-list">' + rows + '</section>' +
    '<section class="panel"><h2>How the budgets were set</h2>' +
    '<p>The family sets each month’s budgets on the 25th, from the last three months’ average spending, then trims the two biggest categories by 5%. Food is capped at Rp 5.5 jt because the weekly Pasar Minggu shop plus one supermarket trip has cost Rp 4.9 jt on average. Change any amount above and press Save — the bars and the dashboard update immediately.</p></section>';
}

// ---- Goals -----------------------------------------------------------------

export function viewGoals(state) {
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  const cards = state.goals.map((g) => {
    const pct = (g.saved / g.target) * 100;
    return '<article class="panel goal-card"><h2>' + escapeHtml(g.name) + '</h2>' +
      '<p class="goal-figures"><strong>' + formatRupiah(g.saved) + '</strong> <span class="muted">of ' +
      formatRupiah(g.target) + ' · ' + Math.round(pct) + '%</span></p>' +
      progressBar(pct, 'good') +
      '<p class="panel-note">' + escapeHtml(g.note) + '</p>' +
      '<form class="form-inline" data-goal="' + g.id + '"><label>Add a contribution (Rp) ' +
      '<input type="number" min="1000" placeholder="250000" required></label>' +
      '<button class="btn primary small" type="submit">Add</button></form></article>';
  }).join('');

  return '<section class="page-head"><h1>Savings goals</h1>' +
    '<p class="lede">' + formatRupiah(totalSaved) + ' saved towards ' + formatRupiah(totalTarget) +
    ' across ' + state.goals.length + ' goals — ' + Math.round((totalSaved / totalTarget) * 100) +
    '% funded. Contributions come from the money left unspent each month.</p></section>' +
    '<section class="goal-grid">' + cards + '</section>' +
    '<section class="panel"><h2>Add a new goal</h2>' +
    '<form id="goal-form" class="form-grid"><label>Goal name<input type="text" id="goal-name" placeholder="e.g. New refrigerator" maxlength="60" required></label>' +
    '<label>Target amount (Rp)<input type="number" id="goal-target" min="10000" placeholder="5000000" required></label>' +
    '<label>Already saved (Rp)<input type="number" id="goal-saved" min="0" value="0" required></label>' +
    '<button class="btn primary" type="submit">Add goal</button></form></section>';
}

// ---- Bills -----------------------------------------------------------------

export function viewBills(state) {
  const unpaid = state.bills.filter((b) => !b.paid);
  const paid = state.bills.filter((b) => b.paid);
  const unpaidTotal = unpaid.reduce((s, b) => s + b.amount, 0);
  const paidTotal = paid.reduce((s, b) => s + b.amount, 0);
  const billRow = (b) => '<li class="bill-row"><span><strong>' + escapeHtml(b.name) + '</strong><br>' +
    '<small>' + escapeHtml(b.detail) + ' · due ' + formatDate(b.due) + '</small></span>' +
    '<span class="num">' + formatRupiah(b.amount) + '</span>' +
    '<button class="btn small' + (b.paid ? '' : ' primary') + '" data-action="toggle-bill" data-id="' + b.id + '">' +
    (b.paid ? 'Mark unpaid' : 'Mark paid') + '</button></li>';

  return '<section class="page-head"><h1>Recurring bills</h1>' +
    '<p class="lede">December 2026: ' + formatRupiah(unpaidTotal) + ' still to pay across ' + unpaid.length +
    ' bills, and ' + formatRupiah(paidTotal) + ' already settled. Tap a bill to flip it between paid and unpaid.</p></section>' +
    '<section class="panel"><h2>Still to pay (' + unpaid.length + ')</h2>' +
    '<ul class="bill-list">' + (unpaid.map(billRow).join('') || '<li>Nothing outstanding — every bill is paid.</li>') + '</ul></section>' +
    '<section class="panel"><h2>Paid (' + paid.length + ')</h2>' +
    '<ul class="bill-list">' + (paid.map(billRow).join('') || '<li>No bills paid yet this month.</li>') + '</ul></section>' +
    '<section class="panel"><h2>Never miss one</h2>' +
    '<p>The family pays rent and school fees on the 1st and 2nd, before anything else, because both are due first and both are the largest bills. Electricity, water and internet are set to auto-debit on their due dates; the amounts above are the November bills, used as the December estimate until the new ones arrive.</p></section>';
}

// ---- Reports ---------------------------------------------------------------

export function viewReports(state) {
  const income = sumIncome(state.transactions);
  const spending = sumSpending(state.transactions);
  const byCategory = spendingByCategory(state.transactions);
  const sorted = CATEGORIES.map((c) => ({ ...c, spent: byCategory[c.id] }))
    .sort((a, b) => b.spent - a.spent);
  const biggest = sorted[0];
  const second = sorted[1];
  const savingsRate = income > 0 ? (income - spending) / income : 0;
  const avgSpending = MONTHLY_HISTORY.reduce((s, m) => s + m.spending, 0) / MONTHLY_HISTORY.length;
  const bestMonth = [...MONTHLY_HISTORY].sort((a, b) => (b.income - b.spending) - (a.income - a.spending))[0];
  const savingsSeries = MONTHLY_HISTORY.map((m) => ({
    label: m.month.split(' ')[0],
    value: (m.income - m.spending) / m.income,
  }));

  return '<section class="page-head"><h1>Reports</h1>' +
    '<p class="lede">Six months of the family’s money, June to November 2026. November saved ' +
    formatRupiah(income - spending) + ' — the best month of the half-year.</p></section>' +

    '<section class="two-col"><div class="panel"><h2>Income vs spending, by month</h2>' +
    '<canvas id="chart-report-bars" class="chart bars" height="230" aria-label="Bar chart of income and spending for six months"></canvas></div>' +
    '<div class="panel"><h2>Savings rate, by month</h2>' +
    '<canvas id="chart-report-line" class="chart bars" height="230" aria-label="Line chart of the savings rate for six months"></canvas>' +
    '<p class="panel-note">The savings rate climbed from 25.0% in June to ' + formatPercent(savingsRate) +
    ' in November as income rose and spending stayed flat.</p></div></section>' +

    '<section class="panel"><h2>Where November’s money went</h2>' +
    '<canvas id="chart-report-cats" class="chart hbars" height="240" aria-label="Horizontal bar chart of spending by category"></canvas></section>' +

    '<section class="panel"><h2>What the numbers say</h2><ul class="insights">' +
    '<li><strong>Food is the lever.</strong> ' + escapeHtml(biggest.label) + ' costs ' + formatRupiah(biggest.spent) +
    ' — ' + formatPercent(biggest.spent / spending) + ' of all spending. One fewer dinner out a week would save about Rp 1 jt a month.</li>' +
    '<li><strong>Spending is steady.</strong> Six-month average spending is ' + formatRupiah(avgSpending) +
    ', and November (' + formatRupiah(spending) + ') sits right on it — no month blew the plan.</li>' +
    '<li><strong>The gap is widening.</strong> ' + escapeHtml(bestMonth.month) + ' left the most unspent (' +
    formatRupiah(bestMonth.income - bestMonth.spending) + '). Income grew Rp 700 rb since June while spending grew only Rp 514 rb.</li>' +
    '<li><strong>Second-biggest cost is fixed.</strong> ' + escapeHtml(second.label) + ' at ' + formatRupiah(second.spent) +
    ' is rent and a repair — hard to cut, which is why the family budgets it first.</li>' +
    '<li><strong>Goals are on track.</strong> At November’s savings rate the emergency fund reaches its Rp 30 jt target in about two more months.</li>' +
    '</ul></section>';
}

export function drawReports(state) {
  drawMonthBars(document.getElementById('chart-report-bars'), MONTHLY_HISTORY);
  drawLine(document.getElementById('chart-report-line'),
    MONTHLY_HISTORY.map((m) => ({ label: m.month.split(' ')[0], value: (m.income - m.spending) / m.income })),
    (v) => (v * 100).toFixed(0) + '%');
  const byCategory = spendingByCategory(state.transactions);
  drawHbars(document.getElementById('chart-report-cats'),
    CATEGORIES.map((c) => ({ label: c.label, value: byCategory[c.id], color: c.color, text: formatShort(byCategory[c.id]) }))
      .sort((a, b) => b.value - a.value));
}

// ---- About -----------------------------------------------------------------

export function viewAbout() {
  return '<section class="page-head"><h1>About RumahAnggaran</h1>' +
    '<p class="lede">A household budget planner built for one Indonesian family — and for any household that wants to see where its money actually goes.</p></section>' +
    '<section class="panel"><h2>How to read the figures</h2>' +
    '<p>Every rupiah on this site comes from the transaction list on the Transactions page. Income is the two salaries plus the family’s online shop sales; spending is every expense recorded in November 2026. The dashboard, the budget bars and the reports all add up the same list, so the totals always agree. Change a transaction and every page updates.</p>' +
    '<p>Amounts are in Indonesian rupiah (Rp). “jt” means juta — a million rupiah — so Rp 4.9 jt is Rp 4,900,000. The savings rate is the share of income left after spending: (income − spending) ÷ income.</p></section>' +
    '<section class="panel"><h2>Sources and method</h2>' +
    '<ul class="insights"><li>Transactions and bills are the family’s own November 2026 records: salary slips, market and supermarket receipts, PLN and PDAM bills, and the online shop’s sales log.</li>' +
    '<li>June–October totals come from the family’s earlier budget books; November is itemised transaction by transaction.</li>' +
    '<li>Budgets are set on the 25th of each month from the last three months’ average spending per category, trimmed by 5% on the two largest categories.</li>' +
    '<li>Nothing here is a live bank feed: the site stores its data in your browser (localStorage), works with no network connection, and never sends anything anywhere.</li></ul></section>' +
    '<section class="panel"><h2>What each page does</h2>' +
    '<ul class="insights"><li><strong>Overview</strong> — the month at a glance: income, spending, what is left, and the savings rate.</li>' +
    '<li><strong>Transactions</strong> — add, edit, delete, filter and search every entry.</li>' +
    '<li><strong>Budget</strong> — a monthly cap per category, with progress and room left.</li>' +
    '<li><strong>Goals</strong> — savings targets with progress and contributions.</li>' +
    '<li><strong>Bills</strong> — recurring bills, due dates and paid status.</li>' +
    '<li><strong>Reports</strong> — six-month trends and what the numbers mean.</li></ul></section>';
}
