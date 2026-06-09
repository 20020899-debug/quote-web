let products = [];

async function loadProducts() {
    let res = await fetch("/products");
    products = await res.json();
}

loadProducts();

// thêm dòng mới
function addRow() {
    let body = document.getElementById("body");

    let row = document.createElement("tr");

    row.innerHTML = `
        <td>
            <input type="text" class="search" oninput="searchProduct(this)">
            <div class="dropdown"></div>
        </td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
    `;

    body.appendChild(row);
}

// search autocomplete theo tên sản phẩm
function searchProduct(input) {
    let val = input.value.toLowerCase();
    let dropdown = input.nextElementSibling;

    dropdown.innerHTML = "";

    if (!val) return;

    let matches = products.filter(p =>
        (p["Tên sản phẩm"] || "").toLowerCase().includes(val)
    ).slice(0, 5);

    matches.forEach(item => {
        let div = document.createElement("div");
        div.innerText = `${item["Tên sản phẩm"]} - ${item["Vật liệu"]}`;

        div.onclick = () => {
            fillRow(input, item);
            dropdown.innerHTML = "";
        };

        dropdown.appendChild(div);
    });
}

// fill dữ liệu vào dòng
function fillRow(input, item) {
    let row = input.parentElement.parentElement;

    row.children[0].querySelector("input").value = item["Tên sản phẩm"];
    row.children[1].innerText = item["Mã SP"];
    row.children[2].innerText = item["Vật liệu"];
    row.children[3].innerText = item["ĐVT"];
    row.children[4].innerText = item["Đơn giá"];
}
