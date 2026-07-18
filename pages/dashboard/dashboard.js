/* ============================================================
   Money Pro — pages/dashboard/dashboard.js
   Read-only overview. No add-action of its own — it's a summary
   of the other pages, so the navbar "+ Add" button stays hidden
   here (dashboard has no addAction).
   ============================================================ */
window.Pages = window.Pages || {};
window.Pages.dashboard = (function () {
  function render() {
    if (!Utils.qs("#dash-networth")) return; // page navigated away — listener still attached
    const { accountsTotal, assetsTotal, liabilitiesTotal, netWorth } = window.Api.computeNetWorth();
    Utils.qs("#dash-networth").textContent = Utils.formatMoney(netWorth);
    Utils.qs("#dash-accounts").textContent = Utils.formatMoney(accountsTotal);
    Utils.qs("#dash-assets").textContent = Utils.formatMoney(assetsTotal);
    Utils.qs("#dash-liabilities").textContent = Utils.formatMoney(liabilitiesTotal);

    const positive = accountsTotal + assetsTotal;
    const total = positive + liabilitiesTotal || 1;
    const posPct = Math.max(4, Math.round((positive / total) * 100));
    Utils.qs("#dash-bar").innerHTML = `
      <div class="seg-pos" style="width:${posPct}%"></div>
      <div class="seg-neg" style="width:${100 - posPct}%"></div>
    `;

    const accountsById = {};
    window.Api.getAccounts().forEach(a => (accountsById[a.id] = a));
    const rows = window.Api.getTransactions().slice(0, 6).map(t => `
      <tr>
        <td>${Utils.formatDate(t.date)}</td>
        <td>${Utils.escapeHtml(accountsById[t.accountId] ? accountsById[t.accountId].name : "—")}</td>
        <td><span class="pill">${Utils.escapeHtml(t.category)}</span></td>
        <td style="text-align:right" class="tabular ${t.kind === "income" ? "amount-pos" : "amount-neg"}">
          ${t.kind === "income" ? "+" : "−"}${Utils.formatMoney(t.amount)}
        </td>
      </tr>
    `).join("");
    Utils.qs("#dash-recent-table tbody").innerHTML = rows ||
      `<tr><td colspan="4" class="empty-state">No transactions yet.</td></tr>`;
  }

  let bound = false;
  function init() {
    render();
    if (!bound) {
      Utils.on("data:changed", render);
      Utils.on("settings:changed", render);
      bound = true;
    }
  }

  return { init };
})();
