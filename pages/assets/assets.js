/* ============================================================
   Money Pro — pages/assets/assets.js
   ============================================================ */
window.Pages = window.Pages || {};
window.Pages.assets = (function () {
  const CATS = ["property", "vehicle", "investment", "other"];

  function render() {
    const tbody = Utils.qs("#assets-tbody");
    if (!tbody) return; // page navigated away — listener still attached
    const rows = window.Api.getAssets();
    tbody.innerHTML = rows.length ? rows.map(a => `
      <tr>
        <td>${Utils.escapeHtml(a.name)}</td>
        <td><span class="pill">${Utils.escapeHtml(a.category)}</span></td>
        <td class="notes-cell">${Utils.escapeHtml(a.notes || "—")}</td>
        <td style="text-align:right" class="tabular">${Utils.formatMoney(a.value)}</td>
        <td class="row-actions">
          <button class="btn btn-ghost btn-sm" data-edit="${a.id}">Edit</button>
          <button class="btn btn-ghost btn-sm btn-danger" data-del="${a.id}">Delete</button>
        </td>
      </tr>
    `).join("") : `<tr><td colspan="5"><div class="empty-state">No assets tracked yet.<br><button class="btn btn-primary btn-sm" id="ast-empty-add">+ Add asset</button></div></td></tr>`;

    tbody.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => openForm(b.dataset.edit)));
    tbody.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => {
      if (confirm("Delete this asset?")) window.Api.deleteAsset(b.dataset.del);
    }));
    const emptyAdd = Utils.qs("#ast-empty-add");
    if (emptyAdd) emptyAdd.addEventListener("click", () => openForm());
  }

  function openForm(id) {
    const existing = id ? window.Api.getAssets().find(a => a.id === id) : null;
    Modal.open({
      title: existing ? "Edit asset" : "Add asset",
      bodyHtml: `
        <form>
          <div class="field"><label>Asset name</label>
            <input name="name" required placeholder="e.g. Condo Unit" value="${existing ? Utils.escapeHtml(existing.name) : ""}"></div>
          <div class="field"><label>Category</label>
            <select name="category">${CATS.map(c => `<option value="${c}" ${existing && existing.category === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
          <div class="field"><label>Current value</label>
            <input name="value" type="number" step="0.01" required value="${existing ? existing.value : ""}"></div>
          <div class="field"><label>Notes (optional)</label>
            <input name="notes" value="${existing ? Utils.escapeHtml(existing.notes || "") : ""}"></div>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" id="modal-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary">${existing ? "Save changes" : "Add asset"}</button>
          </div>
        </form>
      `,
      onMount: body => body.querySelector("#modal-cancel").addEventListener("click", Modal.close),
      onSubmit: (body, form) => {
        const data = Object.fromEntries(new FormData(form).entries());
        if (existing) window.Api.updateAsset(existing.id, data);
        else window.Api.addAsset(data);
      },
    });
  }

  let bound = false;
  function init() {
    render();
    if (!bound) { Utils.on("data:changed", render); Utils.on("settings:changed", render); bound = true; }
  }

  return { init, addAction: { label: "Add asset", run: () => openForm() } };
})();
