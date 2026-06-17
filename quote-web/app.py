from flask import Flask, render_template, jsonify
import pandas as pd
import os

app = Flask(__name__)

# =========================
# ĐỌC FILE EXCEL
# =========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EXCEL_FILE = os.path.join(BASE_DIR, "bang_gia.xlsx")

print("BASE_DIR =", BASE_DIR)
print("EXCEL_FILE =", EXCEL_FILE)
print("FILE EXISTS =", os.path.exists(EXCEL_FILE))

try:
    df = pd.read_excel(EXCEL_FILE)

    print("Đọc Excel thành công")
    print("Columns:", df.columns.tolist())
    print(df.head())
    print("Số dòng:", len(df))
    print(df.tail(20))

except Exception as e:
    print("LỖI ĐỌC EXCEL:", e)

    # DataFrame rỗng để web không crash
    df = pd.DataFrame(
        columns=[
            "TenSP",
            "VatLieu",
            "DonVi",
            "DonGia",
        ]
    )

# =========================
# TRANG CHỦ
# =========================

@app.route("/")
def index():
    return render_template("index.html")

# =========================
# API DỮ LIỆU
# =========================

@app.route("/data")
def data():

    records = []

    for _, row in df.iterrows():

        try:
            dongia = float(row["DonGia"])
        except:
            dongia = 0

        records.append({
    "TenSP": str(row["TenSP"]).strip(),
    "VatLieu": str(row["VatLieu"]).strip(),
    "DonVi": str(row["DonVi"]).strip(),
    "DonGia": dongia,
    "DacTinh": str(row["DacTinh"]).strip(),
    "XuatXu": str(row["XuatXu"]).strip()
})
    return jsonify(records)

# =========================
# CHẠY APP
# =========================

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
