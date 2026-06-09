async function updateRow(select) {
    let row = select.parentElement.parentElement;
    let material = select.value;

    let res = await fetch(`/get-price?material=${material}`);
    let data = await res.json();

    row.querySelector(".price").innerText = data.price;

    calcRow(select);
}

function calcRow(input) {
    let row = input.parentElement.parentElement;

    let price = parseFloat(row.querySelector(".price").innerText || 0);
    let qty = parseFloat(row.querySelector("input[type='number']").value || 0);

    let total = price * qty;

    row.querySelector(".total").innerText = total;
}