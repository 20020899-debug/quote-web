async function search(input) {
    let q = input.value;
    let box = input.nextElementSibling;

    if (q.length < 1) {
        box.innerHTML = "";
        return;
    }

    let res = await fetch("/search?q=" + q);
    let data = await res.json();

    let html = "";

    data.forEach(item => {
        html += `
        <div onclick="selectItem(this,'${item.code}','${item.name}')">
            ${item.name} (${item.code})
        </div>`;
    });

    box.innerHTML = html;
}


function selectItem(el, code, name) {

    let row = el.closest("tr");   // 🔥 QUAN TRỌNG

    row.dataset.code = code;

    row.querySelector("input").value = name;

    row.querySelector(".code").innerText = code;

    el.parentElement.innerHTML = "";

    calc(row.querySelector("select"));
}


async function calc(el) {

    let row = el.closest("tr");   // 🔥 QUAN TRỌNG

    let code = row.dataset.code;
    let material = row.querySelector("select").value;
    let qty = parseFloat(row.querySelector("input[type=number]").value || 0);

    if (!code) return;

    let res = await fetch(`/get-price?code=${code}&material=${material}`);
    let data = await res.json();

    if (!data.found) return;

    row.querySelector(".price").innerText = data.price;

    row.querySelector(".total").innerText = data.price * qty;
}