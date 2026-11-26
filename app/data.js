// RumahAnggaran — household budget data and state.
//
// The sample household is the Prasetyo family of Jakarta: two working
// parents and two school-age children, tracking November 2026. Every
// figure on the site is derived from the transaction list below, so the
// dashboard totals, the charts and the budget bars always agree.
//
// State is kept in localStorage under STORE_KEY. Editing a transaction,
// a budget, a goal or a bill updates the stored state, and every view
// re-derives its numbers from it. "Reset sample data" restores this file.

export const STORE_KEY = 'rumahanggaran-v1';
export const HOUSEHOLD = {
  name: 'Prasetyo Family',
  city: 'Jakarta, Indonesia',
  members: 'Budi & Sari Prasetyo, with two children',
  month: 'November 2026',
  currency: 'IDR',
};

export const CATEGORIES = [
  { id: 'housing', label: 'Housing', color: '#2f6f5e' },
  { id: 'food', label: 'Food & Groceries', color: '#c98a2e' },
  { id: 'transport', label: 'Transport', color: '#3e7cb1' },
  { id: 'utilities', label: 'Utilities', color: '#7a5ea3' },
  { id: 'education', label: 'Education', color: '#c65d4b' },
  { id: 'health', label: 'Health', color: '#4a9e8f' },
  { id: 'entertainment', label: 'Entertainment', color: '#b85c8a' },
  { id: 'clothing', label: 'Clothing', color: '#6b7f59' },
  { id: 'misc', label: 'Miscellaneous', color: '#8a8f98' },
];

export function categoryLabel(id) {
  const found = CATEGORIES.find((c) => c.id === id);
  return found ? found.label : id;
}

export function categoryColor(id) {
  const found = CATEGORIES.find((c) => c.id === id);
  return found ? found.color : '#8a8f98';
}

// Monthly budgets the family set for November 2026 (rupiah).
export const DEFAULT_BUDGETS = {
  housing: 4500000,
  food: 5500000,
  transport: 2200000,
  utilities: 1500000,
  education: 3000000,
  health: 800000,
  entertainment: 1000000,
  clothing: 600000,
  misc: 500000,
};

// Savings goals: what the family is working towards.
export const DEFAULT_GOALS = [
  { id: 'emergency', name: 'Emergency fund', target: 30000000, saved: 18450000, note: 'Six months of essential spending, kept in a separate savings account.' },
  { id: 'holiday', name: 'Family holiday in Bali', target: 12000000, saved: 7200000, note: 'Flights, a family room in Ubud and meals for four, planned for June 2027.' },
  { id: 'motorbike', name: 'New motorcycle', target: 18000000, saved: 4500000, note: 'Replacing the 2016 bike Budi rides to work every day.' },
  { id: 'education-fund', name: "Children's education fund", target: 50000000, saved: 22000000, note: 'Long-term fund for university fees, topped up every payday.' },
];

// Recurring bills for December 2026. Paid ones were settled early.
export const DEFAULT_BILLS = [
  { id: 'rent', name: 'House rent', detail: 'Monthly rent, paid to the landlord', amount: 4200000, due: '2026-12-01', paid: false },
  { id: 'school', name: 'School fees', detail: 'Two children, monthly tuition', amount: 1800000, due: '2026-12-02', paid: false },
  { id: 'pln', name: 'Electricity (PLN)', detail: 'Token and postpaid meter, house', amount: 620000, due: '2026-12-05', paid: false },
  { id: 'pdam', name: 'Water (PDAM)', detail: 'Monthly water bill', amount: 185000, due: '2026-12-06', paid: true },
  { id: 'internet', name: 'Internet (IndiHome)', detail: '50 Mbps home fibre', amount: 315000, due: '2026-12-08', paid: true },
  { id: 'bpjs', name: 'BPJS Kesehatan', detail: 'Health insurance for the family of four', amount: 280000, due: '2026-12-10', paid: false },
  { id: 'mobile', name: 'Mobile data', detail: 'Two phone plans, Budi and Sari', amount: 150000, due: '2026-12-12', paid: false },
  { id: 'streaming', name: 'Streaming subscriptions', detail: 'Video and music for the family', amount: 149000, due: '2026-12-15', paid: false },
];

