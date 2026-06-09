from flask import Flask, render_template, jsonify
import pandas as pd
import os

app = Flask(__name__)

# =========================
# ĐỌC FILE EXCEL
# =========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EXCEL_FILE = os.path.join(BASE_DIR, "bang_gia.xlsx")

try:
    df = pd.read_excel(EXCEL_FILE)

    # Xóa khoảng trắng tên cột
    df.columns = df.columns.str.strip()

    # Thay NaN thành ""
    df = df.fillna("")

    # Ép kiểu để tránh undefined
    for col in df.columns:
        df[col] = df[col].astype(str)

except Exception as e:
    print("Lỗi đọc Excel:", e)

    # DataFrame rỗng để web không crash
    df = pd.DataFrame(
        columns=[
            "MaSP",
            "TenSP",
            "VatLieu",
            "DonVi",
            "DonGia",
            "LoaiTinhGia"
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
            "MaSP": str(row["MaSP"]).strip(),
            "TenSP": str(row["TenSP"]).strip(),
            "VatLieu": str(row["VatLieu"]).strip(),
            "DonVi": str(row["DonVi"]).strip(),
            "DonGia": dongia,
            "LoaiTinhGia": str(row["LoaiTinhGia"]).strip()
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
