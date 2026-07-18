/* ==========================================
   Project Money PRO
   Accounts Module
========================================== */

let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

let editIndex = -1;

/* ==========================================
   Elements
========================================== */

const modal = document.getElementById("accountModal");
const form = document.getElementById("accountForm");

const addBtn = document.getElementById("addAccountBtn");
const closeBtn = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");

const tbody = document.getElementById("accountBody");

const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");

/* ==========================================
   Modal
========================================== */

addBtn.onclick = () => {

    editIndex = -1;

    form.reset();

    document.getElementById("modalTitle").textContent =
        "Add Account";

    modal.classList.remove("hidden");

};

closeBtn.onclick = () => modal.classList.add("hidden");

cancelBtn.onclick = () => modal.classList.add("hidden");

window.onclick = (e) => {

    if (e.target === modal) {

        modal.classList.add("hidden");

    }

};

/* ==========================================
   Helpers
========================================== */

function generateID() {

    return "ACC-" +
        String(accounts.length + 1).padStart(6, "0");

}

function saveStorage() {

    localStorage.setItem(
        "accounts",
        JSON.stringify(accounts)
    );

}

/* ==========================================
   Render Table
========================================== */

function renderTable() {

    tbody.innerHTML = "";

    let keyword = searchInput.value.toLowerCase();

    let statusFilter = filterStatus.value;

    accounts.forEach((item, index) => {

        if (
            statusFilter !== "All" &&
            item.status !== statusFilter
        ) return;

        let text = JSON.stringify(item).toLowerCase();

        if (!text.includes(keyword)) return;

        tbody.innerHTML += `

        <tr>

            <td>${item.id}</td>

            <td>${item.name}</td>

            <td>${item.type}</td>

            <td class="balance">
                ₱ ${Number(item.openingBalance).toLocaleString()}
            </td>

            <td class="balance">
                ₱ ${Number(item.currentBalance).toLocaleString()}
            </td>

            <td>

                <span class="status ${item.status.toLowerCase()}">

                    ${item.status}

                </span>

            </td>

            <td>${item.notes}</td>

            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="editAccount(${index})">

                    Edit

                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteAccount(${index})">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}

/* ==========================================
   Save
========================================== */

form.addEventListener("submit", (e) => {

    e.preventDefault();

    let data = {

        id:
            editIndex === -1
                ? generateID()
                : accounts[editIndex].id,

        name:
            document.getElementById("accountName").value,

        type:
            document.getElementById("accountType").value,

        openingBalance:
            Number(document.getElementById("openingBalance").value),

        currentBalance:
            editIndex === -1
                ? Number(document.getElementById("openingBalance").value)
                : accounts[editIndex].currentBalance,

        status:
            document.getElementById("status").value,

        notes:
            document.getElementById("notes").value

    };

    if (editIndex === -1) {

        accounts.push(data);

    } else {

        accounts[editIndex] = data;

    }

    saveStorage();

    renderTable();

    modal.classList.add("hidden");

    form.reset();

});

/* ==========================================
   Edit
========================================== */

function editAccount(index) {

    editIndex = index;

    let item = accounts[index];

    document.getElementById("modalTitle").textContent =
        "Edit Account";

    document.getElementById("accountName").value =
        item.name;

    document.getElementById("accountType").value =
        item.type;

    document.getElementById("openingBalance").value =
        item.openingBalance;

    document.getElementById("status").value =
        item.status;

    document.getElementById("notes").value =
        item.notes;

    modal.classList.remove("hidden");

}

/* ==========================================
   Delete
========================================== */

function deleteAccount(index) {

    if (confirm("Delete this account?")) {

        accounts.splice(index, 1);

        saveStorage();

        renderTable();

    }

}

/* ==========================================
   Search
========================================== */

searchInput.addEventListener(
    "keyup",
    renderTable
);

filterStatus.addEventListener(
    "change",
    renderTable
);

/* ==========================================
   Initialize
========================================== */

renderTable();