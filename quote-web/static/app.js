let data = [];

// =========================
// LOAD DATA
// =========================
async function loadData() {
    try {
        const res = await fetch("/data");
        data = await res.json();
        console.log("Đã load:", data.length);
    } catch (err) {
        console.error(err);
    }
}

// =========================
// FORMAT TIỀN
// =========================
function formatMoney(value) {
    return Number(value || 0).toLocaleString("vi-VN");
}

// =========================
// STT
// =========================
function updateSTT() {
    document.querySelectorAll("#body tr").forEach((row, i) => {
        row.querySelector(".stt").textContent = i + 1;
    });
}

// =========================
// ADD ROW (GIỮ UI CŨ)
// =========================
function addRow() {

    const tbody = document.getElementById("body");

    const tr = document.createElement("tr");
    tr.dataset.price = 0;

    tr.innerHTML = `
        <td class="stt"></td>

        <td style="position:relative;">
            <textarea class="multiline product-search"
                placeholder="Tìm sản phẩm..."
                oninput="searchProduct(this)"></textarea>

            <div class="dropdown"></div>
        </td>

        <td>
            <select class="material-select"
                onchange="changeMaterial(this)">
                <option value="">-- Chọn --</option>
            </select>
        </td>

        <td>
            <textarea class="multiline spec"
                placeholder="Đặc tính kỹ thuật"></textarea>
        </td>

        <td>
            <input type="number" value="1" min="0" step="0.01"
                oninput="calcRow(this)">
        </td>

        <td class="unit"></td>
        <td class="price">0</td>
        <td class="amount">0</td>

        <td>
            <textarea class="multiline origin"
                placeholder="Xuất xứ/Ghi chú"></textarea>
        </td>

        <td>
            <button onclick="deleteRow(this)">X</button>
        </td>
    `;

    tbody.appendChild(tr);
    updateSTT();
}

// =========================
// DELETE ROW
// =========================
function deleteRow(btn) {
    btn.closest("tr").remove();
    updateSTT();
    calcTotal();
}

// =========================
// SEARCH
// =========================
function searchProduct(input) {

    const keyword = removeVietnameseTones(
        input.value.trim().toLowerCase()
    );

    const dropdown = input.nextElementSibling;
    dropdown.innerHTML = "";

    if (!keyword) {
        dropdown.style.display = "none";
        return;
    }

    const keywords = keyword.split(" ").filter(Boolean);

    const products = [];

    data.forEach(item => {

        const tenSP = removeVietnameseTones(
            String(item.TenSP || "").toLowerCase()
        );

        const match = keywords.every(k => tenSP.includes(k));

        if (match && !products.some(p => p.TenSP === item.TenSP)) {
            products.push(item);
        }
    });

    products.forEach(item => {

        const div = document.createElement("div");
        div.className = "dropdown-item";
        div.innerHTML = `<b>${item.TenSP.split("\n")[0]}</b>`;

        div.onclick = () => selectProduct(input, item);

        dropdown.appendChild(div);
    });

    dropdown.style.display = products.length ? "block" : "none";
}

// =========================
// SELECT PRODUCT
// =========================
function selectProduct(input, product) {

    const row = input.closest("tr");

    input.value = product.TenSP;

    const dropdown = input.nextElementSibling;
    dropdown.innerHTML = "";
    dropdown.style.display = "none";

    const select = row.querySelector(".material-select");
    select.innerHTML = '<option value="">-- Chọn --</option>';

    const materials = [
        ...new Set(data
            .filter(x => x.TenSP === product.TenSP)
            .map(x => x.VatLieu)
        )
    ];

    materials.forEach(vl => {
        const opt = document.createElement("option");
        opt.value = vl;
        opt.textContent = vl;
        select.appendChild(opt);
    });

    changeMaterial(select);
}

// =========================
// CHANGE MATERIAL
// =========================
function changeMaterial(select) {

    const row = select.closest("tr");

    const tenSP = row.querySelector(".product-search").value;
    const vatLieu = select.value;

    const item = data.find(x =>
        x.TenSP === tenSP &&
        x.VatLieu === vatLieu
    );

    if (!item) return;

    row.querySelector(".spec").value = item.DacTinh || "";
    row.querySelector(".origin").value = item.XuatXu || "";
    row.querySelector(".unit").textContent = item.DonVi || "";

    row.querySelector(".price").textContent = formatMoney(item.DonGia);
    row.dataset.price = item.DonGia;

    calcRow(row.querySelector("input"));
}

// =========================
// CALC ROW
// =========================
function calcRow(input) {

    const row = input.closest("tr");

    const qty = parseFloat(input.value) || 0;
    const price = parseFloat(row.dataset.price) || 0;

    const amount = qty * price;

    row.querySelector(".amount").textContent = formatMoney(amount);

    calcTotal();
}

// =========================
// TOTAL
// =========================
function calcTotal() {

    let total = 0;

    document.querySelectorAll("#body tr").forEach(row => {

        const qty = parseFloat(row.querySelector("input").value) || 0;
        const price = parseFloat(row.dataset.price) || 0;

        total += qty * price;
    });

    document.getElementById("total").textContent =
        formatMoney(total);
}

// =========================
// LOAD
// =========================
window.onload = async function () {
    await loadData();
    addRow();
};

// =========================
// AUTO HEIGHT TEXTAREA
// =========================
document.addEventListener("input", e => {
    if (e.target.classList.contains("multiline")) {
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
    }
});

// =========================
// BOLD (GIẢ LẬP - CHÈN <b>)
// =========================
function makeBold() {

    const el = document.activeElement;

    if (!el || el.tagName !== "TEXTAREA") return;

    const start = el.selectionStart;
    const end = el.selectionEnd;

    const selected = el.value.substring(start, end);

    const boldText = `<b>${selected}</b>`;

    el.value =
        el.value.substring(0, start) +
        boldText +
        el.value.substring(end);
}

// =========================
// EXPORT EXCEL (GIỮ BOLD)
// =========================
async function exportExcel() {

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("BaoGia");

    sheet.mergeCells("A1:I1");

    const title = sheet.getCell("A1");
    title.value = document.querySelector(".system-input")?.value || "BÁO GIÁ";

    title.font = { bold: true, size: 16 };
    title.alignment = { horizontal: "center" };

    const headers = [
        "STT","Tên SP","VL","KT","SL","ĐV","ĐG","TT","Xuất xứ"
    ];

    sheet.addRow(headers);

    document.querySelectorAll("#body tr").forEach(row => {

        const cells = row.children;

        sheet.addRow([
            cells[0].textContent,
            toExcelRich(cells[1].querySelector("textarea").value),
            cells[2].querySelector("select").value,
            toExcelRich(cells[3].querySelector("textarea").value),
            cells[4].value,
            cells[5].textContent,
            cells[6].textContent,
            cells[7].textContent,
            toExcelRich(cells[8].querySelector("textarea").value)
        ]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "BaoGia.xlsx");
}

// =========================
// HTML → EXCEL RICH TEXT
// =========================
function toExcelRich(text) {

    const div = document.createElement("div");
    div.innerHTML = text || "";

    const result = [];

    div.childNodes.forEach(node => {

        if (node.nodeType === 3) {
            result.push({
                text: node.textContent,
                font: { bold: false }
            });
        }

        if (node.nodeType === 1) {
            result.push({
                text: node.textContent,
                font: node.tagName === "B"
            });
        }
    });

    return { richText: result };
}

// =========================
// REMOVE TONES
// =========================
function removeVietnameseTones(str) {
    if (!str) return "";
    return str.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
}
