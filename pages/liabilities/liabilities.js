/* ============================================================
   Money Pro — pages/liabilities/liabilities.js
   ============================================================ */
window.Pages = window.Pages || {};
window.Pages.liabilities = (function () {
  const CATS = ["mortgage", "loan", "credit-card", "other"];

  function render() {
    const tbody = Utils.qs("#liab-tbody");
    if (!tbody) return; // page navigated away — listener still attached
    const rows = window.Api.getLiabilities();
    tbody.innerHTML = rows.length ? rows.map(l => `
      <tr>
        <td>${Utils.escapeHtml(l.name)}</td>
        <td><span class="pill">${Utils.escapeHtml(l.category)}</span></td>
        <td class="rate-cell tabular">${l.rate ? l.rate + "%" : "—"}</td>
        <td style="text-align:right" class="tabular amount-neg">${Utils.formatMoney(l.balance)}</td>
        <td class="row-actions">
          <button class="btn btn-ghost btn-sm" data-edit="${l.id}">Edit</button>
          <button class="btn btn-ghost btn-sm btn-danger" data-del="${l.id}">Delete</button>
        </td>
      </tr>
    `).join("") : `<tr><td colspan="5"><div class="empty-state">No liabilities on record. That's good — or add one to track.<br><button class="btn btn-primary btn-sm" id="liab-empty-add">+ Add liability</button></div></td></tr>`;

    tbody.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => openForm(b.dataset.edit)));
    tbody.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => {
      if (confirm("Delete this liability?")) window.Api.deleteLiability(b.dataset.del);
    }));
    const emptyAdd = Utils.qs("#liab-empty-add");
    if (emptyAdd) emptyAdd.addEventListener("click", () => openForm());
  }

  function openForm(id) {
    const existing = id ? window.Api.getLiabilities().find(l => l.id === id) : null;
    Modal.open({
      title: existing ? "Edit liability" : "Add liability",
      bodyHtml: `
        <form>
          <div class="field"><label>Name</label>
            <input name="name" required placeholder="e.g. Home Loan" value="${existing ? Utils.escapeHtml(existing.name) : ""}"></div>
          <div class="field"><label>Category</label>
            <select name="category">${CATS.map(c => `<option value="${c}" ${existing && existing.category === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
          <div class="field-row">
            <div class="field"><label>Balance owed</label>
              <input name="balance" type="number" step="0.01" required value="${existing ? existing.balance : ""}"></div>
            <div class="field"><label>Interest rate %</label>
              <input name="rate" type="number" step="0.01" value="${existing ? existing.rate : ""}"></div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" id="modal-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary">${existing ? "Save changes" : "Add liability"}</button>
          </div>
        </form>
      `,
      onMount: body => body.querySelector("#modal-cancel").addEventListener("click", Modal.close),
      onSubmit: (body, form) => {
        const data = Object.fromEntries(new FormData(form).entries());
        if (existing) window.Api.updateLiability(existing.id, data);
        else window.Api.addLiability(data);
      },
    });
  }

  let bound = false;
  function init() {
    render();
    if (!bound) { Utils.on("data:changed", render); Utils.on("settings:changed", render); bound = true; }
  }

  return { init, addAction: { label: "Add liability", run: () => openForm() } };
})();
