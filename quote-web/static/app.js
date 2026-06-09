let data = [];

async function loadData() {
    let res = await fetch("/data");
    data = await res.json();
}

loadData();

// thêm dòng
function addRow() {
    let body = document.getElementById("body");

    let row = document.createElement("tr");

    row.innerHTML = `
        <td>
            <select onchange="onSelectProduct(this)">
                <option value="">-- chọn --</option>
            </select>
        </td>

        <td>
            <select onchange="onChangeMaterial(this)"></select>
        </td>

        <td class="price">0</td>

        <td>
            <input type="number" value="1" oninput="calcRow(this)">
        </td>

        <td class="total">0</td>
    `;

    body.appendChild(row);

    fillProducts(row);
}


// fill sản phẩm
function fillProducts(row) {
    let select = row.children[0].querySelector("select");

    let products = [...new Set(data.map(d => d["MaSP"]))];

    products.forEach(p => {
        let opt = document.createElement("option");
        opt.value = p;
        opt.innerText = p;
        select.appendChild(opt);
    });
}


// khi chọn sản phẩm → load vật liệu
function onSelectProduct(el) {
    let row = el.parentElement.parentElement;
    let ma = el.value;

    let matSelect = row.children[1].querySelector("select");
    matSelect.innerHTML = "";

    let filtered = data.filter(d => d["MaSP"] == ma);

    filtered.forEach(d => {
        let opt = document.createElement("option");
        opt.value = d["VatLieu"];
        opt.innerText = d["VatLieu"];
        matSelect.appendChild(opt);
    });

    onChangeMaterial(matSelect);
}


// khi chọn vật liệu
function onChangeMaterial(el) {
    let row = el.parentElement.parentElement;

    let ma = row.children[0].querySelector("select").value;
    let vl = row.children[1].querySelector("select").value;

    let item = data.find(d => d["MaSP"] == ma && d["VatLieu"] == vl);

    if (!item) return;

    row.dataset.price = item["DonGiaCoSo"];
    row.dataset.rule = item["LoaiTinhGia"];

    row.children[2].innerText = item["DonGiaCoSo"];

    calcRow(row.children[3].querySelector("input"));
}


// tính tiền dòng
function calcRow(input) {
    let row = input.parentElement.parentElement;

    let price = parseFloat(row.dataset.price || 0);
    let qty = parseFloat(input.value || 0);

    let total = price * qty;

    row.children[4].innerText = total;

    calcTotal();
}


// tổng tiền
function calcTotal() {
    let sum = 0;

    document.querySelectorAll(".total").forEach(el => {
        sum += parseFloat(el.innerText || 0);
    });

    document.getElementById("total").innerText = "Tổng: " + sum;
}