// November 2026 transactions. Income is positive, spending negative.
// Category totals (spending): housing 4,380,000 · food 4,860,000 ·
// transport 1,710,000 · utilities 1,270,000 · education 2,640,000 ·
// health 560,000 · entertainment 849,000 · clothing 380,000 ·
// misc 285,000 — total spending Rp 16,934,000 against income of
// Rp 22,600,000, leaving Rp 5,666,000 (a 25.1% savings rate).
export const DEFAULT_TRANSACTIONS = [
  { id: 't01', date: '2026-11-01', description: 'Salary — Budi Prasetyo (office)', category: 'income', amount: 12500000 },
  { id: 't02', date: '2026-11-01', description: 'Salary — Sari Prasetyo (teacher)', category: 'income', amount: 7800000 },
  { id: 't03', date: '2026-11-01', description: 'Monthly house rent', category: 'housing', amount: -4200000 },
  { id: 't04', date: '2026-11-02', description: 'School fees — two children', category: 'education', amount: -1800000 },
  { id: 't05', date: '2026-11-02', description: 'Pasar Minggu weekly shop', category: 'food', amount: -620000 },
  { id: 't06', date: '2026-11-03', description: 'Pertalite fuel', category: 'transport', amount: -250000 },
  { id: 't07', date: '2026-11-05', description: 'Online shop sales', category: 'income', amount: 1150000 },
  { id: 't08', date: '2026-11-05', description: 'Electricity (PLN)', category: 'utilities', amount: -620000 },
  { id: 't09', date: '2026-11-06', description: 'Supermarket — Super Indo', category: 'food', amount: -485000 },
  { id: 't10', date: '2026-11-06', description: 'Water (PDAM)', category: 'utilities', amount: -185000 },
  { id: 't11', date: '2026-11-07', description: 'TransJakarta & MRT top-up', category: 'transport', amount: -180000 },
  { id: 't12', date: '2026-11-08', description: 'Family dinner out', category: 'food', amount: -240000 },
  { id: 't13', date: '2026-11-08', description: 'Internet (IndiHome)', category: 'utilities', amount: -315000 },
  { id: 't14', date: '2026-11-09', description: 'Pasar Minggu weekly shop', category: 'food', amount: -590000 },
  { id: 't15', date: '2026-11-09', description: 'Cinema — family outing', category: 'entertainment', amount: -280000 },
  { id: 't16', date: '2026-11-10', description: 'Pertalite fuel', category: 'transport', amount: -250000 },
  { id: 't17', date: '2026-11-10', description: 'Water pump repair', category: 'housing', amount: -180000 },
  { id: 't18', date: '2026-11-11', description: 'English tutoring', category: 'education', amount: -600000 },
  { id: 't19', date: '2026-11-12', description: 'Online shop sales', category: 'income', amount: 850000 },
  { id: 't20', date: '2026-11-12', description: 'Mobile data — two lines', category: 'utilities', amount: -150000 },
  { id: 't21', date: '2026-11-13', description: 'Supermarket — Super Indo', category: 'food', amount: -510000 },
  { id: 't22', date: '2026-11-13', description: 'Household supplies', category: 'misc', amount: -165000 },
  { id: 't23', date: '2026-11-14', description: 'Gojek & Grab rides', category: 'transport', amount: -210000 },
  { id: 't24', date: '2026-11-15', description: 'Pharmacy & vitamins', category: 'health', amount: -210000 },
  { id: 't25', date: '2026-11-16', description: 'Pasar Minggu weekly shop', category: 'food', amount: -640000 },
  { id: 't26', date: '2026-11-16', description: 'Streaming subscriptions', category: 'entertainment', amount: -149000 },
  { id: 't27', date: '2026-11-17', description: 'Pertalite fuel', category: 'transport', amount: -250000 },
  { id: 't28', date: '2026-11-17', description: 'School uniforms', category: 'clothing', amount: -380000 },
  { id: 't29', date: '2026-11-18', description: 'Books & stationery', category: 'education', amount: -240000 },
  { id: 't30', date: '2026-11-19', description: 'Motorcycle service', category: 'transport', amount: -320000 },
  { id: 't31', date: '2026-11-20', description: 'Online shop sales', category: 'income', amount: 300000 },
  { id: 't32', date: '2026-11-20', description: 'Supermarket — Super Indo', category: 'food', amount: -495000 },
  { id: 't33', date: '2026-11-21', description: 'Dental check-up', category: 'health', amount: -350000 },
  { id: 't34', date: '2026-11-22', description: 'Family dinner out', category: 'food', amount: -285000 },
  { id: 't35', date: '2026-11-23', description: 'Pasar Minggu weekly shop', category: 'food', amount: -610000 },
  { id: 't36', date: '2026-11-23', description: 'Weekend outing — Ancol', category: 'entertainment', amount: -420000 },
  { id: 't37', date: '2026-11-24', description: 'Pertalite fuel', category: 'transport', amount: -250000 },
  { id: 't38', date: '2026-11-25', description: 'Rice 25 kg & cooking oil', category: 'food', amount: -385000 },
  { id: 't39', date: '2026-11-26', description: 'Gift for a neighbour', category: 'misc', amount: -120000 },
];

