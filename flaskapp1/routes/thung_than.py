import math
from flask import Blueprint, render_template, request

thung_bp = Blueprint("thung", __name__)

THEP = 7850
THAN = 550
MM3 = 1_000_000_000


def fm(v):
    return f"{v:,.2f}"


def get_float(name):
    try:
        return float(request.form.get(name, 0))
    except:
        return 0


@thung_bp.route("/thung-than", methods=["GET", "POST"])
def thung_than():

    ket_qua = ""

    if request.method == "POST":

        try:

            L_tong = get_float("Chiều dài tổng")
            L_thung = get_float("Chiều dài thùng")
            Rong = get_float("Chiều rộng")
            Cao = get_float("Chiều cao")
            Day = get_float("Độ dày tôn")
            Dau_vao = get_float("Kích thước đầu vào")

            U100 = get_float("U100x50")
            U150 = get_float("U150x75")

            so_tang = get_float("Số tầng")
            day_than = get_float("Chiều dày lớp than")

            dai_khay = get_float("Dài khay")
            rong_khay = get_float("Rộng khay")
            cao_khay = get_float("Cao khay")
            so_khay = get_float("Số khay")
            so_tang_khay = get_float("Số tầng khay")
            day_khay = get_float("Độ dày khay")
            dai_tong_khay = get_float("Chiều dài tổng khay")

            so_tam_loc = get_float("Số tấm lọc")

            kl_than_giua = (
                (L_thung * Rong * 2 + L_thung * Cao * 2)
                * Day * THEP / MM3
            )

            kl_2_dau = (
                (
                    (
                        (Rong + Dau_vao) / 2
                        * math.sqrt(
                            ((Rong - Dau_vao) / 2) ** 2
                            + ((L_tong - L_thung) / 2) ** 2
                        )
                        +
                        (Cao + Dau_vao) / 2
                        * math.sqrt(
                            ((Cao - Dau_vao) / 2) ** 2
                            + ((L_tong - L_thung) / 2) ** 2
                        )
                    ) * 4
                    + Rong * Cao
                )
                * Day * THEP / MM3
            )

            kl_chan = U100 / 1000 * 9.35 + U150 / 1000 * 19

            kl_san = (
                (
                    80 * 3 *
                    (
                        L_thung * Rong / 500
                        + Rong * L_thung / 500
                    )
                    * so_tang * THEP / MM3
                )
                +
                L_thung * Rong * 11 * so_tang / 1_000_000
            )

            kl_tang_cung = (
                Rong * L_thung / 550
                * 2 * 100 * Day * THEP / MM3
            )

            kl_than = (
                L_thung * Rong
                * day_than * THAN
                * so_tang / MM3
            )

            kl_khay = (
                (
                    (
                        dai_khay * (cao_khay + 35) * 2 +
                        rong_khay * (cao_khay + 40) +
                        (cao_khay + 115) * rong_khay +
                        (cao_khay + 150) * (rong_khay + 35) +
                        dai_khay * (cao_khay + 60) * 2
                    ) * so_khay
                    +
                    dai_khay * (
                        L_thung * so_tang_khay
                        - so_khay * rong_khay
                        - (L_thung - dai_tong_khay)
                        * so_tang_khay
                    )
                )
                * day_khay * THEP / MM3
                +
                11 * 2 * so_khay
                * dai_khay * rong_khay
                / 1_000_000
            )

            kl_loc = (
                (
                    149 * Cao * Day
                    + 128 * Rong * Day * 2
                    + 108 * Rong * Day * 2
                    + 54 * Cao * Day * 4
                )
                * THEP / MM3
                * so_tam_loc
            )

            tong = (
                kl_than_giua
                + kl_2_dau
                + kl_chan
                + kl_san
                + kl_tang_cung
                + kl_khay
                + kl_loc
            )

            ket_qua = f"""
THÂN GIỮA : {fm(kl_than_giua)} Kg
2 ĐẦU     : {fm(kl_2_dau)} Kg
CHÂN ĐẾ   : {fm(kl_chan)} Kg
SÀN       : {fm(kl_san)} Kg
TĂNG CỨNG : {fm(kl_tang_cung)} Kg
THAN      : {fm(kl_than)} Kg
KHAY      : {fm(kl_khay)} Kg
KHUNG LỌC : {fm(kl_loc)} Kg

------------------------

TỔNG THÉP : {fm(tong)} Kg
"""

        except Exception as e:
            ket_qua = f"Lỗi: {e}"

    return render_template(
        "thung_than.html",
        ket_qua=ket_qua,
        form=request.form,
        active_page="thung"
    )