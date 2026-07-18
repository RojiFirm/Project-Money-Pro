/* ============================================================
   Money Pro — core/utils.js
   Small stateless helpers shared by every page and component.
   ============================================================ */
window.Utils = {
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },

  qs(sel, root) { return (root || document).querySelector(sel); },
  qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); },

  escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  },

  formatMoney(amount, currency) {
    const cur = currency || (window.Api ? window.Api.getSettings().currency : window.MoneyProConfig.defaultCurrency);
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency", currency: cur, maximumFractionDigits: 2,
      }).format(amount || 0);
    } catch (e) {
      return (amount || 0).toFixed(2) + " " + cur;
    }
  },

  formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  },

  todayISO() {
    return new Date().toISOString().slice(0, 10);
  },

  // Fires a DOM CustomEvent other modules (sidebar, navbar) listen for.
  emit(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail }));
  },

  on(name, handler) {
    document.addEventListener(name, handler);
  },
};
