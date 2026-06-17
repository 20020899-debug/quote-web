let data = [];

// =========================
// LOAD DATA
// =========================
async function loadData() {
    try {
        data = await (await fetch("/data")).json();
        console.log("Loaded:", data.length);
    } catch (e) {
        console.error(e);
    }
}

// =========================
// UTILS
// =========================
const $ = (el, s) => el.querySelector(s);

function formatMoney(v) {
    return Number(v || 0).toLocaleString("vi-VN");
}

function getRows() {
    return document.querySelectorAll("#body tr");
}

// =========================
// STT
// =========================
function updateSTT() {
    getRows().forEach((r, i) =>
        $(".stt", r).textContent = i + 1
    );
}

// =========================
// ADD ROW
// =========================
function addRow() {

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
        <textarea class="multiline spec"></textarea>
    </td>

    <td>
        <input type="number" value="1" step="0.01" oninput="calcRow(this)">
    </td>

    <td class="unit"></td>
    <td class="price">0</td>
    <td class="amount">0</td>

    <td>
        <textarea class="multiline origin"></textarea>
    </td>

    <td><button onclick="deleteRow(this)">X</button></td>
    `;

    document.getElementById("body").appendChild(tr);
    updateSTT();
}

// =========================
// DELETE
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

    const kw = removeVietnameseTones(
        input.value
            .replace(/<[^>]*>/g, "")   // ⭐ THÊM DÒNG NÀY
            .toLowerCase()
            .trim()
    );

    const dd = input.nextElementSibling;

    dd.innerHTML = "";
    if (!kw) return dd.style.display = "none";

    const keys = kw.split(" ").filter(Boolean);

    const list = data.filter(x =>
    x.TenSP && keys.every(k =>
        removeVietnameseTones(
            x.TenSP.replace(/<[^>]*>/g, "").toLowerCase()
        ).includes(k)
    )
);

    const unique = [...new Map(list.map(x => [x.TenSP, x])).values()];

    unique.forEach(item => {
        const div = document.createElement("div");
        div.className = "dropdown-item";

        // ⭐ cũng nên strip luôn cho an toàn
        const cleanName = item.TenSP.replace(/<[^>]*>/g, "");

        div.innerHTML = `<b>${cleanName.split("\n")[0]}</b>`;

        div.onclick = () => selectProduct(input, item);

        dd.appendChild(div);
    });

    dd.style.display = unique.length ? "block" : "none";
}
// =========================
// SELECT PRODUCT
// =========================
function selectProduct(input, p) {

    const row = input.closest("tr");
    input.value = p.TenSP.replace(/<[^>]*>/g, "");

    const dd = input.nextElementSibling;
    dd.innerHTML = "";
    dd.style.display = "none";

    const sel = $(".material-select", row);
    sel.innerHTML = '<option value="">-- Chọn --</option>';

    [...new Set(data.filter(x => x.TenSP === p.TenSP).map(x => x.VatLieu))]
        .forEach(v => sel.innerHTML += `<option>${v}</option>`);

    changeMaterial(sel);
}

// =========================
// CHANGE MATERIAL
// =========================
function changeMaterial(sel) {

    const row = sel.closest("tr");

    const name = $(".product-search", row).value
        .replace(/<[^>]*>/g, "");   // ⭐ FIX QUAN TRỌNG

    const item = data.find(x =>
        x.TenSP === name && x.VatLieu === sel.value
    );

    if (!item) return;

    $(".spec", row).value = item.DacTinh || "";
    $(".origin", row).value = item.XuatXu || "";
    $(".unit", row).textContent = item.DonVi || "";

    row.dataset.price = item.DonGia || 0;
    $(".price", row).textContent = formatMoney(item.DonGia);

    calcRow($("input", row));
}

// =========================
// CALC
// =========================
function calcRow(input) {

    const row = input.closest("tr");
    const qty = +input.value || 0;
    const price = +row.dataset.price || 0;

    $(".amount", row).textContent = formatMoney(qty * price);
    calcTotal();
}

// =========================
// TOTAL
// =========================
function calcTotal() {

    let t = 0;

    getRows().forEach(r => {
        t += (+$("input", r).value || 0) * (+r.dataset.price || 0);
    });

    document.getElementById("total").textContent = formatMoney(t);
}

// =========================
// INIT
// =========================
window.onload = async () => {
    await loadData();
    addRow();
};

// =========================
// AUTO HEIGHT
// =========================
document.addEventListener("input", e => {
    if (e.target.classList.contains("multiline")) {
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
    }
});

// =========================
// REMOVE TONE
// =========================
function removeVietnameseTones(s) {
    return (s || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
}
// =========================
// BÔI đậm
// =========================
document.addEventListener("keydown", function (e) {

    if (!(e.ctrlKey && e.key.toLowerCase() === "b")) return;

    const el = document.activeElement;

    if (!el || !el.classList.contains("product-search")) return;

    e.preventDefault();

    toggleBoldTextarea(el);
});
function toggleBoldTextarea(input) {

    const start = input.selectionStart;
    const end = input.selectionEnd;

    if (start === end) return;

    const text = input.value;

    const selected = text.substring(start, end);

    // ⭐ tránh lồng <b>
    const clean = selected
        .replace(/<b>/g, "")
        .replace(/<\/b>/g, "");

    const wrapped = `<b>${clean}</b>`;

    input.value =
        text.substring(0, start) +
        wrapped +
        text.substring(end);
}
function toExcelRich(text) {

    const div = document.createElement("div");
    div.innerHTML = text || "";

    const result = [];

    div.childNodes.forEach(n => {

        if (n.nodeType === 3) {
            result.push({ text: n.textContent, font: { bold: false } });
        }

        if (n.nodeType === 1) {
            result.push({
                text: n.textContent,
                font: {
    bold: n.tagName === "B" || n.tagName === "STRONG"
}
            });
        }
    });

    return { richText: result };
}
