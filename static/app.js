async function search() {
    let q = document.getElementById("keyword").value;

    let res = await fetch(`/search?q=${q}`);
    let data = await res.json();

    render(data);
}

async function loadAll() {
    let res = await fetch(`/all`);
    let data = await res.json();

    render(data);
}

function render(data) {
    let header = document.getElementById("header");
    let body = document.getElementById("body");

    header.innerHTML = "";
    body.innerHTML = "";

    if (data.length === 0) return;

    // tạo header
    Object.keys(data[0]).forEach(k => {
        let th = document.createElement("th");
        th.innerText = k;
        header.appendChild(th);
    });

    // tạo rows
    data.forEach(row => {
        let tr = document.createElement("tr");

        Object.values(row).forEach(v => {
            let td = document.createElement("td");
            td.innerText = v;
            tr.appendChild(td);
        });

        body.appendChild(tr);
    });
}