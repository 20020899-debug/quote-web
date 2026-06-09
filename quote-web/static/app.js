let data = [];

async function loadData() {
    let res = await fetch("/data");
    data = await res.json();
}

loadData();


// ===== ADD ROW =====
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

        <td class="price">0</td>

        <td>
            <input type="number" value="1" oninput="calcRow(this)">
        </td>

        <td class="total">0</td>
    `;

    body.appendChild(row);
}


// ===== AUTOCOMPLETE SEARCH =====
function searchProduct(input) {
    let val = input.value.toLowerCase();
    let dropdown = input.nextElementSibling;

    dropdown.innerHTML = "";

    if (!val) return;

    let matches = [...new Set(data
        .filter(d => (d["TenSP"] || "").toLowerCase().includes(val))
        .map(d => d["MaSP"])
    )].slice(0, 5);

    matches.forEach(ma => {
        let item = data.find(d => d["MaSP"] === ma);

        let div = document.createElement("div");
        div.innerText = item["TenSP"];

        div.onclick = () => {
            selectProduct(input, ma);
            dropdown.innerHTML = "";
        };

        dropdown.appendChild(div);
    });
}


// ===== CHỌN SẢN PHẨM =====
function selectProduct(input, ma) {
    let row = input.parentElement.parentElement;

    input.value = data.find(d => d["MaSP"] === ma)["TenSP"];

    let matSelect = row.children[1].querySelector("select");
    matSelect.innerHTML = "";

    let mats = data.filter(d => d["MaSP"] === ma);

    mats.forEach(d => {
        let opt = document.createElement("option");
        opt.value = d["VatLieu"];
        opt.innerText = d["VatLieu"];
        matSelect.appendChild(opt);
    });

    matSelect.dataset.ma = ma;

    onMaterialChange(matSelect);
}


// ===== CHỌN VẬT LIỆU =====
function onMaterialChange(el) {
    let row = el.parentElement.parentElement;

    let ma = el.dataset.ma;
    let vl = el.value;

    let item = data.find(d =>
        d["MaSP"] === ma && d["VatLieu"] === vl
    );

    if (!item) return;

    row.dataset.price = item["DonGiaCoSo"];

    row.children[2].innerText = item["DonGiaCoSo"];

    calcRow(row.children[3].querySelector("input"));
}


// ===== TÍNH DÒNG =====
function calcRow(input) {
    let row = input.parentElement.parentElement;

    let price = parseFloat(row.dataset.price || 0);
    let qty = parseFloat(input.value || 0);

    let total = price * qty;

    row.children[4].innerText = total;

    calcTotal();
}


// ===== TỔNG TIỀN =====
function calcTotal() {
    let sum = 0;

    document.querySelectorAll(".total").forEach(el => {
        sum += parseFloat(el.innerText || 0);
    });

    document.getElementById("total").innerText = "Tổng: " + sum;
}
