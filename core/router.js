/* ============================================================
   Money Pro — core/router.js
   Tiny hash router. Reads window.MoneyProConfig.routes so it
   never needs editing when a page is added — only config.js
   changes. Fetches the page's .html fragment, injects its .css
   once, loads its .js once, then calls PageModule.init(root).
   ============================================================ */
window.Router = (function () {
  const routesByKey = {};
  window.MoneyProConfig.routes.forEach(r => (routesByKey[r.key] = r));
  const loadedCss = new Set();
  const loadedJs = new Set();
  const pageRoot = document.getElementById("page-root");

  function currentKey() {
    const hash = (location.hash || "").replace(/^#\/?/, "");
    return routesByKey[hash] ? hash : window.MoneyProConfig.defaultRoute;
  }

  function loadCss(route) {
    if (loadedCss.has(route.key)) return;
    const href = route.path.replace(/\.html$/, ".css");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
    loadedCss.add(route.key);
  }

  function loadJs(route) {
    return new Promise((resolve, reject) => {
      if (loadedJs.has(route.key)) return resolve();
      const script = document.createElement("script");
      script.src = route.module;
      script.onload = () => { loadedJs.add(route.key); resolve(); };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async function render() {
    const key = currentKey();
    const route = routesByKey[key];
    loadCss(route);

    const res = await fetch(route.path);
    if (!res.ok) {
      pageRoot.innerHTML = `<div class="empty-state">Couldn't load ${Utils.escapeHtml(route.label)}.</div>`;
      return;
    }
    pageRoot.innerHTML = await res.text();

    await loadJs(route);
    const PageModule = window.Pages && window.Pages[key];
    if (PageModule && typeof PageModule.init === "function") {
      PageModule.init(pageRoot);
    }

    Utils.emit("route:changed", { key, route });
  }

  function start() {
    window.addEventListener("hashchange", render);
    if (!location.hash) location.hash = "#/" + window.MoneyProConfig.defaultRoute;
    render();
  }

  return { start, currentKey };
})();
