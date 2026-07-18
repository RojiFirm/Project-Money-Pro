/* ============================================================
   Money Pro — core/app.js
   Entry point. Wires everything in core/ + components/ together
   and hands control to the router. Loaded last, as a module
   script, after config/database/api/utils are on window.
   ============================================================ */
(async function boot() {
  // 1. make sure there's data to look at on first run
  window.Api.seedDemoData();

  // 2. mount the always-on shell components
  await window.SidebarComponent.mount(document.getElementById("sidebar-root"));
  await window.NavbarComponent.mount(document.getElementById("navbar-root"));
  window.ModalComponent.mount(document.getElementById("modal-root"));

  // 3. hand off to the router for #/page content
  window.Router.start();
})();
