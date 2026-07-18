/* ============================================================
   Money Pro — pages/settings/settings.js
   ============================================================ */
window.Pages = window.Pages || {};
window.Pages.settings = (function () {
  function renderCurrency() {
    const sel = Utils.qs("#set-currency");
    if (!sel) return; // page navigated away — listener still attached
    const settings = window.Api.getSettings();
    sel.innerHTML = window.MoneyProConfig.currencies
      .map(c => `<option value="${c}" ${c === settings.currency ? "selected" : ""}>${c}</option>`).join("");
    sel.onchange = () => window.Api.updateSettings({ currency: sel.value });
  }

  function exportBackup() {
    const dump = window.Api.exportBackup();
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moneypro-backup-${Utils.todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importBackup(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const dump = JSON.parse(reader.result);
        window.Api.importBackup(dump);
        alert("Backup imported.");
      } catch (e) {
        alert("That file doesn't look like a valid Money Pro backup.");
      }
    };
    reader.readAsText(file);
  }

  let bound = false;
  function init() {
    renderCurrency();
    Utils.qs("#set-export").addEventListener("click", exportBackup);
    Utils.qs("#set-import-file").addEventListener("change", e => {
      if (e.target.files[0]) importBackup(e.target.files[0]);
    });
    Utils.qs("#set-reset").addEventListener("click", () => {
      if (confirm("This replaces all current data with the starter demo data. Continue?")) window.Api.resetDemoData();
    });
    if (!bound) { Utils.on("settings:changed", renderCurrency); bound = true; }
  }

  return { init };
})();
