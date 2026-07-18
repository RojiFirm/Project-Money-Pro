/* ============================================================
   Money Pro — components/modal/modal.js
   Generic modal shell. Any page can call:
     Modal.open({ title, bodyHtml, onMount, onSubmit })
   `onMount(bodyEl)` wires field listeners; `onSubmit(bodyEl)`
   runs on form submit and should return false to keep it open.
   ============================================================ */
window.ModalComponent = (function () {
  let overlay, titleEl, bodyEl, closeBtn;

  function close() {
    overlay.hidden = true;
    bodyEl.innerHTML = "";
  }

  function open({ title, bodyHtml, onMount, onSubmit }) {
    titleEl.textContent = title;
    bodyEl.innerHTML = bodyHtml;
    overlay.hidden = false;
    if (onMount) onMount(bodyEl);

    const form = bodyEl.querySelector("form");
    if (form && onSubmit) {
      form.addEventListener("submit", ev => {
        ev.preventDefault();
        const result = onSubmit(bodyEl, form);
        if (result !== false) close();
      });
    }
  }

  function mount(root) {
    root.innerHTML = ""; // overlay is injected via fetch below, root is #modal-root
    fetch("components/modal/modal.html")
      .then(r => r.text())
      .then(html => {
        root.innerHTML = html;
        overlay = document.getElementById("modal-overlay");
        titleEl = document.getElementById("modal-title");
        bodyEl = document.getElementById("modal-body");
        closeBtn = document.getElementById("modal-close");
        closeBtn.addEventListener("click", close);
        overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
        document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
      });
  }

  return { mount, open, close };
})();
// Global convenience alias used throughout pages/*.js
window.Modal = window.ModalComponent;
