let data = [];

// =========================
// LOAD DATA
// =========================
async function loadData() {
    const res = await fetch("/data");
    data = await res.json();
}

loadData();


// =========================
// FORMAT TIỀN
// =========================
function formatMoney(value) {
    return Number(value || 0).toLocaleString("vi-VN");
}


// =========================
// THÊM DÒNG
// =========================
function addRow() {

    const tbody = document.getElementById("body");

    const tr = document.createElement("tr");

    tr.dataset.ma = "";
    tr.dataset.price = 0;

    tr.innerHTML = `
        <td style="position:relative;">
            <input type="text"
                   class="product-search"
                   placeholder="Tìm sản phẩm..."
                   oninput="searchProduct(this)">

            <div class="dropdown"></div>
        </td>

        <td>
            <select onchange="changeMaterial(this)">
                <option value="">-- Chọn --</option>
            </select>
        </td>

        <td class="unit"></td>

        <td class="price">0</td>

        <td>
            <input type="number"
                   value="1"
                   min="0"
                   step="0.01"
                   oninput="calcRow(this)">
        </td>

        <td class="amount">0</td>

        <td>
            <button onclick="deleteRow(this)">X</button>
        </td>
    `;

    tbody.appendChild(tr);
}


// =========================
// XÓA DÒNG
// =========================
function deleteRow(btn) {

    btn.closest("tr").remove();

    calcTotal();
}


// =========================
// SEARCH SẢN PHẨM
// =========================
function searchProduct(input) {

    const keyword = input.value.trim().toLowerCase();

    const dropdown = input.nextElementSibling;

    dropdown.innerHTML = "";

    if (!keyword) return;

    const products = [];

    data.forEach(item => {

        if (
            item.TenSP.toLowerCase().includes(keyword)
            &&
            !products.some(p => p.MaSP === item.MaSP)
        ) {
            products.push(item);
        }
    });

    products.slice(0, 10).forEach(item => {

        const div = document.createElement("div");

        div.innerText = item.TenSP;

        div.onclick = () => selectProduct(input, item);

        dropdown.appendChild(div);
    });
}


// =========================
// CHỌN SẢN PHẨM
// =========================
function selectProduct(input, product) {

    const row = input.closest("tr");

    row.dataset.ma = product.MaSP;

    input.value = product.TenSP;

    input.nextElementSibling.innerHTML = "";

    const materialSelect =
        row.children[1].querySelector("select");

    materialSelect.innerHTML = "";

    const materials = [
        ...new Set(
            data
                .filter(x => x.MaSP === product.MaSP)
                .map(x => x.VatLieu)
        )
    ];

    materials.forEach(vl => {

        const option = document.createElement("option");

        option.value = vl;
        option.textContent = vl;

        materialSelect.appendChild(option);
    });

    changeMaterial(materialSelect);
}


// =========================
// ĐỔI VẬT LIỆU
// =========================
function changeMaterial(select) {

    const row = select.closest("tr");

    const ma = row.dataset.ma;

    const vatLieu = select.value;

    const item = data.find(x =>
        x.MaSP === ma &&
        x.VatLieu === vatLieu
    );

    if (!item) {

        row.children[2].textContent = "";

        row.children[3].textContent = "0";

        row.dataset.price = 0;

        calcRow(
            row.children[4].querySelector("input")
        );

        return;
    }

    row.children[2].textContent = item.DonVi;

    row.children[3].textContent =
        formatMoney(item.DonGia);

    row.dataset.price = item.DonGia;

    calcRow(
        row.children[4].querySelector("input")
    );
}


// =========================
// TÍNH THÀNH TIỀN
// =========================
function calcRow(input) {

    const row = input.closest("tr");

    const qty =
        parseFloat(input.value) || 0;

    const price =
        parseFloat(row.dataset.price) || 0;

    const amount = qty * price;

    row.children[5].textContent =
        formatMoney(amount);

    calcTotal();
}


// =========================
// TỔNG TIỀN
// =========================
function calcTotal() {

    let total = 0;

    document.querySelectorAll("#body tr")
        .forEach(row => {

            const qty =
                parseFloat(
                    row.children[4]
                        .querySelector("input")
                        .value
                ) || 0;

            const price =
                parseFloat(row.dataset.price) || 0;

            total += qty * price;
        });

    document.getElementById("total")
        .innerText =
        "Tổng tiền: " +
        formatMoney(total);
}