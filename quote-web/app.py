from flask import Flask, render_template, request, jsonify
import pandas as pd

app = Flask(__name__)

# Đọc Excel khi khởi động
df = pd.read_excel("bang_gia.xlsx")


@app.route("/")
def home():
    return render_template("index.html")


# Tìm kiếm tên sản phẩm
@app.route("/search")
def search():

    q = request.args.get("q", "").lower()

    products = (
        df["Tên sản phẩm"]
        .dropna()
        .unique()
        .tolist()
    )

    result = [
        p for p in products
        if q in p.lower()
    ]

    return jsonify(result[:20])


# Lấy giá theo sản phẩm + vật liệu
@app.route("/get-price")
def get_price():

    product = request.args.get("product")
    material = request.args.get("material")

    row = df[
        (df["Tên sản phẩm"] == product)
        & (df["Vật liệu"] == material)
    ]

    if len(row) == 0:
        return jsonify({
            "found": False
        })

    row = row.iloc[0]

    return jsonify({
        "found": True,
        "unit": row["ĐVT"],
        "price": float(row["Đơn giá"])
    })


if __name__ == "__main__":
    app.run(debug=True)