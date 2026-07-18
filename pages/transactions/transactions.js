/* ============================================================
   Money Pro — pages/transactions/transactions.js
   ============================================================ */
window.Pages = window.Pages || {};
window.Pages.transactions = (function () {
  let filterAccount = "all";

  function renderFilter() {
    const sel = Utils.qs("#txn-filter");
    if (!sel) return; // page navigated away — listener still attached
    const accounts = window.Api.getAccounts();
    sel.innerHTML = `<option value="all">All accounts</option>` +
      accounts.map(a => `<option value="${a.id}">${Utils.escapeHtml(a.name)}</option>`).join("");
    sel.value = filterAccount;
    sel.onchange = () => { filterAccount = sel.value; render(); };
  }

  function render() {
    if (!Utils.qs("#txn-tbody")) return; // page navigated away — listener still attached
    const accountsById = {};
    window.Api.getAccounts().forEach(a => (accountsById[a.id] = a));
    let rows = window.Api.getTransactions();
    if (filterAccount !== "all") rows = rows.filter(t => t.accountId === filterAccount);

    Utils.qs("#txn-tbody").innerHTML = rows.length ? rows.map(t => `
      <tr>
        <td>${Utils.formatDate(t.date)}</td>
        <td>${Utils.escapeHtml(accountsById[t.accountId] ? accountsById[t.accountId].name : "—")}</td>
        <td><span class="pill">${Utils.escapeHtml(t.category)}</span></td>
        <td style="color:var(--text-dim)">${Utils.escapeHtml(t.note || "—")}</td>
        <td style="text-align:right" class="tabular ${t.kind === "income" ? "amount-pos" : "amount-neg"}">
          ${t.kind === "income" ? "+" : "−"}${Utils.formatMoney(t.amount)}
        </td>
        <td class="row-actions"><button class="btn btn-ghost btn-sm btn-danger" data-del="${t.id}">Delete</button></td>
      </tr>
    `).join("") : `<tr><td colspan="6"><div class="empty-state">No transactions match this filter.</div></td></tr>`;

    Utils.qsa("[data-del]", Utils.qs("#txn-tbody")).forEach(b => b.addEventListener("click", () => {
      if (confirm("Delete this transaction? The account balance will be adjusted back.")) window.Api.deleteTransaction(b.dataset.del);
    }));
  }

  function openForm() {
    const accounts = window.Api.getAccounts();
    if (!accounts.length) { alert("Add an account first, then log transactions against it."); return; }
    Modal.open({
      title: "Add transaction",
      bodyHtml: `
        <form>
          <div class="field-row">
            <div class="field"><label>Kind</label>
              <select name="kind"><option value="expense">Expense</option><option value="income">Income</option></select></div>
            <div class="field"><label>Date</label>
              <input name="date" type="date" value="${Utils.todayISO()}" required></div>
          </div>
          <div class="field"><label>Account</label>
            <select name="accountId">${accounts.map(a => `<option value="${a.id}">${Utils.escapeHtml(a.name)}</option>`).join("")}</select></div>
          <div class="field-row">
            <div class="field"><label>Category</label>
              <input name="category" placeholder="e.g. Groceries" value="General"></div>
            <div class="field"><label>Amount</label>
              <input name="amount" type="number" step="0.01" required></div>
          </div>
          <div class="field"><label>Note (optional)</label><input name="note"></div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" id="modal-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary">Add transaction</button>
          </div>
        </form>
      `,
      onMount: body => body.querySelector("#modal-cancel").addEventListener("click", Modal.close),
      onSubmit: (body, form) => {
        const data = Object.fromEntries(new FormData(form).entries());
        window.Api.addTransaction(data);
      },
    });
  }

  let bound = false;
  function init() {
    renderFilter();
    render();
    if (!bound) { Utils.on("data:changed", () => { renderFilter(); render(); }); Utils.on("settings:changed", render); bound = true; }
  }

  return { init, addAction: { label: "Add transaction", run: openForm } };
})();
