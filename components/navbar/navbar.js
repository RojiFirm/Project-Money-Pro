/* ============================================================
   Money Pro — components/navbar/navbar.js
   Shows the current page title + a contextual "+ Add" button.
   Each page module can expose `addAction: { label, run() }` —
   navbar reads it after every route change and wires the click.
   ============================================================ */
window.NavbarComponent = (function () {
  function applyRoute(route) {
    const title = document.getElementById("nav-title");
    const eyebrow = document.getElementById("nav-eyebrow");
    const addBtn = document.getElementById("nav-add-btn");
    if (title) title.textContent = route.label;
    if (eyebrow) eyebrow.textContent = "Money Pro / " + route.label;

    const page = window.Pages && window.Pages[route.key];
    if (addBtn) {
      if (page && page.addAction) {
        addBtn.style.display = "";
        addBtn.textContent = "+ " + page.addAction.label;
        addBtn.onclick = () => page.addAction.run();
      } else {
        addBtn.style.display = "none";
      }
    }
  }

  async function mount(root) {
    const res = await fetch("components/navbar/navbar.html");
    root.innerHTML = await res.text();
    Utils.on("route:changed", e => applyRoute(e.detail.route));
  }

  return { mount };
})();
