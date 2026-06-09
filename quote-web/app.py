from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

# load bảng giá
with open("price_list.json", "r", encoding="utf-8") as f:
    PRICE_LIST = json.load(f)


@app.route("/")
def home():
    return render_template("index.html")


# API lấy đơn giá vật liệu
@app.route("/get-price")
def get_price():
    material = request.args.get("material")

    price = PRICE_LIST.get(material, 0)

    return jsonify({
        "material": material,
        "price": price
    })


if __name__ == "__main__":
    app.run(debug=True)