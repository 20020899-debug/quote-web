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
// ĐÁNH STT
// =========================
function updateSTT() {
    document.querySelectorAll("#body tr")
        .forEach((row, index) => {
            row.querySelector(".stt").textContent = index + 1;
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
           <textarea
    class="multiline product-search"
    placeholder="Tìm sản phẩm..."
    oninput="searchProduct(this)">
</textarea>

            <div class="dropdown"></div>
        </td>

        <td>
            <select class="material-select"
                    onchange="changeMaterial(this)">
                <option value="">-- Chọn --</option>
            </select>
        </td>

        <td>
            <textarea
    class="multiline spec"
    placeholder="Đặc tính kỹ thuật">
</textarea>
        </td>

        <td>
            <input
                type="number"
                value="1"
                min="0"
                step="0.01"
                oninput="calcRow(this)"
            >
        </td>

        <td class="unit"></td>

        <td class="price">0</td>

        <td class="amount">0</td>

        <td>
    <textarea
    class="multiline origin"
    placeholder="Xuất xứ/Ghi chú">
</textarea>
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
// SEARCH SẢN PHẨM
// =========================
function searchProduct(input) {

    const keyword =
    removeVietnameseTones(
        input.value.trim().toLowerCase()
    );

    const dropdown = input.nextElementSibling;

    dropdown.innerHTML = "";

    if (!keyword) {
        dropdown.style.display = "none";
        return;
    }

    const products = [];

const keywords = keyword
    .split(" ")
    .filter(k => k.trim() !== "");

data.forEach(item => {

    if (!item.TenSP) return;

    const tenSP =
        item.TenSP.toLowerCase();

    const match =
        keywords.every(k =>
            tenSP.includes(k)
        );

    if (match) {

        if (!products.some(
            p => p.TenSP === item.TenSP
        )) {
            products.push(item);
        }

    }

});

   products.forEach(item => {

        const div = document.createElement("div");

        div.className = "dropdown-item";

       div.innerHTML = `
    <b>${item.TenSP}</b>
`;

        div.onclick = () => {
            selectProduct(input, item);
        };

        dropdown.appendChild(div);
    });

    dropdown.style.display =
        products.length ? "block" : "none";
}

// =========================
// CHỌN SẢN PHẨM
// =========================
function selectProduct(input, product) {

    const row = input.closest("tr");

    input.value = product.TenSP;

    const dropdown = input.nextElementSibling;
    dropdown.innerHTML = "";
    dropdown.style.display = "none";

    const materialSelect =
        row.querySelector(".material-select");

    materialSelect.innerHTML =
    '<option value="">-- Chọn --</option>';

    const materials = [
        ...new Set(
            data
    .filter(x => x.TenSP === product.TenSP)
    .map(x => x.VatLieu)
        )
    ];

    materials.forEach(vl => {

        const option =
            document.createElement("option");

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

    const tenSP =
    row.querySelector(".product-search").value;
    const vatLieu = select.value;

    const item = data.find(x =>
        x.TenSP === tenSP &&
        x.VatLieu === vatLieu
);

    if (!item) {

        row.querySelector(".spec").value = "";

        row.querySelector(".unit").textContent = "";

        row.querySelector(".price").textContent = "0";

        row.dataset.price = 0;

        calcRow(
            row.querySelector("input[type='number']")
        );

        return;
    }

    // ===== ĐẶC TÍNH KỸ THUẬT =====

    row.querySelector(".spec").value =
        item.DacTinh || "";
    // ===== XUẤT XỨ/ GHI CHÚ =====
   row.querySelector(".origin").value =
    item.XuatXu || "";
    // ===== ĐƠN VỊ =====

    row.querySelector(".unit").textContent =
        item.DonVi || "";

    // ===== ĐƠN GIÁ =====

    row.querySelector(".price").textContent =
        formatMoney(item.DonGia);

    row.dataset.price = item.DonGia;

    calcRow(
        row.querySelector("input[type='number']")
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

    row.querySelector(".amount").textContent =
        formatMoney(amount);

    calcTotal();
}

// =========================
// TỔNG TIỀN
// =========================
function calcTotal() {

    let total = 0;

    document
        .querySelectorAll("#body tr")
        .forEach(row => {

            const qty =
                parseFloat(
                    row.querySelector(
                        "input[type='number']"
                    ).value
                ) || 0;

            const price =
                parseFloat(row.dataset.price) || 0;

            total += qty * price;
        });

    document.getElementById("total").textContent =
        formatMoney(total);
}

// =========================
// KHỞI TẠO
// =========================
window.onload = async function () {

    await loadData();

    addRow();
};
// =========================
// Ô tự động cao lên khi số dòng tăng
// =========================
document.addEventListener("input", function(e){

    if(
    e.target.classList.contains("multiline")
    ){
        e.target.style.height = "auto";
        e.target.style.height =
            e.target.scrollHeight + "px";
    }

});
// =========================
// XUẤT EXCEL
// =========================
async function exportExcel() {

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("BaoGia");

    // Tiêu đề
    sheet.mergeCells("A1:I1");

    const titleCell = sheet.getCell("A1");

    titleCell.value =
        document.querySelector(".system-input").value ||
        "BÁO GIÁ";

    titleCell.font = {
        bold: true,
        size: 16
    };

    titleCell.alignment = {
        horizontal: "center",
        vertical: "middle"
    };

    // Header
    const headers = [
        "STT",
        "Tên Sản Phẩm",
        "Vật liệu",
        "Đặc tính kỹ thuật",
        "Số lượng",
        "Đơn vị",
        "Đơn giá",
        "Thành tiền",
        "Xuất xứ/Ghi chú"
    ];

    const headerRow = sheet.addRow(headers);

    headerRow.eachCell(cell => {

        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "198754" }
        };

        cell.font = {
            bold: true,
            color: { argb: "000000" }
        };

        cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true
        };

        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
        };
    });

    // Dữ liệu
    document.querySelectorAll("#body tr")
        .forEach(row => {

            const cells = row.children;

            sheet.addRow([
                cells[0].innerText,
                cells[1].querySelector(".product-search")?.value || "",
                cells[2].querySelector("select")?.value || "",
                cells[3].querySelector(".spec")?.value || "",
                cells[4].querySelector("input[type='number']")?.value || "",
                cells[5].innerText,
                cells[6].innerText,
                cells[7].innerText,
                cells[8].querySelector(".origin")?.value || ""
            ]);
        });

    // Format toàn bộ bảng
    sheet.eachRow((row, rowNumber) => {

    if (rowNumber <= 2) return;

    row.eachCell(cell => {

        cell.font = {
            name: "Arial",
            size: 12.5
        };

        cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true
        };

        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
        };
    });

    // Cột G = Đơn giá
    if (row.getCell(7).value) {
        row.getCell(7).font = {
            name: "Times New Roman",
            size: 12.5,
            bold: true
        };

        row.getCell(7).alignment = {
            horizontal: "right",
            vertical: "middle"
        };
    }

    // Cột H = Thành tiền
    if (row.getCell(8).value) {
        row.getCell(8).font = {
            name: "Times New Roman",
            size: 12.5,
            bold: true
        };

        row.getCell(8).alignment = {
            horizontal: "right",
            vertical: "middle"
        };
    }

});
    // Độ rộng cột
    sheet.columns = [
        { width: 8 },
        { width: 35 },
        { width: 18 },
        { width: 40 },
        { width: 12 },
        { width: 12 },
        { width: 18 },
        { width: 18 },
        { width: 25 }
    ];

    // Tổng cộng
    const total =
        document.getElementById("total").innerText;

    const totalRow = sheet.addRow([
        "",
        "",
        "",
        "",
        "",
        "",
        "TỔNG CỘNG",
        total
    ]);

    totalRow.eachCell(cell => {

        cell.font = { bold: true };

        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
        };
    });

    const buffer =
        await workbook.xlsx.writeBuffer();

    saveAs(
        new Blob([buffer]),
        "BaoGia.xlsx"
    );
}

function removeVietnameseTones(str) {

    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
}
