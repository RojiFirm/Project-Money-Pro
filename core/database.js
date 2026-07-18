/* ============================================================
   Money Pro — core/database.js
   The single source of truth for persisted data.

   Diagram note: "Database" → "Google Sheet". This file is built
   as a small adapter layer so that's a real option later:
     - LocalAdapter  (default, active): browser localStorage.
     - SheetAdapter   (stub, documented below): swap in a fetch()
       call to a Google Apps Script Web App endpoint that reads/
       writes rows of a Sheet, keeping the exact same interface
       (get/put/remove/all), so nothing above this file changes.

   Everything else in the app (core/api.js and every page) only
   ever talks to `DB`, never to localStorage directly.
   ============================================================ */
(function () {
  const PREFIX = window.MoneyProConfig.storagePrefix;

  const LocalAdapter = {
    _key(collection) { return PREFIX + collection; },

    all(collection) {
      const raw = localStorage.getItem(this._key(collection));
      return raw ? JSON.parse(raw) : [];
    },

    put(collection, record) {
      const rows = this.all(collection);
      const i = rows.findIndex(r => r.id === record.id);
      if (i >= 0) rows[i] = record; else rows.push(record);
      localStorage.setItem(this._key(collection), JSON.stringify(rows));
      return record;
    },

    remove(collection, id) {
      const rows = this.all(collection).filter(r => r.id !== id);
      localStorage.setItem(this._key(collection), JSON.stringify(rows));
    },

    get(collection, id) {
      return this.all(collection).find(r => r.id === id) || null;
    },

    clear(collection) {
      localStorage.removeItem(this._key(collection));
    },

    exportAll() {
      const out = {};
      ["accounts", "assets", "liabilities", "transactions", "transfers", "settings"].forEach(c => {
        out[c] = this.all(c);
      });
      return out;
    },

    importAll(dump) {
      Object.keys(dump || {}).forEach(c => {
        localStorage.setItem(this._key(c), JSON.stringify(dump[c] || []));
      });
    },
  };

  /* --------------------------------------------------------
     SheetAdapter (not wired in) — sketch of how a real Google
     Sheet backend would slot in behind the same interface:

     const SheetAdapter = {
       endpoint: "https://script.google.com/macros/s/XXXX/exec",
       async all(collection) {
         const r = await fetch(`${this.endpoint}?sheet=${collection}`);
         return r.json();
       },
       async put(collection, record) {
         await fetch(`${this.endpoint}?sheet=${collection}`, {
           method: "POST", body: JSON.stringify(record)
         });
         return record;
       },
       async remove(collection, id) {
         await fetch(`${this.endpoint}?sheet=${collection}&id=${id}`, { method: "DELETE" });
       },
     };
     To switch, set `window.DB = SheetAdapter;` below and make
     callers in core/api.js `await` these calls (they already
     return values synchronously-shaped so most call sites only
     need `await` added).
     -------------------------------------------------------- */

  window.DB = LocalAdapter;
})();
