const modal = document.getElementById("transactionModal");

const btnNew = document.getElementById("btnNewTransaction");

const form = document.getElementById("transactionForm");

btnNew.onclick = () => {

    modal.classList.remove("hidden");

}

modal.onclick = (e)=>{

    if(e.target===modal){

        modal.classList.add("hidden");

    }

}

let transactionNumber = 1;

function generateID(){

    return "TRX-" + String(transactionNumber++)
        .padStart(6,"0");

}

form.addEventListener("submit",function(e){

    e.preventDefault();

    const amount = Number(
        document.getElementById("amount").value
    );

    const taxRate = 0.10;

    const additionalRate = 0.05;

    const tax = amount * taxRate;

    const additional = amount * additionalRate;

    const net = amount - tax - additional;

    document.getElementById("taxAmount").textContent =
        "₱" + tax.toFixed(2);

    document.getElementById("additionalTaxAmount").textContent =
        "₱" + additional.toFixed(2);

    document.getElementById("netAmount").textContent =
        "₱" + net.toFixed(2);

    const table = document.getElementById("transactionBody");

    const row = table.insertRow();

    row.innerHTML = `

        <td>${generateID()}</td>
        <td>${document.getElementById("date").value}</td>
        <td>${document.getElementById("type").value}</td>
        <td>${document.getElementById("category").value}</td>
        <td>${document.getElementById("account").value}</td>
        <td>₱${amount.toFixed(2)}</td>
        <td>₱${tax.toFixed(2)}</td>
        <td>₱${net.toFixed(2)}</td>
        <td>${document.getElementById("description").value}</td>

    `;

    form.reset();

    modal.classList.add("hidden");

});