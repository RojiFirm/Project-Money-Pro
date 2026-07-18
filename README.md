# Money Pro

A personal finance ledger — accounts, assets, liabilities, transactions
and transfers, with a live net-worth dashboard. Plain HTML/CSS/JS,
no build step, no framework.

## Run it

Browsers block `fetch()` of local files over `file://`, and this app
loads each page's HTML fragment with `fetch()`, so serve the folder
over HTTP instead of double-clicking `index.html`:

```bash
cd project-money-pro
python3 -m http.server 8080
# then open http://localhost:8080
```

(Any static server works — `npx serve`, VS Code's Live Server, etc.)

## How it's wired together

```
index.html                     loads fonts + core CSS/JS, mounts the shell
  core/config.js                the single list of routes/pages — edit
                                 this to add a new page, nothing else
  core/database.js              localStorage adapter (DB) — swap for a
                                 Google Sheet backend without touching
                                 anything above it (see comments inside)
  core/api.js                   business logic on top of DB: accounts,
                                 assets, liabilities, transactions,
                                 transfers, net worth
  core/utils.js                 formatting + a tiny pub/sub (Utils.emit/on)
  core/router.js                hash router (#/dashboard, #/accounts, ...)
                                 fetches pages/*/*.html, injects its css,
                                 loads its js, calls PageModule.init()
  core/app.js                   boots everything, mounts sidebar/navbar/
                                 modal, starts the router

components/sidebar   nav generated from config.routes + live net worth
components/navbar    page title + contextual "+ Add" button (reads
                      `addAction` off the active page module)
components/modal     shared modal shell every page's forms reuse

pages/dashboard       net worth hero + recent transactions
pages/accounts        bank/cash/investment accounts, CRUD
pages/assets           property/vehicle/investment holdings, CRUD
pages/liabilities      loans/cards owed, CRUD
pages/transactions      full ledger, filterable by account
pages/transfer          move money between two accounts (no net-worth
                         change — it's its own collection)
pages/settings          currency, JSON export/import backup, reset demo data
```

Data flow is one-directional: **pages → core/api.js → core/database.js**.
Pages never touch `localStorage` directly, so swapping the storage
backend (e.g. to a real Google Sheet via a small Apps Script web app)
only means editing `core/database.js`.

Everything re-renders reactively: any write in `core/api.js` fires a
`data:changed` DOM event; the sidebar's net-worth figure and the
current page's table both listen for it.

## Demo data

First run seeds a few sample accounts/assets/liabilities/transactions
so the dashboard isn't empty. Reset it any time from **Settings**.
