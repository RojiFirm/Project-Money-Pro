/* ============================================================
   Money Pro — components/sidebar/sidebar.js
   Renders nav links from MoneyProConfig.routes, keeps the
   active link in sync with the router, keeps the net-worth
   figure in the footer in sync with the database.
   ============================================================ */
window.SidebarComponent = (function () {
  const ICONS = {
    grid:   '<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>',
    wallet: '<path d="M3 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3H3zM3 9h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="16" cy="14" r="1.4"/>',
    gem:    '<path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18M9 3l3 6-3 12M15 3l-3 6 3 12"/>',
    anchor: '<circle cx="12" cy="5" r="2.3"/><path d="M12 7v14M6 12H2a10 10 0 0 0 10 9 10 10 0 0 0 10-9h-4M6 12a6 6 0 0 0 6 6 6 6 0 0 0 6-6"/>',
    list:   '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    swap:   '<path d="M17 3l4 4-4 4M21 7H7M7 21l-4-4 4-4M3 17h14"/>',
    gear:   '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  };

  function svg(icon) {
    return `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[icon] || ""}</svg>`;
  }

  function renderNav(activeKey) {
    const nav = document.getElementById("side-nav");
    if (!nav) return;
    nav.innerHTML = window.MoneyProConfig.routes.map(r => `
      <a class="nav-link ${r.key === activeKey ? "active" : ""}" href="#/${r.key}">
        ${svg(r.icon)}<span>${Utils.escapeHtml(r.label)}</span>
      </a>
    `).join("");
  }

  function renderNetWorth() {
    const el = document.getElementById("side-networth");
    if (!el) return;
    const { netWorth } = window.Api.computeNetWorth();
    el.textContent = Utils.formatMoney(netWorth);
  }

  async function mount(root) {
    const res = await fetch("components/sidebar/sidebar.html");
    root.innerHTML = await res.text();
    renderNav(window.Router ? window.Router.currentKey() : window.MoneyProConfig.defaultRoute);
    renderNetWorth();

    Utils.on("route:changed", e => renderNav(e.detail.key));
    Utils.on("data:changed", renderNetWorth);
    Utils.on("settings:changed", renderNetWorth);
  }

  return { mount };
})();