// Past months, for the trend charts on Dashboard and Reports.
// November matches the transaction list exactly; earlier months are the
// family's recorded totals from their previous budget books.
export const MONTHLY_HISTORY = [
  { month: 'Jun 2026', income: 21900000, spending: 16420000 },
  { month: 'Jul 2026', income: 22100000, spending: 17050000 },
  { month: 'Aug 2026', income: 22400000, spending: 16780000 },
  { month: 'Sep 2026', income: 22200000, spending: 17300000 },
  { month: 'Oct 2026', income: 22550000, spending: 16950000 },
  { month: 'Nov 2026', income: 22600000, spending: 16934000 },
];

// ---- state ---------------------------------------------------------------

function freshState() {
  return {
    transactions: DEFAULT_TRANSACTIONS.map((t) => ({ ...t })),
    budgets: { ...DEFAULT_BUDGETS },
    goals: DEFAULT_GOALS.map((g) => ({ ...g })),
    bills: DEFAULT_BILLS.map((b) => ({ ...b })),
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.transactions) || typeof parsed.budgets !== 'object') return freshState();
    return {
      transactions: parsed.transactions,
      budgets: parsed.budgets,
      goals: Array.isArray(parsed.goals) ? parsed.goals : DEFAULT_GOALS.map((g) => ({ ...g })),
      bills: Array.isArray(parsed.bills) ? parsed.bills : DEFAULT_BILLS.map((b) => ({ ...b })),
    };
  } catch {
    return freshState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable: the site still works for this visit.
  }
}

export function resetState() {
  const state = freshState();
  saveState(state);
  return state;
}

// ---- derived figures -----------------------------------------------------

export function sumIncome(transactions) {
  return transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
}

export function sumSpending(transactions) {
  return transactions.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0);
}

export function spendingByCategory(transactions) {
  const totals = {};
  for (const category of CATEGORIES) totals[category.id] = 0;
  for (const t of transactions) {
    if (t.amount < 0 && totals[t.category] !== undefined) totals[t.category] += -t.amount;
  }
  return totals;
}

export function totalBudget(budgets) {
  return Object.values(budgets).reduce((s, v) => s + v, 0);
}

// ---- formatting ----------------------------------------------------------

export function formatRupiah(amount) {
  const sign = amount < 0 ? '−' : '';
  return sign + 'Rp ' + Math.abs(Math.round(amount)).toLocaleString('en-US');
}

export function formatShort(amount) {
  if (Math.abs(amount) >= 1000000) return 'Rp ' + (amount / 1000000).toFixed(1).replace(/\.0$/, '') + ' jt';
  if (Math.abs(amount) >= 1000) return 'Rp ' + Math.round(amount / 1000) + ' rb';
  return formatRupiah(amount);
}

export function formatPercent(value) {
  return (value * 100).toFixed(1) + '%';
}

export function formatDate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return day + ' ' + names[month - 1] + ' ' + year;
}

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
