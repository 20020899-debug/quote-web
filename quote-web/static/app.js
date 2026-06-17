let data = [];

// =========================
// LOAD DATA
// =========================
async function loadData() {
    try {
        const res = await fetch("/data");
        data = await res.json();
        console.log("Đã load:", data.length, "dòng");
    } catch (err) {
        console.error("Lỗi load data:", err);
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
// THÊM DÒNG
// =========================
function addRow() {

    const tbody = document.getElementById("body");

    const tr = document.createElement("tr");
    tr.dataset.price = 0;

    tr.innerHTML = `
        <td class="stt"></td>

        <td style="position:relative;">
            <div class="multiline product-search"
                 contenteditable="true"
                 oninput="searchProduct(this)"></div>

            <div class="dropdown"></div>
        </td>

        <td>
            <select class="material-select" onchange="changeMaterial(this)">
                <option value="">-- Chọn --</option>
            </select>
        </td>

        <td>
            <div class="multiline spec" contenteditable="true"></div>
        </td>

        <td>
            <input type="number" value="1" min="0" step="0.01"
                   oninput="calcRow(this)">
        </td>

        <td class="unit"></td>

        <td class="price">0</td>

        <td class="amount">0</td>

        <td>
            <div class="multiline origin" contenteditable="true"></div>
        </td>

        <td>
            <button onclick="deleteRow(this)">X</button>
        </td>
    `;

    tbody.appendChild(tr);
    updateSTT();
}

// =========================
// XÓA DÒNG
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
        input.innerText.trim().toLowerCase()
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

        if (!item.TenSP) return;

        const tenSP = removeVietnameseTones(
            String(item.TenSP).toLowerCase()
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
// CHỌN SẢN PHẨM
// =========================
function selectProduct(input, product) {

    const row = input.closest("tr");

    input.innerText = product.TenSP;

    const dropdown = input.nextElementSibling;
    dropdown.innerHTML = "";
    dropdown.style.display = "none";

    const materialSelect = row.querySelector(".material-select");
    materialSelect.innerHTML = '<option value="">-- Chọn --</option>';

    const materials = [
        ...new Set(
            data
                .filter(x => x.TenSP === product.TenSP)
                .map(x => x.VatLieu)
        )
    ];

    materials.forEach(vl => {
        const opt = document.createElement("option");
        opt.value = vl;
        opt.textContent = vl;
        materialSelect.appendChild(opt);
    });

    changeMaterial(materialSelect);
}

// =========================
// ĐỔI VẬT LIỆU
// =========================
function changeMaterial(select) {

    const row = select.closest("tr");

    const tenSP = row.querySelector(".product-search").innerText.trim();
    const vatLieu = select.value;

    const item = data.find(x =>
        x.TenSP === tenSP &&
        x.VatLieu === vatLieu
    );

    if (!item) {
        row.querySelector(".spec").innerText = "";
        row.querySelector(".origin").innerText = "";
        row.querySelector(".unit").textContent = "";
        row.querySelector(".price").textContent = "0";
        row.dataset.price = 0;
        calcRow(row.querySelector("input"));
        return;
    }

    row.querySelector(".spec").innerText = item.DacTinh || "";
    row.querySelector(".origin").innerText = item.XuatXu || "";
    row.querySelector(".unit").textContent = item.DonVi || "";

    row.querySelector(".price").textContent = formatMoney(item.DonGia);
    row.dataset.price = item.DonGia;

    calcRow(row.querySelector("input"));
}

// =========================
// TÍNH DÒNG
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
// TỔNG
// =========================
function calcTotal() {

    let total = 0;

    document.querySelectorAll("#body tr").forEach(row => {

        const qty = parseFloat(row.querySelector("input").value) || 0;
        const price = parseFloat(row.dataset.price) || 0;

        total += qty * price;
    });

    document.getElementById("total").textContent = formatMoney(total);
}

// =========================
// LOAD
// =========================
window.onload = async function () {
    await loadData();
    addRow();
};

// =========================
// AUTO HEIGHT (contenteditable)
// =========================
document.addEventListener("input", e => {
    if (e.target.classList.contains("multiline")) {
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
    }
});

// =========================
// EXPORT EXCEL (GIỮ BOLD)
// =========================
async function exportExcel() {

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("BaoGia");

    sheet.mergeCells("A1:I1");

    const title = sheet.getCell("A1");
    title.value = document.querySelector(".system-input").value || "BÁO GIÁ";
    title.font = { bold: true, size: 16 };
    title.alignment = { horizontal: "center" };

    const headers = [
        "STT","Tên SP","VL","KT","SL","ĐV","ĐG","TT","Xuất xứ"
    ];

    sheet.addRow(headers);

    document.querySelectorAll("#body tr").forEach(row => {

        const cells = row.children;

        sheet.addRow([
            cells[0].innerText,
            toExcelRich(cells[1]),
            cells[2].querySelector("select")?.value || "",
            toExcelRich(cells[3]),
            cells[4].value,
            cells[5].innerText,
            cells[6].innerText,
            cells[7].innerText,
            toExcelRich(cells[8])
        ]);
    });

    sheet.columns = [
        { width: 8 },
        { width: 35 },
        { width: 15 },
        { width: 40 },
        { width: 10 },
        { width: 10 },
        { width: 15 },
        { width: 15 },
        { width: 25 }
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "BaoGia.xlsx");
}

// =========================
// HTML → EXCEL RICH TEXT (GIỮ BOLD)
// =========================
function toExcelRich(cell) {

    const div = document.createElement("div");
    div.innerHTML = cell.innerHTML || "";

    const result = [];

    div.childNodes.forEach(node => {

        if (node.nodeType === 3) {
            result.push({ text: node.textContent, font: { bold: false } });
        }

        if (node.nodeType === 1) {

            const isBold =
                node.tagName === "B" ||
                node.tagName === "STRONG";

            result.push({
                text: node.textContent,
                font: { bold: isBold }
            });
        }
    });

    return { richText: result };
}

// =========================
// REMOVE TONE
// =========================
function removeVietnameseTones(str) {
    if (!str) return "";
    return str.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
}
