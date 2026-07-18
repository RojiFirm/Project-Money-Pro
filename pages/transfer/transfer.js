/* ============================================================
   Money Pro — pages/transfer/transfer.js
   Moving money between two of the user's own accounts. Unlike
   transactions (income/expense), a transfer never changes net
   worth — it just relocates it, so it's its own collection.
   ============================================================ */
window.Pages = window.Pages || {};
window.Pages.transfer = (function () {
  function fillAccountSelects() {
    if (!Utils.qs("#tf-from")) return; // page navigated away — listener still attached
    const accounts = window.Api.getAccounts();
    const opts = accounts.map(a => `<option value="${a.id}">${Utils.escapeHtml(a.name)} — ${Utils.formatMoney(a.balance)}</option>`).join("");
    Utils.qs("#tf-from").innerHTML = opts;
    Utils.qs("#tf-to").innerHTML = opts;
    if (accounts.length > 1) Utils.qs("#tf-to").selectedIndex = 1;
    Utils.qs("#tf-date").value = Utils.todayISO();
  }

  function renderHistory() {
    if (!Utils.qs("#tf-tbody")) return; // page navigated away — listener still attached
    const accountsById = {};
    window.Api.getAccounts().forEach(a => (accountsById[a.id] = a));
    const rows = window.Api.getTransfers();
    Utils.qs("#tf-tbody").innerHTML = rows.length ? rows.map(t => `
      <tr>
        <td>${Utils.formatDate(t.date)}</td>
        <td>${Utils.escapeHtml(accountsById[t.fromAccountId] ? accountsById[t.fromAccountId].name : "—")}</td>
        <td>${Utils.escapeHtml(accountsById[t.toAccountId] ? accountsById[t.toAccountId].name : "—")}</td>
        <td style="text-align:right" class="tabular">${Utils.formatMoney(t.amount)}</td>
      </tr>
    `).join("") : `<tr><td colspan="4"><div class="empty-state">No transfers yet.</div></td></tr>`;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const form = ev.target;
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.fromAccountId === data.toAccountId) { alert("Pick two different accounts."); return; }
    const rec = window.Api.addTransfer(data);
    if (!rec) { alert("Couldn't complete that transfer — check the amount and accounts."); return; }
    form.reset();
    fillAccountSelects();
  }

  let bound = false;
  function init() {
    fillAccountSelects();
    renderHistory();
    Utils.qs("#transfer-form").addEventListener("submit", handleSubmit);
    if (!bound) {
      Utils.on("data:changed", () => { fillAccountSelects(); renderHistory(); });
      Utils.on("settings:changed", renderHistory);
      bound = true;
    }
  }

  return { init };
})();
