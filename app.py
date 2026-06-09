from flask import Flask, render_template, request, jsonify
import pandas as pd

app = Flask(__name__)

# Load Excel
df = pd.read_excel("bang_gia.xlsx")
df.columns = [c.strip() for c in df.columns]

# Ép kiểu string để search ổn định
for col in df.columns:
    df[col] = df[col].astype(str)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/search")
def search():
    keyword = request.args.get("q", "").lower().strip()

    data = df

    if keyword:
        data = data[
            data["Mã SP"].str.lower().str.contains(keyword) |
            data["Tên sản phẩm"].str.lower().str.contains(keyword) |
            data["Vật liệu"].str.lower().str.contains(keyword)
        ]

    return jsonify(data.to_dict(orient="records"))


@app.route("/all")
def all_data():
    return jsonify(df.to_dict(orient="records"))


if __name__ == "__main__":
    app.run(debug=True)