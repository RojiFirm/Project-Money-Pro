/* ============================================================
   Money Pro — pages/accounts/accounts.js
   ============================================================ */
window.Pages = window.Pages || {};
window.Pages.accounts = (function () {
  const TYPES = ["checking", "savings", "cash", "investment"];

  function render() {
    const tbody = Utils.qs("#accounts-tbody");
    if (!tbody) return; // page navigated away — listener still attached
    const rows = window.Api.getAccounts();
    tbody.innerHTML = rows.length ? rows.map(a => `
      <tr>
        <td>${Utils.escapeHtml(a.name)}</td>
        <td><span class="pill type-badge">${Utils.escapeHtml(a.type)}</span></td>
        <td style="text-align:right" class="tabular">${Utils.formatMoney(a.balance)}</td>
        <td class="row-actions">
          <button class="btn btn-ghost btn-sm" data-edit="${a.id}">Edit</button>
          <button class="btn btn-ghost btn-sm btn-danger" data-del="${a.id}">Delete</button>
        </td>
      </tr>
    `).join("") : `<tr><td colspan="4"><div class="empty-state">No accounts yet — add your first one.<br><button class="btn btn-primary btn-sm" id="acc-empty-add">+ Add account</button></div></td></tr>`;

    tbody.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => openForm(b.dataset.edit)));
    tbody.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => {
      if (confirm("Delete this account? This cannot be undone.")) window.Api.deleteAccount(b.dataset.del);
    }));
    const emptyAdd = Utils.qs("#acc-empty-add");
    if (emptyAdd) emptyAdd.addEventListener("click", () => openForm());
  }

  function openForm(id) {
    const existing = id ? window.Api.getAccounts().find(a => a.id === id) : null;
    Modal.open({
      title: existing ? "Edit account" : "Add account",
      bodyHtml: `
        <form>
          <div class="field"><label>Account name</label>
            <input name="name" required placeholder="e.g. Everyday Checking" value="${existing ? Utils.escapeHtml(existing.name) : ""}"></div>
          <div class="field"><label>Type</label>
            <select name="type">${TYPES.map(t => `<option value="${t}" ${existing && existing.type === t ? "selected" : ""}>${t}</option>`).join("")}</select></div>
          <div class="field"><label>Balance</label>
            <input name="balance" type="number" step="0.01" required value="${existing ? existing.balance : ""}"></div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" id="modal-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary">${existing ? "Save changes" : "Add account"}</button>
          </div>
        </form>
      `,
      onMount: body => body.querySelector("#modal-cancel").addEventListener("click", Modal.close),
      onSubmit: (body, form) => {
        const data = Object.fromEntries(new FormData(form).entries());
        if (existing) window.Api.updateAccount(existing.id, data);
        else window.Api.addAccount(data);
      },
    });
  }

  let bound = false;
  function init() {
    render();
    if (!bound) { Utils.on("data:changed", render); Utils.on("settings:changed", render); bound = true; }
  }

  return { init, addAction: { label: "Add account", run: () => openForm() } };
})();
