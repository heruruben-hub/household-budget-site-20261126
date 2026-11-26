# RumahAnggaran — Household Budget Planner

[![make.fun](https://img.shields.io/badge/make.fun-bounty-blue)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![Built with Muse](https://img.shields.io/badge/built%20with-Muse-green)](https://muse.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

RumahAnggaran is a household budget site for the Prasetyo family of
Jakarta — and for any household that wants to see where its money actually
goes. It is a static site with no build step and no network request: open
`app/index.html` in a browser, or serve `app/` with any static server.

## What it does

- **Overview** (`#/`): monthly income vs spending, what is left unspent,
  the savings rate, a spending-by-category chart, a six-month trend and
  recent transactions.
- **Transactions** (`#/transactions`): add, edit and delete income and
  expense entries, filter by category and type, search descriptions. Every
  entry is stored in the browser (localStorage).
- **Budget** (`#/budget`): a monthly cap per category with progress bars,
  over/under indicators and editable amounts.
- **Goals** (`#/goals`): savings goals with progress and contributions.
- **Bills** (`#/bills`): recurring bills with due dates and paid/unpaid
  toggles.
- **Reports** (`#/reports`): six-month income-vs-spending and savings-rate
  charts, a category breakdown and plain-language insights.
- **About** (`#/about`): how to read the figures, sources and method.

Every figure on the site is derived from one transaction list
(`app/data.js`), so the dashboard totals, budget bars and charts always
agree. Amounts are in Indonesian rupiah (Rp).

## Files

- `app/index.html` — the single page and navigation shell
- `app/style.css` — the whole design (system fonts only)
- `app/main.js` — hash router and event wiring
- `app/views.js` — the seven pages
- `app/data.js` — the household's data, budgets, goals, bills and state
- `app/charts.js` — canvas charts (donut, bars, line, horizontal bars)

## Run it locally

```sh
node serve.ts
# then open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and
writes `dossier.json` with the vendored make.fun library.
