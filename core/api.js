/* ============================================================
   Money Pro — core/api.js
   Business logic layer. Pages call ONLY these functions — never
   window.DB directly — so validation & derived numbers (net
   worth, balances) live in exactly one place.
   ============================================================ */
window.Api = (function () {
  const DB = window.DB;
  const U = window.Utils;

  /* ---------- settings ---------- */
  function getSettings() {
    const rows = DB.all("settings");
    if (rows.length) return rows[0];
    const defaults = { id: "settings", currency: window.MoneyProConfig.defaultCurrency };
    DB.put("settings", defaults);
    return defaults;
  }
  function updateSettings(patch) {
    const s = Object.assign({}, getSettings(), patch, { id: "settings" });
    DB.put("settings", s);
    U.emit("settings:changed", s);
    return s;
  }

  /* ---------- accounts ---------- */
  function getAccounts() { return DB.all("accounts").sort((a, b) => a.name.localeCompare(b.name)); }
  function addAccount(data) {
    const rec = { id: U.uid(), name: data.name, type: data.type, balance: Number(data.balance) || 0, createdAt: new Date().toISOString() };
    DB.put("accounts", rec);
    U.emit("data:changed", { collection: "accounts" });
    return rec;
  }
  function updateAccount(id, patch) {
    const rec = Object.assign({}, DB.get("accounts", id), patch, { id });
    DB.put("accounts", rec);
    U.emit("data:changed", { collection: "accounts" });
    return rec;
  }
  function deleteAccount(id) {
    DB.remove("accounts", id);
    U.emit("data:changed", { collection: "accounts" });
  }

  /* ---------- assets ---------- */
  function getAssets() { return DB.all("assets").sort((a, b) => a.name.localeCompare(b.name)); }
  function addAsset(data) {
    const rec = { id: U.uid(), name: data.name, category: data.category, value: Number(data.value) || 0, notes: data.notes || "", createdAt: new Date().toISOString() };
    DB.put("assets", rec);
    U.emit("data:changed", { collection: "assets" });
    return rec;
  }
  function updateAsset(id, patch) {
    const rec = Object.assign({}, DB.get("assets", id), patch, { id });
    DB.put("assets", rec);
    U.emit("data:changed", { collection: "assets" });
    return rec;
  }
  function deleteAsset(id) {
    DB.remove("assets", id);
    U.emit("data:changed", { collection: "assets" });
  }

  /* ---------- liabilities ---------- */
  function getLiabilities() { return DB.all("liabilities").sort((a, b) => a.name.localeCompare(b.name)); }
  function addLiability(data) {
    const rec = { id: U.uid(), name: data.name, category: data.category, balance: Number(data.balance) || 0, rate: Number(data.rate) || 0, createdAt: new Date().toISOString() };
    DB.put("liabilities", rec);
    U.emit("data:changed", { collection: "liabilities" });
    return rec;
  }
  function updateLiability(id, patch) {
    const rec = Object.assign({}, DB.get("liabilities", id), patch, { id });
    DB.put("liabilities", rec);
    U.emit("data:changed", { collection: "liabilities" });
    return rec;
  }
  function deleteLiability(id) {
    DB.remove("liabilities", id);
    U.emit("data:changed", { collection: "liabilities" });
  }

  /* ---------- transactions ---------- */
  function getTransactions() {
    return DB.all("transactions").sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  function addTransaction(data) {
    const amount = Number(data.amount) || 0;
    const rec = {
      id: U.uid(), date: data.date || U.todayISO(), accountId: data.accountId,
      kind: data.kind, category: data.category || "General", note: data.note || "",
      amount, createdAt: new Date().toISOString(),
    };
    DB.put("transactions", rec);
    // keep account balance in sync
    const acct = DB.get("accounts", rec.accountId);
    if (acct) {
      const delta = rec.kind === "income" ? amount : -amount;
      DB.put("accounts", Object.assign({}, acct, { balance: (Number(acct.balance) || 0) + delta }));
    }
    U.emit("data:changed", { collection: "transactions" });
    return rec;
  }
  function deleteTransaction(id) {
    const rec = DB.get("transactions", id);
    if (rec) {
      const acct = DB.get("accounts", rec.accountId);
      if (acct) {
        const delta = rec.kind === "income" ? -rec.amount : rec.amount;
        DB.put("accounts", Object.assign({}, acct, { balance: (Number(acct.balance) || 0) + delta }));
      }
    }
    DB.remove("transactions", id);
    U.emit("data:changed", { collection: "transactions" });
  }

  /* ---------- transfers ---------- */
  function getTransfers() {
    return DB.all("transfers").sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  function addTransfer(data) {
    const amount = Number(data.amount) || 0;
    const from = DB.get("accounts", data.fromAccountId);
    const to = DB.get("accounts", data.toAccountId);
    if (!from || !to || from.id === to.id || amount <= 0) return null;
    DB.put("accounts", Object.assign({}, from, { balance: (Number(from.balance) || 0) - amount }));
    DB.put("accounts", Object.assign({}, to, { balance: (Number(to.balance) || 0) + amount }));
    const rec = {
      id: U.uid(), date: data.date || U.todayISO(),
      fromAccountId: from.id, toAccountId: to.id, amount, note: data.note || "",
      createdAt: new Date().toISOString(),
    };
    DB.put("transfers", rec);
    U.emit("data:changed", { collection: "transfers" });
    return rec;
  }

  /* ---------- derived / dashboard ---------- */
  function computeNetWorth() {
    const assetsTotal = getAssets().reduce((s, a) => s + Number(a.value || 0), 0);
    const accountsTotal = getAccounts().reduce((s, a) => s + Number(a.balance || 0), 0);
    const liabilitiesTotal = getLiabilities().reduce((s, l) => s + Number(l.balance || 0), 0);
    return {
      accountsTotal, assetsTotal, liabilitiesTotal,
      netWorth: accountsTotal + assetsTotal - liabilitiesTotal,
    };
  }

  function exportBackup() {
    return DB.exportAll();
  }
  function importBackup(dump) {
    DB.importAll(dump);
    U.emit("data:changed", { collection: "all" });
  }
  function resetDemoData() {
    ["accounts", "assets", "liabilities", "transactions", "transfers"].forEach(c => DB.clear(c));
    seedDemoData();
    U.emit("data:changed", { collection: "all" });
  }

  /* ---------- first-run seed ---------- */
  function seedDemoData() {
    if (getAccounts().length || getAssets().length || getLiabilities().length) return;
    const checking = addAccount({ name: "Everyday Checking", type: "checking", balance: 42500 });
    const savings = addAccount({ name: "High-Yield Savings", type: "savings", balance: 158200 });
    addAccount({ name: "Cash Wallet", type: "cash", balance: 3200 });

    addAsset({ name: "Condo Unit — Makati", category: "property", value: 4200000, notes: "Owner-occupied" });
    addAsset({ name: "Index Fund Portfolio", category: "investment", value: 310000 });
    addAsset({ name: "Sedan (2021)", category: "vehicle", value: 620000 });

    addLiability({ name: "Home Loan", category: "mortgage", balance: 1850000, rate: 6.5 });
    addLiability({ name: "Credit Card", category: "credit-card", balance: 18500, rate: 3.5 });

    addTransaction({ date: U.todayISO(), accountId: checking.id, kind: "expense", category: "Groceries", amount: 1850, note: "Weekly groceries" });
    addTransaction({ date: U.todayISO(), accountId: savings.id, kind: "income", category: "Salary", amount: 65000, note: "Payroll deposit" });
    addTransaction({ date: U.todayISO(), accountId: checking.id, kind: "expense", category: "Utilities", amount: 3200, note: "Electricity bill" });
  }

  return {
    getSettings, updateSettings,
    getAccounts, addAccount, updateAccount, deleteAccount,
    getAssets, addAsset, updateAsset, deleteAsset,
    getLiabilities, addLiability, updateLiability, deleteLiability,
    getTransactions, addTransaction, deleteTransaction,
    getTransfers, addTransfer,
    computeNetWorth,
    exportBackup, importBackup, resetDemoData, seedDemoData,
  };
})();
