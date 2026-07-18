/* ============================================================
   Money Pro — core/config.js
   Central place for app-wide constants. Every other module
   (router, sidebar, pages) reads its list of routes from here,
   so adding a new page means editing ONE file.
   ============================================================ */
window.MoneyProConfig = {
  appName: "Money Pro",
  storagePrefix: "moneypro:",
  defaultCurrency: "PHP",
  currencies: ["PHP", "USD", "EUR", "GBP", "JPY", "SGD"],

  // Drives the sidebar nav AND the router at the same time.
  routes: [
    { key: "dashboard",   label: "Dashboard",    icon: "grid",    path: "pages/dashboard/dashboard.html",     module: "pages/dashboard/dashboard.js" },
    { key: "accounts",    label: "Accounts",     icon: "wallet",  path: "pages/accounts/accounts.html",       module: "pages/accounts/accounts.js" },
    { key: "assets",      label: "Assets",       icon: "gem",     path: "pages/assets/assets.html",           module: "pages/assets/assets.js" },
    { key: "liabilities", label: "Liabilities",  icon: "anchor",  path: "pages/liabilities/liabilities.html", module: "pages/liabilities/liabilities.js" },
    { key: "transactions",label: "Transactions", icon: "list",    path: "pages/transactions/transactions.html", module: "pages/transactions/transactions.js" },
    { key: "transfer",    label: "Transfer",     icon: "swap",    path: "pages/transfer/transfer.html",       module: "pages/transfer/transfer.js" },
    { key: "settings",    label: "Settings",     icon: "gear",    path: "pages/settings/settings.html",       module: "pages/settings/settings.js" },
  ],

  defaultRoute: "dashboard",
};
