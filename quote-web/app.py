from flask import Flask, render_template, request, jsonify
import pandas as pd

app = Flask(__name__)

df = pd.read_excel("bang_gia.xlsx")
df.columns = df.columns.str.strip()

df["Mã SP"] = df["Mã SP"].astype(str)
df["Tên sản phẩm"] = df["Tên sản phẩm"].astype(str)
df["Vật liệu"] = df["Vật liệu"].astype(str)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/search")
def search():
    q = request.args.get("q", "").lower()

    temp = df[["Mã SP", "Tên sản phẩm"]].drop_duplicates()

    result = []
    for _, row in temp.iterrows():
        if q in row["Tên sản phẩm"].lower():
            result.append({
                "code": row["Mã SP"],
                "name": row["Tên sản phẩm"]
            })

    return jsonify(result[:10])


@app.route("/get-price")
def get_price():
    code = request.args.get("code")
    material = request.args.get("material")

    row = df[
        (df["Mã SP"] == code) &
        (df["Vật liệu"] == material)
    ]

    if row.empty:
        return jsonify({"found": False})

    row = row.iloc[0]

    return jsonify({
        "found": True,
        "unit": row["ĐVT"],
        "price": float(row["Đơn giá"])
    })


if __name__ == "__main__":
    app.run(debug=True)