
let data = [];

// ================== LOAD DATA ==================
async function loadData() {
    let res = await fetch("/data");
    data = await res.json();
}

loadData();


// ================== ADD ROW ==================
function addRow() {
    let body = document.getElementById("body");

    let row = document.createElement("tr");

    row.innerHTML = `
        <td style="position:relative;">
            <input type="text" placeholder="Tìm sản phẩm..." oninput="searchProduct(this)">
            <div class="dropdown"></div>
        </td>

        <td>
            <select onchange="onMaterialChange(this)"></select>
        </td>

        <td class="unit"></td>

        <td class="price">0</td>

        <td>
            <input type="number" value="1" min="0" oninput="calcRow(this)">
        </td>

        <td class="total">0</td>
    `;

    // lưu state
    row.dataset.ma = "";
    row.dataset.price = "0";

    body.appendChild(row);
}


// ================== SEARCH PRODUCT (GOOGLE STYLE) ==================
function searchProduct(input) {
    let val = input.value.toLowerCase();
    let dropdown = input.nextElementSibling;

    dropdown.innerHTML = "";

    if (!val) return;

    let matches = [...new Set(
        data
        .filter(d => (d.TenSP || "").toLowerCase().includes(val))
        .map(d => d.MaSP)
    )].slice(0, 6);

    matches.forEach(ma => {
        let item = data.find(d => d.MaSP === ma);

        let div = document.createElement("div");
        div.innerText = item.TenSP;

        div.onclick = () => selectProduct(input, ma);

        dropdown.appendChild(div);
    });
}


// ================== SELECT PRODUCT ==================
function selectProduct(input, ma) {
    let row = input.parentElement.parentElement;

    row.dataset.ma = ma;

    let item = data.find(d => d.MaSP === ma);

    input.value = item.TenSP;

    let matSelect = row.querySelector("select");
    matSelect.innerHTML = "";

    let mats = data.filter(d => d.MaSP === ma);

    mats.forEach(m => {
        let opt = document.createElement("option");
        opt.value = m.VatLieu;
        opt.innerText = m.VatLieu;
        matSelect.appendChild(opt);
    });

    // auto trigger material
    onMaterialChange(matSelect);

    // clear dropdown
    input.nextElementSibling.innerHTML = "";
}


// ================== CHANGE MATERIAL ==================
function onMaterialChange(select) {
    let row = select.parentElement.parentElement;

    let ma = row.dataset.ma;
    let vl = select.value;

    let item = data.find(d =>
        d.MaSP === ma &&
        d.VatLieu === vl
    );

    if (!item) {
        row.children[3].innerText = 0;
        row.dataset.price = 0;
        return;
    }

    row.dataset.price = item.DonGia;

    row.children[2].innerText = item.DonVi;
    row.children[3].innerText = item.DonGia;

    calcRow(row.children[4].querySelector("input"));
}


// ================== CALC ROW ==================
function calcRow(input) {
    let row = input.parentElement.parentElement;

    let price = parseFloat(row.dataset.price || 0);
    let qty = parseFloat(input.value || 0);

    let total = price * qty;

    row.children[5].innerText = total;

    calcTotal();
}


// ================== TOTAL ==================
function calcTotal() {
    let sum = 0;

    document.querySelectorAll(".total").forEach(el => {
        sum += parseFloat(el.innerText || 0);
    });

    document.getElementById("total").innerText =
        "Tổng tiền: " + sum.toLocaleString("vi-VN");
}
