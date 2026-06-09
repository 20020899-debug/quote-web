from flask import Flask, render_template, jsonify
import pandas as pd

app = Flask(__name__)

df = pd.read_excel("bang_gia.xlsx")
df.columns = [c.strip() for c in df.columns]
df = df.fillna("")

@app.route("/")
def index():
    return render_template("index.html")


# lấy danh sách để search autocomplete
@app.route("/products")
def products():
    return jsonify(df.to_dict(orient="records"))


if __name__ == "__main__":
    app.run(debug=True)
